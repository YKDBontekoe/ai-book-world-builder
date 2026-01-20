import { type Dispatch, type SetStateAction, useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { bulkExportScenes } from "@/features/writer/actions";

export interface UseSceneSelectionReturn {
	isSelectionMode: boolean;
	setIsSelectionMode: Dispatch<SetStateAction<boolean>>;
	selectedSceneIds: Set<string>;
	setSelectedSceneIds: Dispatch<SetStateAction<Set<string>>>;
	toggleSelectionMode: () => void;
	toggleSceneSelect: (sceneId: string) => void;
	handleBulkExport: () => Promise<void>;
	handleBulkDelete: () => void;
}

export function useSceneSelection(
	onBulkDelete: (ids: string[]) => void,
): UseSceneSelectionReturn {
	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(
		new Set(),
	);

	const toggleSelectionMode = useCallback(() => {
		setIsSelectionMode((prev) => {
			if (prev) {
				setSelectedSceneIds(new Set());
				return false;
			}
			return true;
		});
	}, []);

	const toggleSceneSelect = useCallback((sceneId: string) => {
		setSelectedSceneIds((prev) => {
			const next = new Set(prev);
			if (next.has(sceneId)) {
				next.delete(sceneId);
			} else {
				next.add(sceneId);
			}
			return next;
		});
	}, []);

	const handleBulkExport = useCallback(async () => {
		const toastId = toast.loading("Exporting scenes...");
		try {
			const ids = Array.from(selectedSceneIds);
			const result = await bulkExportScenes(ids);
			if (result.success && result.content) {
				await navigator.clipboard.writeText(result.content);
				toast.success("Copied to clipboard", { id: toastId });
				toggleSelectionMode();
			} else {
				toast.error(result.error || "Failed to export", { id: toastId });
			}
		} catch (_error) {
			toast.error("Error exporting scenes", { id: toastId });
		}
	}, [selectedSceneIds, toggleSelectionMode]);

	const handleBulkDelete = useCallback(() => {
		const ids = Array.from(selectedSceneIds);
		if (ids.length === 0) return;

		onBulkDelete(ids);
		toggleSelectionMode();
	}, [selectedSceneIds, onBulkDelete, toggleSelectionMode]);

	useHotkeys(
		"delete, backspace",
		() => {
			handleBulkDelete();
		},
		{ enabled: isSelectionMode && selectedSceneIds.size > 0 },
		[handleBulkDelete, isSelectionMode, selectedSceneIds],
	);

	return {
		isSelectionMode,
		setIsSelectionMode,
		selectedSceneIds,
		setSelectedSceneIds,
		toggleSelectionMode,
		toggleSceneSelect,
		handleBulkExport,
		handleBulkDelete,
	};
}
