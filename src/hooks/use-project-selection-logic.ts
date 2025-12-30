import { useCallback, useState } from "react";

export function useProjectSelection(allItemIds: string[]) {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const handleSelect = useCallback(
		(id: string) => {
			setSelectedIds((prev) => {
				const newSelected = new Set(prev);
				if (newSelected.has(id)) {
					newSelected.delete(id);
				} else {
					newSelected.add(id);
				}
				return newSelected;
			});
		},
		[],
	);

	const handleSelectAll = useCallback(() => {
		const allSelected =
			allItemIds.length > 0 && allItemIds.every((id) => selectedIds.has(id));
		if (allSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(allItemIds));
		}
	}, [selectedIds, allItemIds]);

	const clearSelection = useCallback(() => {
		setSelectedIds(new Set());
	}, []);

	return {
		selectedIds,
		setSelectedIds,
		handleSelect,
		handleSelectAll,
		clearSelection,
	};
}
