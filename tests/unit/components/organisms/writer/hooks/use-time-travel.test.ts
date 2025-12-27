import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTimeTravel } from '@/components/organisms/writer/hooks/use-time-travel';

// Mock debounced callback
vi.mock('usehooks-ts', () => ({
  useDebounceCallback: (fn: Function) => fn, // Run immediately for tests
}));

describe('useTimeTravel', () => {
  it('initializes history with content', () => {
    const { result } = renderHook(() => useTimeTravel({
      initialContent: 'Initial',
      onContentChange: vi.fn()
    }));

    expect(result.current.historyStack).toHaveLength(1);
    expect(result.current.historyStack[0].content).toBe('Initial');
  });

  it('pushes new content to history', () => {
    const onContentChange = vi.fn();
    const { result } = renderHook(() => useTimeTravel({
      initialContent: 'Initial',
      onContentChange
    }));

    act(() => {
      result.current.handleContentUpdate('New Content');
    });

    expect(result.current.historyStack).toHaveLength(2);
    expect(result.current.historyStack[1].content).toBe('New Content');
    expect(onContentChange).toHaveBeenCalledWith('New Content');
  });

  it('enters time travel mode and sets preview', () => {
    const { result } = renderHook(() => useTimeTravel({
      initialContent: 'V1',
      onContentChange: vi.fn()
    }));

    // Create history: V1 -> V2
    act(() => {
      result.current.handleContentUpdate('V2');
    });

    // Toggle On
    act(() => {
      result.current.toggleTimeTravel();
    });

    expect(result.current.isTimeTraveling).toBe(true);
    expect(result.current.sliderValue).toEqual([1]); // Index of V2

    // Move Slider to V1
    act(() => {
        result.current.handleTimeTravelChange([0]);
    });

    expect(result.current.previewContent).toBe('V1');
  });

  it('restores previous version', () => {
    const onContentChange = vi.fn();
    const { result } = renderHook(() => useTimeTravel({
      initialContent: 'V1',
      onContentChange
    }));

    act(() => result.current.handleContentUpdate('V2'));
    act(() => result.current.toggleTimeTravel());
    act(() => result.current.handleTimeTravelChange([0])); // Preview V1

    act(() => {
        result.current.restoreVersion();
    });

    expect(result.current.isTimeTraveling).toBe(false);
    expect(onContentChange).toHaveBeenCalledWith('V1'); // Should trigger save with V1
  });
});
