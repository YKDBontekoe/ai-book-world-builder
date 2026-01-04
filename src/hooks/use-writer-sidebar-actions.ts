"use client";

import { toast } from "sonner";
import {
	createNewChapter,
	createSceneInChapter,
	deleteChapter,
	deleteScene,
	reorderChapters,
	reorderScenes,
	updateChapterTitle,
	updateSceneTitle,
} from "@/app/actions/writer";
import { useWriterContext } from "@/components/organisms/writer/writer-context";

export function useWriterSidebarActions() {
	const { project, fetchStructure, isReadOnly, setActiveSceneId } =
		useWriterContext();

	const handleAddChapter = async () => {
		if (isReadOnly) return;
		const toastId = toast.loading("Creating chapter...");
		try {
			await createNewChapter(project.id);
			toast.success("Chapter created", { id: toastId });
			fetchStructure();
		} catch {
			toast.error("Failed to create chapter", { id: toastId });
		}
	};

	const handleUpdateChapterTitle = async (
		chapterId: string,
		newTitle: string,
	) => {
		const result = await updateChapterTitle(chapterId, newTitle);
		if (result.success) {
			fetchStructure();
			return true;
		}
		toast.error(result.error || "Failed to update chapter title");
		return false;
	};

	const handleUpdateSceneTitle = async (sceneId: string, newTitle: string) => {
		const result = await updateSceneTitle(sceneId, newTitle);
		if (result.success) {
			fetchStructure();
			return true;
		}
		toast.error(result.error || "Failed to update scene title");
		return false;
	};

	const handleDeleteChapter = async (chapterId: string) => {
		if (isReadOnly) return;
		if (
			!confirm(
				"Are you sure you want to delete this chapter? All scenes in this chapter will also be deleted.",
			)
		) {
			return;
		}

		const toastId = toast.loading("Deleting chapter...");
		try {
			const result = await deleteChapter(chapterId);
			if (result.success) {
				toast.success("Chapter deleted", { id: toastId });
				fetchStructure();
			} else {
				toast.error(result.error || "Failed to delete chapter", {
					id: toastId,
				});
			}
		} catch {
			toast.error("Failed to delete chapter", { id: toastId });
		}
	};

	const handleDeleteScene = async (sceneId: string) => {
		if (isReadOnly) return;
		if (!confirm("Are you sure you want to delete this scene?")) {
			return;
		}

		const toastId = toast.loading("Deleting scene...");
		try {
			const result = await deleteScene(sceneId);
			if (result.success) {
				toast.success("Scene deleted", { id: toastId });
				fetchStructure();
			} else {
				toast.error(result.error || "Failed to delete scene", {
					id: toastId,
				});
			}
		} catch {
			toast.error("Failed to delete scene", { id: toastId });
		}
	};

	const handleAddScene = async (chapterId: string) => {
		if (isReadOnly) return;
		const toastId = toast.loading("Creating scene...");
		try {
			const result = await createSceneInChapter(
				chapterId,
				"New Scene",
				undefined,
			);
			if (result.success) {
				toast.success("Scene created", { id: toastId });
				fetchStructure();
				if (result.data?.sceneId) {
					setActiveSceneId(result.data.sceneId);
				}
			} else {
				toast.error(result.error || "Failed to create scene", {
					id: toastId,
				});
			}
		} catch {
			toast.error("Failed to create scene", { id: toastId });
		}
	};

	const handleReorderChapters = async (
		reorderedChapters: { id: string; volumeId: string | null }[],
	) => {
		if (!reorderedChapters || reorderedChapters.length === 0) return;

		// Get volume ID from first chapter
		const volumeId = reorderedChapters[0].volumeId;
		if (!volumeId) return;

		const chapterIds = reorderedChapters.map((ch) => ch.id);

		const toastId = toast.loading("Reordering chapters...");
		const result = await reorderChapters(chapterIds, volumeId);

		if (result.success) {
			toast.success("Chapters reordered", { id: toastId });
			fetchStructure();
		} else {
			toast.error(result.error || "Failed to reorder chapters", {
				id: toastId,
			});
			// Revert on error
			fetchStructure();
		}
	};

	const handleReorderScenes = async (
		reorderedScenes: Array<{ id: string }>,
		chapterId: string,
	) => {
		const sceneIds = reorderedScenes.map((s) => s.id);

		const toastId = toast.loading("Reordering scenes...");
		const result = await reorderScenes(sceneIds, chapterId);

		if (result.success) {
			toast.success("Scenes reordered", { id: toastId });
			fetchStructure();
		} else {
			toast.error(result.error || "Failed to reorder scenes", {
				id: toastId,
			});
			// Revert on error
			fetchStructure();
		}
	};

	return {
		handleAddChapter,
		handleUpdateChapterTitle,
		handleUpdateSceneTitle,
		handleDeleteChapter,
		handleDeleteScene,
		handleAddScene,
		handleReorderChapters,
		handleReorderScenes,
	};
}
