import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createChapterSnapshot } from "@/features/writer/actions";
import { useProjectStructure } from "@/features/writer/hooks/use-project-structure";
import { useSceneContent } from "@/features/writer/hooks/use-scene-content";
import { useWriterNavigation } from "@/features/writer/hooks/use-writer-navigation";
import type { ChapterWithScenes } from "@/lib/types";

interface UseWriterStateProps {
	projectId: string;
	initialStructure?: ChapterWithScenes[];
	initialStructureText?: string;
	lastViewedSceneId?: string | null;
}

export function useWriterState({
	projectId,
	initialStructure,
	initialStructureText,
	lastViewedSceneId,
}: UseWriterStateProps) {
	// 1. Structure Management
	const {
		structure,
		structureText,
		isLoading: isStructureLoading,
		fetchStructure,
		updateSceneInStructure,
		setStructure,
		setStructureText,
	} = useProjectStructure({
		projectId,
		initialStructure,
		initialStructureText,
	});

	// 2. Navigation & Selection
	const { activeSceneId, setActiveSceneId } = useWriterNavigation({
		projectId,
		structure,
		lastViewedSceneId,
		isLoading: isStructureLoading,
	});

	// 3. Derived State: Active Scene Object
	const activeScene = useMemo(
		() =>
			structure?.flatMap((c) => c.scenes).find((s) => s.id === activeSceneId),
		[structure, activeSceneId],
	);

	// 4. Content Management (Editor State)
	const {
		sceneContent,
		isSaving,
		lastSaved,
		handleContentChange,
		setContentDirectly,
	} = useSceneContent({
		projectId,
		activeSceneId: activeSceneId || undefined,
		initialContent: activeScene?.content ?? undefined,
		onContentUpdate: updateSceneInStructure,
	});

	// 5. Actions (Snapshots)
	const [isSnapshotting, setIsSnapshotting] = useState(false);

	const handleSnapshot = useCallback(async () => {
		if (!activeScene?.chapterId) return;
		setIsSnapshotting(true);
		const result = await createChapterSnapshot(activeScene.chapterId);
		setIsSnapshotting(false);
		if (result.success) {
			toast.success("Chapter version saved");
		} else {
			toast.error("Failed to create version");
		}
	}, [activeScene]);

	// Initialize structure if needed
	useEffect(() => {
		if (!initialStructure) {
			fetchStructure();
		}
	}, [fetchStructure, initialStructure]);

	// Update local state when props change
	useEffect(() => {
		if (initialStructure) {
			setStructure((prev) =>
				isEqual(prev, initialStructure) ? prev : initialStructure,
			);
			const newText = initialStructureText || "";
			setStructureText((prev) => (prev === newText ? prev : newText));
		}
	}, [initialStructure, initialStructureText, setStructure, setStructureText]);

	return useMemo(
		() => ({
			structure,
			structureText,
			loading: isStructureLoading,
			activeSceneId,
			setActiveSceneId,
			sceneContent,
			activeScene,
			isSaving,
			lastSaved,
			isSnapshotting,
			handleContentChange,
			setContentDirectly,
			handleSnapshot,
			fetchStructure,
		}),
		[
			structure,
			structureText,
			isStructureLoading,
			activeSceneId,
			setActiveSceneId,
			sceneContent,
			activeScene,
			isSaving,
			lastSaved,
			isSnapshotting,
			handleContentChange,
			setContentDirectly,
			handleSnapshot,
			fetchStructure,
		],
	);
}
