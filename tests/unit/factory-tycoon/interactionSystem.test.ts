import { describe, expect, it } from 'vitest';
import { getInteractionResult, processInteraction } from '../../../src/features/factory-tycoon/systems/interactionSystem';
import { GameState } from '../../../src/features/factory-tycoon/types';
import { INITIAL_STATE } from '../../../src/features/factory-tycoon/config';

describe('Interaction System', () => {
    it('should pick up item from belt', () => {
        const state: GameState = {
            ...INITIAL_STATE,
            buildings: [{
                id: '1',
                type: 'Belt',
                x: 0,
                y: 0,
                direction: 'N',
                status: 'IDLE',
                beltItems: [{ id: 'i1', resource: 'ore', position: 0.5 }]
            }],
            inventory: { ore: 0, ingot: 0, gadget: 0 }
        };

        const result = getInteractionResult(state, 0, 0);
        expect(result).toEqual({ resource: 'ore', amount: 1 });

        const newState = processInteraction(state, 0, 0);
        expect(newState.inventory.ore).toBe(1);
        expect(newState.buildings[0].beltItems).toHaveLength(0);
    });

    it('should collect output from machine', () => {
        const state: GameState = {
            ...INITIAL_STATE,
            buildings: [{
                id: '1',
                type: 'Mine',
                x: 0,
                y: 0,
                direction: 'N',
                status: 'IDLE',
                localInventory: { ore: 5 }
            }],
            inventory: { ore: 0, ingot: 0, gadget: 0 }
        };

        const result = getInteractionResult(state, 0, 0);
        expect(result).toEqual({ resource: 'ore', amount: 5 });

        const newState = processInteraction(state, 0, 0);
        expect(newState.inventory.ore).toBe(5);
        expect(newState.buildings[0].localInventory?.ore).toBe(0);
    });

    it('should do nothing if no interaction', () => {
        const state = INITIAL_STATE;
        const result = getInteractionResult(state, 0, 0);
        expect(result).toBeNull();

        const newState = processInteraction(state, 0, 0);
        expect(newState).toBe(state);
    });
});
