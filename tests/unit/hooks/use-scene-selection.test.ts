
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSceneSelection } from '@/hooks/use-scene-selection';

describe('useSceneSelection', () => {
  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useSceneSelection());
    expect(result.current.selectedSceneIds.size).toBe(0);
    expect(result.current.hasSelection).toBe(false);
  });

  it('should toggle selection for single item', () => {
    const { result } = renderHook(() => useSceneSelection());
    const allIds = ['1', '2', '3'];

    act(() => {
      // simulate cmd+click (multi=true)
      result.current.toggleSelection('1', true, false, allIds);
    });

    expect(result.current.selectedSceneIds.has('1')).toBe(true);
    expect(result.current.selectedSceneIds.size).toBe(1);

    act(() => {
      // toggle off
      result.current.toggleSelection('1', true, false, allIds);
    });

    expect(result.current.selectedSceneIds.has('1')).toBe(false);
    expect(result.current.selectedSceneIds.size).toBe(0);
  });

  it('should handle single selection (no modifier)', () => {
      const { result } = renderHook(() => useSceneSelection());
      const allIds = ['1', '2', '3'];

      act(() => {
        result.current.toggleSelection('1', true, false, allIds);
        result.current.toggleSelection('2', true, false, allIds);
      });

      // Since our hook logic for multi=true is "add to set", it should have both if we kept holding cmd.
      expect(result.current.selectedSceneIds.size).toBe(2);

      // Test without modifier (multi=false)
      act(() => {
          result.current.toggleSelection('3', false, false, allIds);
      });
      // Should clear others and select 3
      expect(result.current.selectedSceneIds.size).toBe(1);
      expect(result.current.selectedSceneIds.has('3')).toBe(true);
  });

  it('should handle range selection', () => {
    const { result } = renderHook(() => useSceneSelection());
    const allIds = ['1', '2', '3', '4', '5'];

    // Select 1
    act(() => {
      result.current.toggleSelection('1', true, false, allIds);
    });

    // Shift+Click 4 (range=true)
    act(() => {
      result.current.toggleSelection('4', false, true, allIds);
    });

    expect(result.current.selectedSceneIds.has('1')).toBe(true);
    expect(result.current.selectedSceneIds.has('2')).toBe(true);
    expect(result.current.selectedSceneIds.has('3')).toBe(true);
    expect(result.current.selectedSceneIds.has('4')).toBe(true);
    expect(result.current.selectedSceneIds.size).toBe(4);
  });
});
