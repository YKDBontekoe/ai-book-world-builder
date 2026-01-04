import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCanvasSync } from '@/components/organisms/writer/hooks/use-canvas-sync';

// Mock dependencies
const mockSetProjectId = vi.fn();
const mockSetIsReadOnly = vi.fn();

vi.mock('@/components/organisms/book-canvas/book-canvas-context', () => ({
  useBookCanvasActions: () => ({
    setProjectId: mockSetProjectId,
    setIsReadOnly: mockSetIsReadOnly,
  }),
}));

describe('useCanvasSync', () => {
  it('should sync projectId and isReadOnly to context on mount/update', () => {
    const { rerender } = renderHook(
      ({ projectId, isReadOnly }) => useCanvasSync(projectId, isReadOnly),
      { initialProps: { projectId: 'p1', isReadOnly: false } }
    );

    expect(mockSetProjectId).toHaveBeenCalledWith('p1');
    expect(mockSetIsReadOnly).toHaveBeenCalledWith(false);

    // Update
    rerender({ projectId: 'p2', isReadOnly: true });
    expect(mockSetProjectId).toHaveBeenCalledWith('p2');
    expect(mockSetIsReadOnly).toHaveBeenCalledWith(true);
  });

  it('should reset context on unmount', () => {
    const { unmount } = renderHook(() => useCanvasSync('p1', false));

    // Clear mocks to check unmount calls
    mockSetProjectId.mockClear();
    mockSetIsReadOnly.mockClear();

    unmount();

    expect(mockSetProjectId).toHaveBeenCalledWith(null);
    expect(mockSetIsReadOnly).toHaveBeenCalledWith(false);
  });
});
