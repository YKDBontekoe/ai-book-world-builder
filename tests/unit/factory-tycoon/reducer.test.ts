import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gameReducer, Action } from '@/features/factory-tycoon/reducer';
import { INITIAL_STATE } from '@/features/factory-tycoon/config';
import { GameState } from '@/features/factory-tycoon/types';

// Mock dependencies
vi.mock('@/features/factory-tycoon/engine', () => ({
  simulateTick: vi.fn((state) => ({ ...state, tickCount: state.tickCount + 1 })),
  calculateCapacity: vi.fn(() => 100),
}));

vi.mock('@/features/factory-tycoon/systems/interactionSystem', () => ({
  processInteraction: vi.fn((state) => ({ ...state, cash: state.cash + 1 })),
}));

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id'),
}));

describe('gameReducer', () => {
  let state: GameState;

  beforeEach(() => {
    state = { ...INITIAL_STATE, cash: 1000 }; // Start with plenty of cash
  });

  it('should handle ADD_BUILDING', () => {
    const action: Action = { type: 'ADD_BUILDING', buildingType: 'Mine', x: 0, y: 0 };
    const newState = gameReducer(state, action);

    expect(newState.buildings).toHaveLength(1);
    expect(newState.buildings[0]).toEqual(expect.objectContaining({
      id: 'test-id',
      type: 'Mine',
      x: 0,
      y: 0,
      status: 'IDLE'
    }));
    expect(newState.cash).toBe(1000 - 10); // Mine cost is 10
  });

  it('should prevent ADD_BUILDING if insufficient funds', () => {
    state.cash = 0;
    const action: Action = { type: 'ADD_BUILDING', buildingType: 'Mine', x: 0, y: 0 };
    const newState = gameReducer(state, action);

    expect(newState.buildings).toHaveLength(0);
    expect(newState.cash).toBe(0);
  });

  it('should prevent ADD_BUILDING if location is occupied', () => {
    state.buildings = [{ id: 'existing', type: 'Mine', x: 0, y: 0, status: 'IDLE', direction: 'N' }];
    const action: Action = { type: 'ADD_BUILDING', buildingType: 'Mine', x: 0, y: 0 };
    const newState = gameReducer(state, action);

    expect(newState.buildings).toHaveLength(1);
  });

  it('should handle REMOVE_BUILDING', () => {
    state.buildings = [{ id: 'test-id', type: 'Mine', x: 0, y: 0, status: 'IDLE', direction: 'N' }];
    const action: Action = { type: 'REMOVE_BUILDING', id: 'test-id' };
    const newState = gameReducer(state, action);

    expect(newState.buildings).toHaveLength(0);
  });

  it('should handle ROTATE_BUILDING', () => {
    state.buildings = [{ id: 'test-id', type: 'Mine', x: 0, y: 0, status: 'IDLE', direction: 'N' }];
    const action: Action = { type: 'ROTATE_BUILDING', id: 'test-id' };

    let newState = gameReducer(state, action);
    expect(newState.buildings[0].direction).toBe('E');

    newState = gameReducer(newState, action);
    expect(newState.buildings[0].direction).toBe('S');
  });

  it('should handle TICK', () => {
    const action: Action = { type: 'TICK' };
    const newState = gameReducer(state, action);
    expect(newState.tickCount).toBe(state.tickCount + 1);
  });

  it('should handle SELL_RESOURCE', () => {
    state.inventory.ore = 10;
    const action: Action = { type: 'SELL_RESOURCE', resource: 'ore' };
    const newState = gameReducer(state, action);

    expect(newState.inventory.ore).toBe(9);
    expect(newState.cash).toBe(1000 + 1); // Ore value is 1
  });

  it('should handle RESEARCH_TECH', () => {
    state.science = 100;
    const action: Action = { type: 'RESEARCH_TECH', techId: 'mass_production' };
    const newState = gameReducer(state, action);

    expect(newState.researchedTechs).toContain('mass_production');
    expect(newState.science).toBe(100 - 10); // Cost is 10
    expect(newState.unlockedBuildings).toContain('Factory');
  });

  it('should prevent RESEARCH_TECH if insufficient science', () => {
    state.science = 0;
    const action: Action = { type: 'RESEARCH_TECH', techId: 'mass_production' };
    const newState = gameReducer(state, action);

    expect(newState.researchedTechs).not.toContain('mass_production');
  });

  it('should handle MANUAL_INTERACT', () => {
    const action: Action = { type: 'MANUAL_INTERACT', x: 0, y: 0 };
    const newState = gameReducer(state, action);
    expect(newState.cash).toBe(state.cash + 1); // Mocked
  });
});
