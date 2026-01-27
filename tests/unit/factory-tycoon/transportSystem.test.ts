import { describe, it, expect } from 'vitest';
import { runTransportSystem } from '../../../src/features/factory-tycoon/systems/transportSystem';
import { INITIAL_STATE, BELT_SPEED } from '../../../src/features/factory-tycoon/config';
import { GameState, BuildingEntity, BeltItem } from '../../../src/features/factory-tycoon/types';

describe('Transport System', () => {
  it('Belt moves item forward', () => {
    const item: BeltItem = { id: 'i1', resource: 'ore', position: 0.1 };
    const belt: BuildingEntity = {
        id: 'b1', type: 'Belt', x: 0, y: 0, status: 'IDLE', direction: 'E',
        beltItems: [item]
    };

    const state: GameState = {
        ...INITIAL_STATE,
        buildings: [belt],
    };

    const nextState = runTransportSystem(state);
    const nextBelt = nextState.buildings[0];

    expect(nextBelt.beltItems?.[0].position).toBeCloseTo(0.1 + BELT_SPEED);
  });

  it('Belt transfers item to next belt', () => {
    // Belt 1 at (0,0) facing East -> Belt 2 at (1,0)
    const item: BeltItem = { id: 'i1', resource: 'ore', position: 1.0 }; // Ready to exit
    const belt1: BuildingEntity = {
        id: 'b1', type: 'Belt', x: 0, y: 0, status: 'IDLE', direction: 'E',
        beltItems: [item]
    };
    const belt2: BuildingEntity = {
        id: 'b2', type: 'Belt', x: 1, y: 0, status: 'IDLE', direction: 'E',
        beltItems: []
    };

    const state: GameState = {
        ...INITIAL_STATE,
        buildings: [belt1, belt2],
    };

    const nextState = runTransportSystem(state);
    const nextBelt1 = nextState.buildings.find(b => b.id === 'b1');
    const nextBelt2 = nextState.buildings.find(b => b.id === 'b2');

    expect(nextBelt1?.beltItems).toHaveLength(0);
    expect(nextBelt2?.beltItems).toHaveLength(1);

    // Check if item position is within valid range depending on processing order
    // If belt2 processed first: item stays at 0 (just arrived)
    // If belt1 processed first: item moves to 0, then belt2 processes: item moves to BELT_SPEED
    const position = nextBelt2?.beltItems?.[0].position || 0;
    expect(position).toBeGreaterThanOrEqual(0);
    expect(position).toBeLessThanOrEqual(BELT_SPEED);
  });

  it('Inserter picks up item from container', () => {
     const container: BuildingEntity = {
         id: 'c1', type: 'Warehouse', x: 0, y: 0, status: 'IDLE', direction: 'N',
         localInventory: { ore: 10 }
     };
     // Inserter at (0,1) facing South (places at 0,2), picks from North (0,0)
     const inserter: BuildingEntity = {
         id: 'ins1', type: 'Inserter', x: 0, y: 1, status: 'IDLE', direction: 'S',
     };

     const state: GameState = {
         ...INITIAL_STATE,
         buildings: [container, inserter],
     };

     const nextState = runTransportSystem(state);
     const nextInserter = nextState.buildings.find(b => b.id === 'ins1');
     const nextContainer = nextState.buildings.find(b => b.id === 'c1');

     expect(nextInserter?.holdingItem).toBeDefined();
     expect(nextInserter?.holdingItem?.resource).toBe('ore');
     expect(nextContainer?.localInventory?.ore).toBe(9);
  });

  it('Splitter distributes items', () => {
      // Splitter at (0,0) facing North. Inputs: from South (0,1). Outputs: West (-1,0) and East (1,0) (based on our simplified logic or standard Factorio logic?)
      // Our logic said: Left and Right. If Facing N: Left is W, Right is E.

      const item1: BeltItem = { id: 'i1', resource: 'ore', position: 0.6 }; // Past middle
      const item2: BeltItem = { id: 'i2', resource: 'ore', position: 0.6 };

      const splitter: BuildingEntity = {
          id: 's1', type: 'Splitter', x: 0, y: 0, status: 'IDLE', direction: 'N',
          beltItems: [item1, item2]
      };

      // Target Left (-1, 0)
      const beltLeft: BuildingEntity = {
          id: 'bl', type: 'Belt', x: -1, y: 0, status: 'IDLE', direction: 'N', beltItems: []
      };
      // Target Right (1, 0)
      const beltRight: BuildingEntity = {
          id: 'br', type: 'Belt', x: 1, y: 0, status: 'IDLE', direction: 'N', beltItems: []
      };

      const state: GameState = {
          ...INITIAL_STATE,
          buildings: [splitter, beltLeft, beltRight],
      };

      // Tick 1: One item should move to one side
      let nextState = runTransportSystem(state);

      // Tick 2: Second item should try other side (randomized in current impl, so we can't guarantee distinct split in 2 ticks deterministically if it uses Math.random)
      // Wait, current impl uses `Math.random`?
      // "const tryOrder = Math.random() > 0.5 ? [out1, out2] : [out2, out1];"
      // Yes. So we can't test strict 50/50 distribution easily without mocking Math.random.
      // But we can check that it moves somewhere.

      const nextSplitter = nextState.buildings.find(b => b.id === 's1');
      const nextLeft = nextState.buildings.find(b => b.id === 'bl');
      const nextRight = nextState.buildings.find(b => b.id === 'br');

      const totalOut = (nextLeft?.beltItems?.length || 0) + (nextRight?.beltItems?.length || 0);
      const remaining = nextSplitter?.beltItems?.length || 0;

      expect(totalOut + remaining).toBe(2);
      expect(totalOut).toBeGreaterThan(0); // Should have moved at least one
  });
});
