
import { useCallback, useState } from "react";

export function useSceneSelection() {
  const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const toggleSelection = useCallback((id: string, multiSelect: boolean, rangeSelect: boolean, allIds: string[]) => {
    setSelectedSceneIds(prev => {
      const next = new Set(prev);

      if (rangeSelect && lastSelectedId && allIds.includes(lastSelectedId) && allIds.includes(id)) {
        const start = allIds.indexOf(lastSelectedId);
        const end = allIds.indexOf(id);
        const [lower, upper] = start < end ? [start, end] : [end, start];

        for (let i = lower; i <= upper; i++) {
            next.add(allIds[i]);
        }
      } else if (multiSelect) {
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      } else {
        // Single selection (or just normal click without modifiers - usually selects the active scene)
        // But for *selection mode*, usually click clears others unless specific UI.
        // We will assume this hook is for the "check box" or "modifier" logic.
        // If normal click, we might want to *not* select in this set, but let the parent handle navigation.
        // But if we want to start a selection:
        next.clear();
        next.add(id);
      }

      return next;
    });
    setLastSelectedId(id);
  }, [lastSelectedId]);

  const clearSelection = useCallback(() => {
    setSelectedSceneIds(new Set());
    setLastSelectedId(null);
  }, []);

  const selectAll = useCallback((ids: string[]) => {
      setSelectedSceneIds(new Set(ids));
  }, []);

  return {
    selectedSceneIds,
    toggleSelection,
    clearSelection,
    selectAll,
    hasSelection: selectedSceneIds.size > 0
  };
}
