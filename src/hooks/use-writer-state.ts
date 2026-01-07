import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
	createChapterSnapshot,
	getProjectStructure,
	updateLastViewedScene,
} from "@/app/actions/writer";
import {
	useBookCanvasActions,
	useBookCanvasValue,
} from "@/components/organisms/book-canvas/book-canvas-context";
import { useSceneContent } from "@/hooks/use-scene-content";
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
	const [structure, setStructure] = useState<ChapterWithScenes[] | null>(
		initialStructure ?? null,
	);
	const [structureText, setStructureText] = useState(
		initialStructureText ?? "",
	);
	const [loading, setLoading] = useState(!initialStructure);

	// Use context for active scene to sync with Book Canvas
	const { activeSceneId } = useBookCanvasValue();
	const { setActiveSceneId, setProjectId } = useBookCanvasActions();

	// ⚡ Bolt: Store activeSceneId in a ref to access it in fetchStructure
	// without adding it to the dependency array. This stabilizes fetchStructure
	// and prevents unnecessary context updates/re-renders during navigation.
	const activeSceneIdRef = useRef(activeSceneId);
	useEffect(() => {
		activeSceneIdRef.current = activeSceneId;
	}, [activeSceneId]);

	const [isSnapshotting, setIsSnapshotting] = useState(false);

	// Sync project ID to Book Canvas context
	useEffect(() => {
		if (projectId) {
			setProjectId(projectId);
		}
	}, [projectId, setProjectId]);

	// Update state if initial props change (e.g. navigation)
	useEffect(() => {
		if (initialStructure) {
			setStructure(initialStructure);
			setStructureText(initialStructureText || "");
			setLoading(false);
		}
	}, [initialStructure, initialStructureText]);

	// Callback to sync content updates from useSceneContent back to structure state
	const onContentUpdate = useCallback((id: string, content: string) => {
		setStructure((prev) =>
			prev
				? prev.map((c) => ({
						...c,
						scenes: c.scenes.map((s) => (s.id === id ? { ...s, content } : s)),
					}))
				: null,
		);
	}, []);

	// Find the active scene object to extract cached content
	const activeScene = useMemo(
		() =>
			structure?.flatMap((c) => c.scenes).find((s) => s.id === activeSceneId),
		[structure, activeSceneId],
	);

	// Use extracted hook for content management
	const { sceneContent, isSaving, lastSaved, handleContentChange } =
		useSceneContent({
			activeSceneId: activeSceneId || undefined,
			initialContent: activeScene?.content ?? undefined,
			onContentUpdate,
		});

	const fetchStructure = useCallback(async () => {
		setLoading(true);
		const result = await getProjectStructure({ projectId });
		if (result.success && result.data.structure) {
			const { structure, structureText } = result.data;
			// Cast the result to our extended type for now
			setStructure(structure as unknown as ChapterWithScenes[]);
			if (structureText) {
				setStructureText(structureText);
			}

			// Use the ref here instead of the dependency
			const currentActiveId = activeSceneIdRef.current;

			if (
				!currentActiveId &&
				structure.length > 0 &&
				structure[0].scenes.length > 0
			) {
				// Check for last viewed scene match
				const hasLastViewed =
					lastViewedSceneId &&
					structure.some((c: any) =>
						c.scenes.some((s: any) => s.id === lastViewedSceneId),
					);
				if (hasLastViewed && lastViewedSceneId) {
					setActiveSceneId(lastViewedSceneId);
				} else {
					setActiveSceneId(structure[0].scenes[0].id);
				}
			}
		}
		setLoading(false);
	}, [projectId, lastViewedSceneId, setActiveSceneId]);

	useEffect(() => {
		// Only fetch if no structure or if we are supposed to (though logic above handles initialStructure updates)
		// But if we navigate to a new project and initialStructure is NOT provided for some reason, we fetch.
		if (!initialStructure) {
			fetchStructure();
		}
	}, [fetchStructure, initialStructure]);

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

	// Persist last viewed scene
	useEffect(() => {
		if (activeSceneId && projectId) {
			const timer = setTimeout(() => {
				updateLastViewedScene({ projectId, sceneId: activeSceneId });
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [activeSceneId, projectId]);

	// Initialize selection from lastViewedSceneId if needed (when structure loaded via props)
	useEffect(() => {
		if (loading || !structure) return;

		const isValid =
			activeSceneId &&
			structure.some((ch) => ch.scenes.some((s) => s.id === activeSceneId));

		if (!isValid) {
			if (
				lastViewedSceneId &&
				structure.some((ch) =>
					ch.scenes.some((s) => s.id === lastViewedSceneId),
				)
			) {
				setActiveSceneId(lastViewedSceneId);
			} else if (structure.length > 0 && structure[0].scenes.length > 0) {
				setActiveSceneId(structure[0].scenes[0].id);
			}
		}
	}, [structure, activeSceneId, lastViewedSceneId, loading, setActiveSceneId]);

	return useMemo(
		() => ({
			structure,
			structureText,
			loading,
			activeSceneId,
			setActiveSceneId,
			sceneContent,
			activeScene,
			isSaving,
			lastSaved,
			isSnapshotting,
			handleContentChange,
			handleSnapshot,
			fetchStructure,
		}),
		[
			structure,
			structureText,
			loading,
			activeSceneId,
			setActiveSceneId,
			sceneContent,
			activeScene,
			isSaving,
			lastSaved,
			isSnapshotting,
			handleContentChange,
			handleSnapshot,
			fetchStructure,
		],
	);
}
