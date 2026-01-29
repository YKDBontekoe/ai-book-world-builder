import type { Meta, StoryObj } from '@storybook/react';
import TycoonGame from './TycoonGame';
import { INITIAL_STATE } from './config';
import { GameState } from './types';

const meta: Meta<typeof TycoonGame> = {
  title: 'Features/FactoryTycoon/TycoonGame',
  component: TycoonGame,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TycoonGame>;

// Mock actions
const mockLoadGame = (state: Partial<GameState> = {}) => async () => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    return {
        success: true,
        data: { ...INITIAL_STATE, ...state } as GameState
    };
};

const mockSaveGame = async (state: GameState) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Saved state:', state);
    return { success: true };
};

export const Default: Story = {
  args: {
    loadGameAction: mockLoadGame({ cash: 100 }),
    saveGameAction: mockSaveGame,
  },
};

export const Loading: Story = {
  args: {
    loadGameAction: async () => {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Long delay
        return { success: true, data: INITIAL_STATE };
    },
    saveGameAction: mockSaveGame,
  },
};

export const WithBuildings: Story = {
  args: {
    loadGameAction: mockLoadGame({
        cash: 5000,
        buildings: [
            { id: '1', type: 'Mine', x: 2, y: 2, status: 'RUNNING', direction: 'N' },
            { id: '2', type: 'Belt', x: 2, y: 3, status: 'IDLE', direction: 'S' },
            { id: '3', type: 'Smelter', x: 2, y: 4, status: 'RUNNING', direction: 'S' },
        ],
        inventory: { ore: 50, ingot: 20, gadget: 5 },
    }),
    saveGameAction: mockSaveGame,
  },
};

export const LoadError: Story = {
  args: {
    loadGameAction: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: false, error: 'Database connection failed' };
    },
    saveGameAction: mockSaveGame,
  },
};
