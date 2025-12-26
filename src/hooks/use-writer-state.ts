import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import {
	createChapterSnapshot,
	getProjectStructure,
	getSceneContent,
	updateLastViewedScene,
	updateSceneContent,
} from "@/app/actions/writer";
import {
	useBookCanvasActions,
	useBookCanvasValue,
} from "@/components/organisms/book-canvas/book-canvas-context";
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

	const [sceneContent, setSceneContent] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [isSnapshotting, setIsSnapshotting] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);

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

	// Find the active scene object
	const activeScene = useMemo(
		() =>
			structure?.flatMap((c) => c.scenes).find((s) => s.id === activeSceneId),
		[structure, activeSceneId],
	);

	// Load content when active scene changes
	useEffect(() => {
		let isMounted = true;

		if (activeScene) {
			// If content is already present (e.g. from optimistic update, previous fetch, or cache), use it
			if (activeScene.content !== undefined && activeScene.content !== null) {
				setSceneContent(activeScene.content);
			} else {
				// Clear content to prevent showing stale data while fetching
				setSceneContent("");

				// Fetch content on demand
				getSceneContent(activeScene.id).then((result) => {
					if (isMounted && result.success && result.content !== undefined) {
						setSceneContent(result.content || "");

						// Update structure to cache the fetched content
						setStructure((prev) =>
							prev
								? prev.map((c) => ({
										...c,
										scenes: c.scenes.map((s) =>
											s.id === activeScene.id
												? { ...s, content: result.content }
												: s,
										),
									}))
								: null,
						);
					}
				});
			}
		} else {
			setSceneContent("");
		}

		return () => {
			isMounted = false;
		};
	}, [activeSceneId, activeScene]); // Dependencies: if activeScene object changes (e.g. structure update), we re-evaluate.

	const fetchStructure = useCallback(async () => {
		setLoading(true);
		const result = await getProjectStructure(projectId);
		if (result.structure) {
			// Cast the result to our extended type for now
			setStructure(result.structure as unknown as ChapterWithScenes[]);
			if (result.structureText) {
				setStructureText(result.structureText);
			}
			if (
				!activeSceneId &&
				result.structure.length > 0 &&
				result.structure[0].scenes.length > 0
			) {
				// Check for last viewed scene match
				const hasLastViewed =
					lastViewedSceneId &&
					result.structure.some((c: any) =>
						c.scenes.some((s: any) => s.id === lastViewedSceneId),
					);
				if (hasLastViewed && lastViewedSceneId) {
					setActiveSceneId(lastViewedSceneId);
				} else {
					setActiveSceneId(result.structure[0].scenes[0].id);
				}
			}
		}
		setLoading(false);
	}, [projectId, activeSceneId, setActiveSceneId]);

	useEffect(() => {
		// Only fetch if no structure or if we are supposed to (though logic above handles initialStructure updates)
		// But if we navigate to a new project and initialStructure is NOT provided for some reason, we fetch.
		if (!initialStructure) {
			fetchStructure();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, fetchStructure]); // Removed initialStructure from dep array to avoid loops if reference unstable, but typically safe.
	// Actually, if initialStructure changes, the other useEffect handles it. This one handles missing initialStructure.

	const performSave = async (content: string, id: string, retryCount = 0) => {
		setIsSaving(true);
		try {
			const result = await updateSceneContent(id, content);
			setIsSaving(false);
			if (result.success) {
				setLastSaved(new Date());
				setStructure((prev) =>
					prev
						? prev.map((c) => ({
								...c,
								scenes: c.scenes.map((s) =>
									s.id === id ? { ...s, content } : s,
								),
							}))
						: null,
				);
			} else {
				// Retry up to 2 times with exponential backoff
				if (retryCount < 2) {
					setTimeout(() => {
						performSave(content, id, retryCount + 1);
					}, 1000 * Math.pow(2, retryCount));
				} else {
					toast.error("Failed to save changes. Please try again.", {
						duration: 5000,
						action: {
							label: "Retry",
							onClick: () => {
								performSave(content, id, 0);
							},
						},
					});
				}
			}
		} catch (error) {
			setIsSaving(false);
			if (retryCount < 2) {
				setTimeout(() => {
					performSave(content, id, retryCount + 1);
				}, 1000 * Math.pow(2, retryCount));
			} else {
				toast.error("Failed to save changes. Please check your connection.", {
					duration: 5000,
					action: {
						label: "Retry",
						onClick: () => {
							performSave(content, id, 0);
						},
					},
				});
			}
		}
	};

	const debouncedSave = useDebounceCallback(
		(content: string, id: string) => {
			performSave(content, id, 0);
		},
		1000,
	);

	const handleContentChange = useCallback(
		(newContent: string) => {
			setSceneContent(newContent);
			if (activeSceneId) {
				debouncedSave(newContent, activeSceneId);
			}
		},
		[activeSceneId, debouncedSave],
	);

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
				updateLastViewedScene(projectId, activeSceneId);
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
