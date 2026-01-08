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

export function useWriterNavigation({
	projectId,
	structure,
	lastViewedSceneId,
	isLoading,
}: UseWriterNavigationProps) {
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
			const timer = setTimeout(() => {
				updateLastViewedScene({ projectId, sceneId: activeSceneId });
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
