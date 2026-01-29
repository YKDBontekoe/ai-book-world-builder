'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode, useState, useRef } from 'react';
import { GameState, BuildingEntity, BuildingType, Direction, Resource } from './types';
import { INITIAL_STATE, BUILDINGS, TICK_RATE_MS, TECHS, RESOURCE_VALUES } from './config';
import { simulateTick, calculateCapacity } from './engine';
import { nanoid } from 'nanoid';
import { saveGameState, loadGameState } from './actions';
import { toast } from 'sonner';
import { getInteractionResult, processInteraction } from './systems/interactionSystem';

type Action =
  | { type: 'TICK' }
  | { type: 'ADD_BUILDING'; buildingType: BuildingType; x: number; y: number; direction?: Direction }
  | { type: 'REMOVE_BUILDING'; id: string }
  | { type: 'ROTATE_BUILDING'; id: string }
  | { type: 'SET_STATE'; payload: GameState }
  | { type: 'RESEARCH_TECH'; techId: string }
  | { type: 'SELL_RESOURCE'; resource: keyof GameState['inventory'] }
  | { type: 'MANUAL_INTERACT'; x: number; y: number };

const GameContext = createContext<{
  state: GameState;
  addBuilding: (type: BuildingType, x: number, y: number, direction?: Direction) => void;
  removeBuilding: (id: string) => void;
  rotateBuilding: (id: string) => void;
  manualInteract: (x: number, y: number) => void;
  researchTech: (techId: string) => void;
  sellResource: (resource: keyof GameState['inventory']) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  isLoading: boolean;
  forceSave: () => Promise<void>;
} | null>(null);

function getNextDirection(dir: Direction): Direction {
  const dirs: Direction[] = ['N', 'E', 'S', 'W'];
  const idx = dirs.indexOf(dir);
  return dirs[(idx + 1) % 4];
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'TICK':
      return simulateTick(state);
    case 'SELL_RESOURCE': {
      const value = RESOURCE_VALUES[action.resource];
      if (!value) return state;
      if (state.inventory[action.resource] < 1) return state;

      return {
        ...state,
        cash: state.cash + value,
        inventory: {
          ...state.inventory,
          [action.resource]: state.inventory[action.resource] - 1,
        },
      };
    }
    case 'ADD_BUILDING': {
      const config = BUILDINGS[action.buildingType];
      if (state.cash < config.cost) return state; 

      if (state.buildings.some(b => b.x === action.x && b.y === action.y)) return state;

      const newBuilding: BuildingEntity = {
        id: nanoid(),
        type: action.buildingType,
        x: action.x,
        y: action.y,
        status: 'IDLE',
        direction: action.direction || 'N',
      };
      
      const newBuildings = [...state.buildings, newBuilding];
      
      return {
        ...state,
        cash: state.cash - config.cost,
        buildings: newBuildings,
        capacity: calculateCapacity(newBuildings), 
      };
    }
    case 'REMOVE_BUILDING': {
      const newBuildings = state.buildings.filter(b => b.id !== action.id);
      return {
        ...state,
        buildings: newBuildings,
        capacity: calculateCapacity(newBuildings), 
      };
    }
    case 'ROTATE_BUILDING': {
      const newBuildings = state.buildings.map(b => {
        if (b.id === action.id) {
          return { ...b, direction: getNextDirection(b.direction) };
        }
        return b;
      });
      return {
        ...state,
        buildings: newBuildings,
      };
    }
    case 'RESEARCH_TECH': {
      const tech = Object.values(TECHS).find(t => t.id === action.techId);
      if (!tech) return state;
      if (state.researchedTechs.includes(tech.id)) return state;
      if (state.science < tech.cost) return state;

      const newUnlocked = [...state.unlockedBuildings];
      if (tech.unlocks) {
          tech.unlocks.forEach(b => {
              if (!newUnlocked.includes(b)) newUnlocked.push(b);
          });
      }

      return {
          ...state,
          science: state.science - tech.cost,
          researchedTechs: [...state.researchedTechs, tech.id],
          unlockedBuildings: newUnlocked
      };
    }
    case 'SET_STATE':
        return action.payload;
    case 'MANUAL_INTERACT': {
        return processInteraction(state, action.x, action.y);
    }
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const stateRef = useRef(state);

  useEffect(() => {
      stateRef.current = state;
  }, [state]);

  // Initial Load
  useEffect(() => {
    let mounted = true;
    
    async function init() {
        try {
            const result = await loadGameState();
            if (mounted) {
                if (result.success && result.data) {
                    dispatch({ type: 'SET_STATE', payload: result.data });
                    toast.success('Game loaded successfully');
                } else if (!result.success) {
                    // Start fresh but warn
                    toast.error(`Failed to load save: ${result.error}`);
                    // Optionally could wipe save here but safer to let them start fresh in memory
                }
                setIsLoading(false);
                setIsRunning(true);
            }
        } catch (error) {
            console.error("Failed to load game", error);
            if (mounted) {
                setIsLoading(false);
                setIsRunning(true);
            }
        }
    }
    
    init();
    
    return () => { mounted = false; };
  }, []);

  // Simulation Loop
  useEffect(() => {
    if (!isRunning || isLoading) return;
    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, TICK_RATE_MS);
    return () => clearInterval(interval);
  }, [isRunning, isLoading]);

  // Auto-Save Interval (every 10 seconds)
  useEffect(() => {
      if (isLoading) return;
      
      const saveInterval = setInterval(async () => {
          if (!stateRef.current) return;
          try {
              const result = await saveGameState(stateRef.current);
              if (!result.success) {
                  console.error("Auto-save failed", result.error);
              }
          } catch (e) {
              console.error("Auto-save failed", e);
          }
      }, 10000);
      
      return () => clearInterval(saveInterval);
  }, [isLoading]);

  const addBuilding = useCallback((type: BuildingType, x: number, y: number, direction?: Direction) => {
    dispatch({ type: 'ADD_BUILDING', buildingType: type, x, y, direction });
  }, []);

  const removeBuilding = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_BUILDING', id });
  }, []);

  const rotateBuilding = useCallback((id: string) => {
    dispatch({ type: 'ROTATE_BUILDING', id });
  }, []);

  const manualInteract = useCallback((x: number, y: number) => {
      // Gebruik stateRef om te voorkomen dat manualInteract bij elke state change (tick) opnieuw wordt aangemaakt
      const result = getInteractionResult(stateRef.current, x, y);
      if (result) {
          toast.success(`Collected ${result.amount} ${result.resource}`);
      }
      
      dispatch({ type: 'MANUAL_INTERACT', x, y });
  }, []);
  
  const researchTech = useCallback((techId: string) => {
    dispatch({ type: 'RESEARCH_TECH', techId });
  }, []);

  const sellResource = useCallback((resource: keyof GameState['inventory']) => {
    dispatch({ type: 'SELL_RESOURCE', resource });
  }, []);

  const forceSave = useCallback(async () => {
      const result = await saveGameState(stateRef.current);
      if (result.success) {
          toast.success('Game saved');
      } else {
          toast.error('Failed to save game');
          console.error(result.error);
      }
  }, []);

  return (
    <GameContext.Provider value={{ 
        state, 
        addBuilding, 
        removeBuilding,
        rotateBuilding,
        manualInteract,
        researchTech,
        sellResource,
        isRunning, 
        setIsRunning,
        isLoading,
        forceSave
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
