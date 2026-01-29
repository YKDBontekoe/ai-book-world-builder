'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode, useState, useRef } from 'react';
import { GameState, BuildingType, Direction } from './types';
import { INITIAL_STATE, TICK_RATE_MS } from './config';
import { saveGameState, loadGameState } from './actions';
import { toast } from 'sonner';
import { getInteractionResult } from './systems/interactionSystem';
import { gameReducer } from './reducer';

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

export function GameProvider({
  children,
  loadGameAction = loadGameState,
  saveGameAction = saveGameState
}: {
  children: ReactNode;
  loadGameAction?: typeof loadGameState;
  saveGameAction?: typeof saveGameState;
}) {
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
            const result = await loadGameAction();
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
  }, [loadGameAction]);

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
              const result = await saveGameAction(stateRef.current);
              if (!result.success) {
                  console.error("Auto-save failed", result.error);
              }
          } catch (e) {
              console.error("Auto-save failed", e);
          }
      }, 10000);
      
      return () => clearInterval(saveInterval);
  }, [isLoading, saveGameAction]);

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
      const result = await saveGameAction(stateRef.current);
      if (result.success) {
          toast.success('Game saved');
      } else {
          toast.error('Failed to save game');
          console.error(result.error);
      }
  }, [saveGameAction]);

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
