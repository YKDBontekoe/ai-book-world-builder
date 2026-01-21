import { Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";
import {
	bulkDeleteScenes,
	createNewChapter,
	createSceneInChapter,
	deleteChapter,
	generateScene,
	updateChapterTitle,
	updateSceneTitle,
} from "@/features/writer/actions";
import type { ChapterWithScenes } from "@/lib/types";

interface UseSceneOperationsProps {
	projectId: string;
	activeSceneId: string | null;
	onSceneSelect: (sceneId: string | null) => void;
	onStructureUpdate?: () => void;
	structure: ChapterWithScenes[] | null;
}

export interface UseSceneOperationsReturn {
	isGenerating: boolean;
	isCreatingChapter: boolean;
	deletedSceneIds: Set<string>;
	deletedChapterIds: Set<string>;
	handleGenerateNextScene: (
		chapterId: string,
		prevSceneId?: string,
	) => Promise<void>;
	handleCreateSceneManually: (chapterId: string) => Promise<void>;
	handleRenameScene: (sceneId: string, newTitle: string) => Promise<void>;
	handleDeleteScene: (sceneId: string) => Promise<void>;
	performDelete: (idsToDelete: string[]) => void;
	handleCreateChapter: () => Promise<void>;
	handleRenameChapter: (chapterId: string, newTitle: string) => Promise<void>;
	handleDeleteChapter: (chapterId: string) => void;
}

export function useSceneOperations({
	projectId,
	activeSceneId,
	onSceneSelect,
	onStructureUpdate,
	structure,
}: UseSceneOperationsProps): UseSceneOperationsReturn {
	const [isGenerating, setIsGenerating] = useState(false);
	const [isCreatingChapter, setIsCreatingChapter] = useState(false);
	const [deletedSceneIds, setDeletedSceneIds] = useState<Set<string>>(
		new Set(),
	);
	const [deletedChapterIds, setDeletedChapterIds] = useState<Set<string>>(
		new Set(),
	);
	const pendingDeletionsRef = useRef<
		Map<string | number, ReturnType<typeof setTimeout>>
	>(new Map());

	// Cleanup pending deletions on unmount
	useEffect(() => {
		return () => {
			pendingDeletionsRef.current.forEach((timeout) => clearTimeout(timeout));
			pendingDeletionsRef.current.clear();
		};
	}, []);

	// Store activeSceneId in ref to prevent prop instability in performDelete
	const activeSceneIdRef = useRef(activeSceneId);
	useEffect(() => {
		activeSceneIdRef.current = activeSceneId;
	}, [activeSceneId]);

	// Cleanup deletedSceneIds when structure updates
	useEffect(() => {
		if (!structure) return;

		setDeletedSceneIds((prev) => {
			if (prev.size === 0) return prev;

			const currentIds = new Set<string>();
			structure.forEach((chapter) => {
				chapter.scenes.forEach((scene) => {
					currentIds.add(scene.id);
				});
			});

			const next = new Set(prev);
			let changed = false;
			for (const id of prev) {
				if (!currentIds.has(id)) {
					next.delete(id);
					changed = true;
				}
			}

			return changed ? next : prev;
		});

		setDeletedChapterIds((prev) => {
			if (prev.size === 0) return prev;

			const currentIds = new Set<string>();
			structure.forEach((chapter) => {
				currentIds.add(chapter.id);
			});

			const next = new Set(prev);
			let changed = false;
			for (const id of prev) {
				if (!currentIds.has(id)) {
					next.delete(id);
					changed = true;
				}
			}

			return changed ? next : prev;
		});
	}, [structure]);

	const handleGenerateNextScene = useCallback(
		async (chapterId: string, prevSceneId?: string) => {
			setIsGenerating(true);
			const toastId = toast.loading("Generating new scene...");

			try {
				const result = await generateScene(chapterId, prevSceneId);
				if (result.success && result.sceneId) {
					toast.success("Scene generated!", { id: toastId });
					onStructureUpdate?.();
				} else {
					toast.error("Generation failed", { id: toastId });
				}
			} catch (_e) {
				toast.error("Error generating scene", { id: toastId });
			} finally {
				setIsGenerating(false);
			}
		},
		[onStructureUpdate],
	);

	const handleCreateSceneManually = useCallback(
		async (chapterId: string) => {
			const toastId = toast.loading("Creating scene...");
			try {
				const result = await createSceneInChapter(chapterId, "New Scene");
				if (result.success && result.sceneId) {
					toast.success("Scene created", { id: toastId });
					onStructureUpdate?.();
					// Optionally select the new scene
					onSceneSelect(result.sceneId);
				} else {
					toast.error(result.error || "Failed to create scene", {
						id: toastId,
					});
				}
			} catch (_e) {
				toast.error("Error creating scene", { id: toastId });
			}
		},
		[onStructureUpdate, onSceneSelect],
	);

	const handleRenameScene = useCallback(
		async (sceneId: string, newTitle: string) => {
			const toastId = toast.loading("Renaming scene...");
			try {
				const result = await updateSceneTitle(sceneId, newTitle);
				if (result.success) {
					toast.success("Scene renamed", { id: toastId });
					onStructureUpdate?.();
				} else {
					toast.error("Failed to rename scene", { id: toastId });
				}
			} catch (_e) {
				toast.error("Error renaming scene", { id: toastId });
			}
		},
		[onStructureUpdate],
	);

	const undoDelete = useCallback(
		(toastId: string | number, idsToRestore: string[]) => {
			const timeoutId = pendingDeletionsRef.current.get(toastId);
			if (timeoutId) {
				clearTimeout(timeoutId);
				pendingDeletionsRef.current.delete(toastId);
			}

			setDeletedSceneIds((prev) => {
				const next = new Set(prev);
				idsToRestore.forEach((id) => {
					next.delete(id);
				});
				return next;
			});

			toast.dismiss(toastId);
			toast.success("Deletion undone");
		},
		[],
	);

	const undoDeleteChapter = useCallback(
		(toastId: string | number, idToRestore: string) => {
			const timeoutId = pendingDeletionsRef.current.get(toastId);
			if (timeoutId) {
				clearTimeout(timeoutId);
				pendingDeletionsRef.current.delete(toastId);
			}

			setDeletedChapterIds((prev) => {
				const next = new Set(prev);
				next.delete(idToRestore);
				return next;
			});

			toast.dismiss(toastId);
			toast.success("Deletion undone");
		},
		[],
	);

	const performDelete = useCallback(
		(idsToDelete: string[]) => {
			// Optimistic update
			setDeletedSceneIds((prev) => {
				const next = new Set(prev);
				idsToDelete.forEach((id) => {
					next.add(id);
				});
				return next;
			});

			if (
				activeSceneIdRef.current &&
				idsToDelete.includes(activeSceneIdRef.current)
			) {
				onSceneSelect(null);
			}

			// Show Undo Toast
			const toastId = toast.custom(
				(t) => (
					<GlassCard
						variant="liquid"
						className="flex items-center gap-4 p-4 w-full max-w-md mx-auto pointer-events-auto"
					>
						<div className="flex-1 text-sm">
							Deleted {idsToDelete.length} scene
							{idsToDelete.length !== 1 ? "s" : ""}
						</div>
						<Button
							size="sm"
							variant="outline"
							className="gap-2 h-8"
							onClick={() => undoDelete(t, idsToDelete)}
						>
							<Undo2 className="h-3.5 w-3.5" />
							Undo
						</Button>
					</GlassCard>
				),
				{ duration: 4000 },
			);

			// Delayed execution
			const timeout = setTimeout(async () => {
				pendingDeletionsRef.current.delete(toastId);

				const result = await bulkDeleteScenes(idsToDelete);

				if (result.success) {
					onStructureUpdate?.();
				} else {
					toast.error("Failed to delete scenes");
					// Restore on error
					setDeletedSceneIds((prev) => {
						const next = new Set(prev);
						idsToDelete.forEach((id) => {
							next.delete(id);
						});
						return next;
					});
				}
			}, 4000);

			pendingDeletionsRef.current.set(toastId, timeout);
		},
		[onSceneSelect, onStructureUpdate, undoDelete],
	);

	const handleDeleteScene = useCallback(
		async (sceneId: string) => {
			performDelete([sceneId]);
		},
		[performDelete],
	);

	const handleCreateChapter = useCallback(async () => {
		setIsCreatingChapter(true);
		const toastId = toast.loading("Creating new chapter...");
		try {
			const result = await createNewChapter(projectId);
			if (result.success) {
				toast.success("Chapter created!", { id: toastId });
				onStructureUpdate?.();
			} else {
				toast.error("Failed to create chapter", { id: toastId });
			}
		} catch (_e) {
			toast.error("Error creating chapter", { id: toastId });
		} finally {
			setIsCreatingChapter(false);
		}
	}, [projectId, onStructureUpdate]);

	const handleRenameChapter = useCallback(
		async (chapterId: string, newTitle: string) => {
			const toastId = toast.loading("Renaming chapter...");
			try {
				const result = await updateChapterTitle(chapterId, newTitle);
				if (result.success) {
					toast.success("Chapter renamed", { id: toastId });
					onStructureUpdate?.();
				} else {
					toast.error("Failed to rename chapter", { id: toastId });
				}
			} catch (_e) {
				toast.error("Error renaming chapter", { id: toastId });
			}
		},
		[onStructureUpdate],
	);

	const handleDeleteChapter = useCallback(
		(chapterId: string) => {
			// Check if active scene belongs to this chapter
			const chapterToDelete = structure?.find((c) => c.id === chapterId);
			if (
				activeSceneIdRef.current &&
				chapterToDelete?.scenes.some((s) => s.id === activeSceneIdRef.current)
			) {
				onSceneSelect(null);
			}

			// Optimistic update
			setDeletedChapterIds((prev) => {
				const next = new Set(prev);
				next.add(chapterId);
				return next;
			});

			// Show Undo Toast
			const toastId = toast.custom(
				(t) => (
					<GlassCard
						variant="liquid"
						className="flex items-center gap-4 p-4 w-full max-w-md mx-auto pointer-events-auto"
					>
						<div className="flex-1 text-sm">Deleted chapter</div>
						<Button
							size="sm"
							variant="outline"
							className="gap-2 h-8"
							onClick={() => undoDeleteChapter(t, chapterId)}
						>
							<Undo2 className="h-3.5 w-3.5" />
							Undo
						</Button>
					</GlassCard>
				),
				{ duration: 4000 },
			);

			// Delayed execution
			const timeout = setTimeout(async () => {
				pendingDeletionsRef.current.delete(toastId);

				const result = await deleteChapter(chapterId);

				if (result.success) {
					onStructureUpdate?.();
				} else {
					toast.error("Failed to delete chapter");
					// Restore on error
					setDeletedChapterIds((prev) => {
						const next = new Set(prev);
						next.delete(chapterId);
						return next;
					});
				}
			}, 4000);

			pendingDeletionsRef.current.set(toastId, timeout);
		},
		[undoDeleteChapter, onStructureUpdate, structure, onSceneSelect],
	);

	return {
		isGenerating,
		isCreatingChapter,
		deletedSceneIds,
		deletedChapterIds,
		handleGenerateNextScene,
		handleCreateSceneManually,
		handleRenameScene,
		handleDeleteScene,
		performDelete,
		handleCreateChapter,
		handleRenameChapter,
		handleDeleteChapter,
	};
}
