import { describe, expect, it } from 'vitest';
import { BELT_SPEED } from '../../../src/features/factory-tycoon/config';
import { simulateTick } from '../../../src/features/factory-tycoon/engine';
import { BuildingEntity, GameState } from '../../../src/features/factory-tycoon/types';

const INITIAL_STATE: GameState = {
  cash: 0,
  science: 0,
  inventory: { ore: 0, ingot: 0, gadget: 0 },
  capacity: 100,
  buildings: [],
  tickCount: 0,
  lastTickDelta: {},
  unlockedBuildings: [],
  researchedTechs: [],
};

describe('Transport System', () => {
  it('Belt moves items forward', () => {
    const belt1: BuildingEntity = {
        id: 'b1', type: 'Belt', x: 0, y: 0, direction: 'E', status: 'RUNNING',
        beltItems: [{ id: 'i1', resource: 'ore', position: 0 }]
    };

    let state = { ...INITIAL_STATE, buildings: [belt1] };

    // Tick 1
    state = simulateTick(state);
    expect(state.buildings[0].beltItems?.[0].position).toBeCloseTo(BELT_SPEED);

    // Tick 2
    state = simulateTick(state);
    expect(state.buildings[0].beltItems?.[0].position).toBeCloseTo(BELT_SPEED * 2);
  });

  it('Belt transfers to next belt', () => {
     const belt1: BuildingEntity = {
        id: 'b1', type: 'Belt', x: 0, y: 0, direction: 'E', status: 'RUNNING',
        beltItems: [{ id: 'i1', resource: 'ore', position: 0.9 }]
    };
    const belt2: BuildingEntity = {
        id: 'b2', type: 'Belt', x: 1, y: 0, direction: 'E', status: 'RUNNING',
        beltItems: []
    };

    // BELT_SPEED is 0.2. 0.9 + 0.2 = 1.1 >= 1.0. Should transfer.

    let state = { ...INITIAL_STATE, buildings: [belt1, belt2] };
    state = simulateTick(state);

    const b1 = state.buildings.find(b => b.id === 'b1');
    const b2 = state.buildings.find(b => b.id === 'b2');

    expect(b1?.beltItems).toHaveLength(0);
    expect(b2?.beltItems).toHaveLength(1);
    // Because b1 is processed before b2, the item moves to b2 (pos 0) then moves on b2 (pos 0.2) in the same tick.
    expect(b2?.beltItems?.[0].position).toBeCloseTo(BELT_SPEED);
  });

  it('Inserter moves item from Box to Belt', () => {
      // Box at (0,0) with Ore.
      // Inserter at (1,0) facing East (taking from West/Box).
      // Belt at (2,0).

      const box: BuildingEntity = {
          id: 'box', type: 'Warehouse', x: 0, y: 0, direction: 'N', status: 'IDLE',
          localInventory: { ore: 10 }
      };
      const inserter: BuildingEntity = {
          id: 'ins', type: 'Inserter', x: 1, y: 0, direction: 'E', status: 'IDLE'
      };
      const belt: BuildingEntity = {
          id: 'belt', type: 'Belt', x: 2, y: 0, direction: 'E', status: 'IDLE',
          beltItems: []
      };

      let state = { ...INITIAL_STATE, buildings: [box, inserter, belt] };

      // Tick 1: Pickup
      state = simulateTick(state);
      let ins = state.buildings.find(b => b.id === 'ins');
      let b = state.buildings.find(b => b.id === 'box');

      expect(ins?.holdingItem).toBeDefined();
      expect(ins?.holdingItem?.resource).toBe('ore');
      expect(ins?.holdingItem?.position).toBe(0);
      expect(b?.localInventory?.ore).toBe(9);

      // Tick 2: Swing (pos += 0.5 -> 0.5)
      state = simulateTick(state);
      ins = state.buildings.find(b => b.id === 'ins');
      expect(ins?.holdingItem?.position).toBe(0.5);

      // Tick 3: Swing (pos += 0.5 -> 1.0 -> Place)
      state = simulateTick(state);
      ins = state.buildings.find(b => b.id === 'ins');
      const blt = state.buildings.find(b => b.id === 'belt');

      expect(ins?.holdingItem).toBeUndefined();
      expect(blt?.beltItems).toHaveLength(1);
      expect(blt?.beltItems?.[0].resource).toBe('ore');
  });

  it('Splitter splits items', () => {
      // Splitter at (0,0) facing N.
      // Output Left: West (-1, 0)
      // Output Right: East (1, 0)
      // Note: My implementation uses getLeftDir/getRightDir relative to Facing N.
      // Left of N is W. Right of N is E.

      const splitter: BuildingEntity = {
          id: 'sp', type: 'Splitter', x: 0, y: 0, direction: 'N', status: 'IDLE',
          beltItems: [{ id: 'i1', resource: 'ore', position: 0.9 }]
      };
      const beltLeft: BuildingEntity = {
          id: 'bl', type: 'Belt', x: -1, y: 0, direction: 'N', status: 'IDLE', beltItems: []
      };
      const beltRight: BuildingEntity = {
          id: 'br', type: 'Belt', x: 1, y: 0, direction: 'N', status: 'IDLE', beltItems: []
      };

      let state = { ...INITIAL_STATE, buildings: [splitter, beltLeft, beltRight] };

      // Tick 1: Splitter should move item to one of the outputs
      state = simulateTick(state);

      const bl = state.buildings.find(b => b.id === 'bl');
      const br = state.buildings.find(b => b.id === 'br');
      const sp = state.buildings.find(b => b.id === 'sp');

      expect(sp?.beltItems).toHaveLength(0);
      // One of them should have it
      const count = (bl?.beltItems?.length || 0) + (br?.beltItems?.length || 0);
      expect(count).toBe(1);
  });
});
