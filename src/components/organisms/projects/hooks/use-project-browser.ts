import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { deleteProjects, forkProject } from "@/app/actions/projects";
import type { Project } from "@/lib/db/schema";

export type SortOption = "newest" | "oldest" | "a-z" | "z-a";
export type VisibilityFilter = "all" | "public" | "private";

export function useProjectBrowser(projects: Project[]) {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortOption, setSortOption] = useState<SortOption>("newest");
	const [visibilityFilter, setVisibilityFilter] =
		useState<VisibilityFilter>("all");
	const [viewMode, setViewMode] = useLocalStorage<"grid" | "list">(
		"project-view-mode",
		"grid",
	);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	// Optimistic UI state
	const [optimisticDeletedIds, setOptimisticDeletedIds] = useState<Set<string>>(
		new Set(),
	);
	const pendingDeletionRef = useRef<Set<string> | null>(null);
	const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const router = useRouter();

	const filteredProjects = useMemo(() => {
		let result = [...projects];

		// Filter out optimistically deleted projects
		result = result.filter((p) => !optimisticDeletedIds.has(p.id));

		// Filter by Visibility
		if (visibilityFilter !== "all") {
			result = result.filter((p) => p.visibility === visibilityFilter);
		}

		// Filter by Search
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(p) =>
					p.name.toLowerCase().includes(query) ||
					p.description?.toLowerCase().includes(query),
			);
		}

		// Sort
		result.sort((a, b) => {
			switch (sortOption) {
				case "newest":
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				case "oldest":
					return (
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					);
				case "a-z":
					return a.name.localeCompare(b.name);
				case "z-a":
					return b.name.localeCompare(a.name);
				default:
					return 0;
			}
		});

		return result;
	}, [
		projects,
		searchQuery,
		sortOption,
		optimisticDeletedIds,
		visibilityFilter,
	]);

	const handleSelect = (id: string, shiftKey = false) => {
		const newSelected = new Set(selectedIds);

		if (shiftKey && lastSelectedId) {
			// Range selection
			const lastIndex = filteredProjects.findIndex(
				(p) => p.id === lastSelectedId,
			);
			const currentIndex = filteredProjects.findIndex((p) => p.id === id);

			if (lastIndex !== -1 && currentIndex !== -1) {
				const start = Math.min(lastIndex, currentIndex);
				const end = Math.max(lastIndex, currentIndex);

				for (let i = start; i <= end; i++) {
					newSelected.add(filteredProjects[i].id);
				}
			}
		} else {
			// Toggle selection
			if (newSelected.has(id)) {
				newSelected.delete(id);
			} else {
				newSelected.add(id);
			}
			setLastSelectedId(id);
		}

		setSelectedIds(newSelected);
	};

	const handleSelectAll = () => {
		if (selectedIds.size === filteredProjects.length) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(filteredProjects.map((p) => p.id)));
		}
	};

	// Clean up timeout and trigger pending deletions on unmount
	useEffect(() => {
		return () => {
			if (undoTimeoutRef.current) {
				clearTimeout(undoTimeoutRef.current);
			}
			// If there are pending deletions when the component unmounts (e.g. navigation),
			// we should fire them immediately to avoid "silent cancellation".
			if (pendingDeletionRef.current && pendingDeletionRef.current.size > 0) {
				const ids = Array.from(pendingDeletionRef.current);
				// We use void to fire-and-forget, but catch errors to log them
				deleteProjects(ids).catch((err) =>
					console.error("Failed to delete pending projects on unmount", err),
				);
				pendingDeletionRef.current = null;
			}
		};
	}, []);

	const undoDelete = useCallback((idsToRestore: string[]) => {
		if (undoTimeoutRef.current) {
			clearTimeout(undoTimeoutRef.current);
		}
		setOptimisticDeletedIds((prev) => {
			const next = new Set(prev);
			for (const id of idsToRestore) {
				next.delete(id);
			}
			return next;
		});
		pendingDeletionRef.current = null; // Clear pending
	}, []);

	const handleDelete = useCallback(
		(idsToDelete: string[]) => {
			if (idsToDelete.length === 0) return;

			// 1. Optimistic Update
			const newOptimisticDeleted = new Set(optimisticDeletedIds);
			for (const id of idsToDelete) {
				newOptimisticDeleted.add(id);
			}
			setOptimisticDeletedIds(newOptimisticDeleted);

			// Clear selection if any deleted items were selected
			setSelectedIds((prev) => {
				const next = new Set(prev);
				for (const id of idsToDelete) {
					next.delete(id);
				}
				return next;
			});

			// Track pending deletion
			pendingDeletionRef.current = new Set(idsToDelete);

			// 2. Undo callback logic is handled by the UI (toast) invoking undoDelete

			// 3. Delayed Server Action
			if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);

			undoTimeoutRef.current = setTimeout(async () => {
				try {
					const result = await deleteProjects(idsToDelete);
					pendingDeletionRef.current = null;
					undoTimeoutRef.current = null;

					if (result && "error" in result) {
						toast.error("Failed to delete projects");
						undoDelete(idsToDelete);
					}
				} catch (err) {
					console.error("Delete projects error:", err);
					toast.error("Failed to delete projects");
					undoDelete(idsToDelete);
					pendingDeletionRef.current = null;
					undoTimeoutRef.current = null;
				}
			}, 4500); // Slightly less than toast duration
		},
		[optimisticDeletedIds, undoDelete],
	);

	const handleBulkDuplicate = async () => {
		setIsProcessing(true);
		const idsToDuplicate = Array.from(selectedIds);
		toast.info(`Duplicating ${idsToDuplicate.length} projects...`);

		const results = await Promise.allSettled(
			idsToDuplicate.map((id) => forkProject(id, undefined)),
		);

		const successCount = results.filter(
			(r) => r.status === "fulfilled" && !("error" in r.value),
		).length;
		const failureCount = idsToDuplicate.length - successCount;

		if (failureCount === 0) {
			toast.success("All projects duplicated successfully");
			setSelectedIds(new Set());
		} else {
			toast.warning(
				`Duplicated ${successCount} projects. Failed to duplicate ${failureCount}.`,
			);
		}

		router.refresh();
		setIsProcessing(false);
	};

	// --- Keyboard Shortcuts ---
	useHotkeys(
		"meta+a, ctrl+a",
		() => {
			handleSelectAll();
		},
		{ preventDefault: true },
	);

	useHotkeys(
		"esc",
		(e) => {
			e.preventDefault();
			setSelectedIds(new Set());
			setLastSelectedId(null);
		},
		{ enabled: selectedIds.size > 0 },
	);

	// Delete shortcut is handled in the parent component to access toast/undo logic

	return {
		searchQuery,
		setSearchQuery,
		sortOption,
		setSortOption,
		visibilityFilter,
		setVisibilityFilter,
		viewMode,
		setViewMode,
		selectedIds,
		setSelectedIds,
		isProcessing,
		filteredProjects,
		handleSelect,
		handleSelectAll,
		handleDelete,
		undoDelete,
		handleBulkDuplicate,
	};
}
