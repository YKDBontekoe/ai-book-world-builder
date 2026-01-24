import { describe, it, expect } from 'vitest';
import { simulateTick } from '../../../src/features/factory-tycoon/engine';
import { INITIAL_STATE } from '../../../src/features/factory-tycoon/config';
import { GameState, BuildingEntity } from '../../../src/features/factory-tycoon/types';

describe('Factory Tycoon Engine', () => {
  it('Mine produces ore when capacity allows', () => {
    const mine: BuildingEntity = { id: '1', type: 'Mine', x: 0, y: 0, status: 'IDLE', direction: 'N' };
    const state: GameState = {
      ...INITIAL_STATE,
      buildings: [mine],
      inventory: { ...INITIAL_STATE.inventory },
    };

    const nextState = simulateTick(state);
    
    expect(nextState.buildings[0].status).toBe('RUNNING');
    // Output goes to local inventory
    expect(nextState.buildings[0].localInventory?.ore).toBe(1);
    // Global inventory remains unchanged for ore production (unless picked up)
    expect(nextState.inventory.ore).toBe(0);
    expect(nextState.lastTickDelta.ore).toBe(0);
  });

  it('Smelter converts ore->ingot only when ore >= 2', () => {
    const smelter: BuildingEntity = { id: '1', type: 'Smelter', x: 0, y: 0, status: 'IDLE', direction: 'N' };
    
    // Case 1: Not enough ore
    let state: GameState = {
        ...INITIAL_STATE,
        buildings: [smelter],
        inventory: { ore: 1, ingot: 0, gadget: 0 },
        science: 0,
    };
    state = simulateTick(state);
    expect(state.buildings[0].status).toBe('STARVED');
    expect(state.buildings[0].localInventory?.ingot).toBeUndefined();
    
    // Case 2: Enough ore
    state = {
        ...INITIAL_STATE,
        buildings: [smelter],
        inventory: { ore: 2, ingot: 0, gadget: 0 },
        science: 0,
    };
    state = simulateTick(state);
    expect(state.buildings[0].status).toBe('RUNNING');
    expect(state.inventory.ore).toBe(0); // 2 - 2 (Consumed from global)
    expect(state.buildings[0].localInventory?.ingot).toBe(1); // Produced to local
  });

  it('Blocked behavior: if inventory is at capacity, producers become BLOCKED', () => {
     // Mines output to local inventory. Capacity is per-slot (50).
     const mine: BuildingEntity = {
         id: '1', type: 'Mine', x: 0, y: 0, status: 'IDLE', direction: 'N',
         localInventory: { ore: 50 }
     };
     const state: GameState = {
         ...INITIAL_STATE,
         buildings: [mine],
     };
     
     const nextState = simulateTick(state);
     expect(nextState.buildings[0].status).toBe('BLOCKED');
     expect(nextState.buildings[0].localInventory?.ore).toBe(50); // No change
  });
  
  it('Market converts gadget->cash', () => {
      const market: BuildingEntity = { id: '1', type: 'Market', x: 0, y: 0, status: 'IDLE', direction: 'N' };
      const state: GameState = {
          ...INITIAL_STATE,
          inventory: { ore: 0, ingot: 0, gadget: 1 },
          buildings: [market],
          cash: 0,
      };
      
      const nextState = simulateTick(state);
      expect(nextState.buildings[0].status).toBe('RUNNING');
      expect(nextState.inventory.gadget).toBe(0);
      expect(nextState.cash).toBe(5);
  });

  it('Multiple buildings respect shared input limits', () => {
      // 2 Smelters, but only 3 Ore. (Need 4 total)
      // Only one should run.
      const s1: BuildingEntity = { id: 'A', type: 'Smelter', x: 0, y: 0, status: 'IDLE', direction: 'N' };
      const s2: BuildingEntity = { id: 'B', type: 'Smelter', x: 1, y: 0, status: 'IDLE', direction: 'N' };
      
      const state: GameState = {
          ...INITIAL_STATE,
          inventory: { ore: 3, ingot: 0, gadget: 0 },
          buildings: [s1, s2],
      };
      
      const nextState = simulateTick(state);
      
      // Sorted by ID: A runs, B starves.
      const resS1 = nextState.buildings.find(b => b.id === 'A');
      const resS2 = nextState.buildings.find(b => b.id === 'B');
      
      expect(resS1?.status).toBe('RUNNING');
      expect(resS2?.status).toBe('STARVED');
      
      expect(nextState.inventory.ore).toBe(1); // 3 - 2
      expect(resS1?.localInventory?.ingot).toBe(1); // +1 local
      expect(resS2?.localInventory?.ingot).toBeUndefined(); // 0 local
  });

  it('TradingPost converts ingot->cash', () => {
      const tp: BuildingEntity = { id: '1', type: 'TradingPost', x: 0, y: 0, status: 'IDLE', direction: 'N' };
      const state: GameState = {
          ...INITIAL_STATE,
          inventory: { ore: 0, ingot: 1, gadget: 0 },
          buildings: [tp],
          cash: 0,
      };
      
      const nextState = simulateTick(state);
      expect(nextState.buildings[0].status).toBe('RUNNING');
      expect(nextState.inventory.ingot).toBe(0);
      expect(nextState.cash).toBe(2);
  });

  it('Lab converts ingot->science', () => {
      const lab: BuildingEntity = { id: '1', type: 'Lab', x: 0, y: 0, status: 'IDLE', direction: 'N' };
      const state: GameState = {
          ...INITIAL_STATE,
          inventory: { ore: 0, ingot: 1, gadget: 0 },
          science: 0,
          buildings: [lab],
      };
      
      const nextState = simulateTick(state);
      expect(nextState.buildings[0].status).toBe('RUNNING');
      expect(nextState.inventory.ingot).toBe(0);
      expect(nextState.science).toBe(1);
  });
});
