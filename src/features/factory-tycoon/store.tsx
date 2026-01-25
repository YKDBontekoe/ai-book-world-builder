'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode, useState, useRef } from 'react';
import { GameState, BuildingEntity, BuildingType, Direction, Resource } from './types';
import { INITIAL_STATE, BUILDINGS, TICK_RATE_MS, TECHS, RESOURCE_VALUES } from './config';
import { simulateTick, calculateCapacity } from './engine';
import { nanoid } from 'nanoid';
import { saveGameState, loadGameState } from './actions';
import { toast } from 'sonner';

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
        const buildingIndex = state.buildings.findIndex(b => b.x === action.x && b.y === action.y);
        if (buildingIndex === -1) return state;

        const building = state.buildings[buildingIndex];
        const config = BUILDINGS[building.type];
        const newInventory = { ...state.inventory };
        let interacted = false;

        // 1. Belt Pickup (Single Item)
        if (building.type === 'Belt' && building.beltItems && building.beltItems.length > 0) {
             const item = building.beltItems[0];
             if (item.resource !== 'cash' && item.resource !== 'science') {
                 newInventory[item.resource] = (newInventory[item.resource] || 0) + 1;
                 
                 const newBuildings = [...state.buildings];
                 newBuildings[buildingIndex] = {
                     ...building,
                     beltItems: building.beltItems.slice(1)
                 };
                 
                 return {
                     ...state,
                     inventory: newInventory,
                     buildings: newBuildings
                 };
             }
        }

        // 2. Machine Output Collection (All Items)
        if (building.localInventory && config.outputs) {
             const outputRes = Object.keys(config.outputs)[0] as Resource;
             if (outputRes && building.localInventory[outputRes] && building.localInventory[outputRes]! > 0) {
                 
                 if (outputRes !== 'cash' && outputRes !== 'science') {
                     const validRes = outputRes as keyof GameState['inventory'];
                     const amount = building.localInventory[validRes] || 0;
                     
                     // Transfer ALL
                     newInventory[validRes] = (newInventory[validRes] || 0) + amount;

                     const newBuildings = [...state.buildings];
                     newBuildings[buildingIndex] = {
                         ...building,
                         localInventory: {
                             ...building.localInventory,
                             [validRes]: 0
                         }
                     };
                     
                     return {
                         ...state,
                         inventory: newInventory,
                         buildings: newBuildings
                     };
                 }
             }
        }
        
        return state;
    }
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [isRunning, setIsRunning] = useState(false); // Start paused until loaded
  const [isLoading, setIsLoading] = useState(true);
  const stateRef = useRef(state); // Keep ref for interval closures

  // Keep ref updated
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
                }
                setIsLoading(false);
                setIsRunning(true);
            }
        } catch (error) {
            console.error("Failed to load game", error);
            if (mounted) {
                setIsLoading(false);
                setIsRunning(true); // Start fresh if fail
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
      // Feedback Logic
      const b = state.buildings.find(b => b.x === x && b.y === y);
      if (b) {
          const config = BUILDINGS[b.type];
          // Belt Feedback
          if (b.type === 'Belt' && b.beltItems && b.beltItems.length > 0) {
               const item = b.beltItems[0];
               toast.success(`Picked up 1 ${item.resource}`);
          }
          // Machine Feedback
          else if (b.localInventory && config.outputs) {
               const outputRes = Object.keys(config.outputs)[0] as Resource;
               if (outputRes && b.localInventory[outputRes] && b.localInventory[outputRes]! > 0) {
                    const amount = b.localInventory[outputRes];
                    toast.success(`Collected ${amount} ${outputRes}`);
               }
          }
      }
      
      dispatch({ type: 'MANUAL_INTERACT', x, y });
  }, [state.buildings]);
  
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
