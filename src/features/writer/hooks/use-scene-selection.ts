import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { bulkExportScenesFormatted } from "@/features/writer/actions";

export type ExportAction = "copy" | "md" | "txt" | "pdf" | "epub";

export interface UseSceneSelectionReturn {
	isSelectionMode: boolean;
	setIsSelectionMode: Dispatch<SetStateAction<boolean>>;
	selectedSceneIds: Set<string>;
	setSelectedSceneIds: Dispatch<SetStateAction<Set<string>>>;
	toggleSelectionMode: () => void;
	toggleSceneSelect: (sceneId: string) => void;
	handleBulkExport: (format?: ExportAction) => Promise<void>;
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

	const handleBulkExport = useCallback(
		async (format: ExportAction = "copy") => {
			const toastId = toast.loading("Exporting scenes...");
			try {
				const ids = Array.from(selectedSceneIds);
				// For copy, we fetch markdown
				const serverFormat = format === "copy" ? "md" : format;
				const result = await bulkExportScenesFormatted(ids, serverFormat);

				if (result.success && result.content) {
					if (format === "copy") {
						await navigator.clipboard.writeText(result.content);
						toast.success("Copied to clipboard", { id: toastId });
					} else {
						// Handle download
						const isBinary = format === "pdf" || format === "epub";
						const blobContent = isBinary
							? Uint8Array.from(atob(result.content), (c) => c.charCodeAt(0))
							: result.content;

						const blob = new Blob([blobContent], { type: result.contentType });
						const url = URL.createObjectURL(blob);
						const a = document.createElement("a");
						a.href = url;
						a.download = result.filename || "export.txt";
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
						URL.revokeObjectURL(url);
						toast.success("Export downloaded", { id: toastId });
					}
					toggleSelectionMode();
				} else {
					toast.error(result.error || "Failed to export", { id: toastId });
				}
			} catch (_error) {
				toast.error("Error exporting scenes", { id: toastId });
			}
		},
		[selectedSceneIds, toggleSelectionMode],
	);

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
