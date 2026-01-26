import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GameProvider, useGame } from '@/features/factory-tycoon/store';
import { BUILDINGS } from '@/features/factory-tycoon/config';

// Mock engine to avoid heavy simulation
vi.mock('@/features/factory-tycoon/engine', () => ({
  simulateTick: (state: any) => ({ ...state, tickCount: state.tickCount + 1 }),
  calculateCapacity: () => 100,
}));

// Mock actions
vi.mock('@/features/factory-tycoon/actions', () => ({
  saveGameState: vi.fn(),
  loadGameState: vi.fn().mockResolvedValue(null),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
}));

describe('GameStore', () => {
  it('provides initial state and allows manual interaction', async () => {
    const wrapper = ({ children }: { children: any }) => <GameProvider>{children}</GameProvider>;
    const { result } = renderHook(() => useGame(), { wrapper });

    // Wait for initial load
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.state.cash).toBe(20);

    // Test manualInteract stability
    const initialManualInteract = result.current.manualInteract;

    act(() => {
        result.current.manualInteract(0, 0);
    });

    // Check if the function reference remained the same after state update
    expect(result.current.manualInteract).toBe(initialManualInteract);
  });
});
