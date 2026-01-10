import { useEffect, useRef } from "react";
import { updateLastViewedScene } from "@/app/actions/writer";
import {
	useBookCanvasActions,
	useBookCanvasValue,
} from "@/components/organisms/book-canvas/book-canvas-context";
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
	activeSceneIdRef: React.MutableRefObject<string | null>;
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
	const { activeSceneId } = useBookCanvasValue();
	const { setActiveSceneId } = useBookCanvasActions();

	// Ref to access current active ID without dependency cycles
	const activeSceneIdRef = useRef(activeSceneId);
	useEffect(() => {
		activeSceneIdRef.current = activeSceneId;
	}, [activeSceneId]);

	// Initialize selection
	useEffect(() => {
		if (isLoading || !structure) return;

		const currentId = activeSceneIdRef.current;

		// If we already have a valid selection that exists in structure, do nothing
		if (
			currentId &&
			structure.some((ch) => ch.scenes.some((s) => s.id === currentId))
		) {
			return;
		}

		// Try to restore last viewed scene
		if (
			lastViewedSceneId &&
			structure.some((ch) => ch.scenes.some((s) => s.id === lastViewedSceneId))
		) {
			setActiveSceneId(lastViewedSceneId);
			return;
		}

		// Fallback to first scene
		if (structure.length > 0 && structure[0].scenes.length > 0) {
			setActiveSceneId(structure[0].scenes[0].id);
		}
	}, [structure, lastViewedSceneId, isLoading, setActiveSceneId]);

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
		activeSceneIdRef,
	};
}
