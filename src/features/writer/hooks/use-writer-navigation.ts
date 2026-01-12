import { useEffect } from "react";
import {
	useBookCanvasActions,
	useBookCanvasSelection,
} from "@/components/organisms/book-canvas/book-canvas-context";
import { updateLastViewedScene } from "@/features/writer/actions";
import type { ChapterWithScenes } from "@/lib/types";

interface UseWriterNavigationProps {
	projectId: string;
	structure: ChapterWithScenes[] | null;
	lastViewedSceneId?: string | null;
	isLoading: boolean;
}

interface UseWriterNavigationReturn {
	activeSceneId: string | null;
	setActiveSceneId: (id: string | null) => void;
}

/**
 * Manages the navigation state (active scene) in the writer view.
 * Handles restoring last viewed scene and syncing with BookCanvas.
 *
 * @param props - Configuration properties
 * @param props.projectId - The ID of the project
 * @param props.structure - The current project structure
 * @param props.lastViewedSceneId - The last viewed scene ID from the server
 * @param props.isLoading - Whether the structure is loading
 * @returns Object containing navigation state and helpers
 */
export function useWriterNavigation({
	projectId,
	structure,
	lastViewedSceneId,
	isLoading,
}: UseWriterNavigationProps): UseWriterNavigationReturn {
	const { activeSceneId } = useBookCanvasSelection();
	const { setActiveSceneId } = useBookCanvasActions();

	// Initialize selection
	useEffect(() => {
		if (isLoading || !structure || structure.length === 0) return;

		// Check if current selection is already valid within structure
		const isValid =
			activeSceneId &&
			structure.some((ch) => ch.scenes.some((s) => s.id === activeSceneId));

		if (isValid) return;

		// Try to restore last viewed scene
		if (
			lastViewedSceneId &&
			structure.some((ch) => ch.scenes.some((s) => s.id === lastViewedSceneId))
		) {
			setActiveSceneId(lastViewedSceneId);
			return;
		}

		// Fallback to first scene
		if (structure[0].scenes.length > 0) {
			setActiveSceneId(structure[0].scenes[0].id);
		}
	}, [
		structure,
		lastViewedSceneId,
		isLoading,
		setActiveSceneId,
		activeSceneId,
	]);

	// Persist last viewed scene
	useEffect(() => {
		if (activeSceneId && projectId) {
			const timer = setTimeout(async () => {
				try {
					await updateLastViewedScene({ projectId, sceneId: activeSceneId });
				} catch (error) {
					console.error("Failed to update last viewed scene:", error);
				}
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [activeSceneId, projectId]);

	return {
		activeSceneId,
		setActiveSceneId,
	};
}
