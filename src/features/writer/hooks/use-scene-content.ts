import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import { getSceneContent, updateSceneContent } from "@/features/writer/actions";

interface UseSceneContentProps {
	projectId?: string;
	activeSceneId?: string;
	initialContent?: string;
	onContentUpdate?: (sceneId: string, content: string) => void;
}

export interface UseSceneContentReturn {
	sceneContent: string;
	isSaving: boolean;
	lastSaved: Date | null;
	handleContentChange: (newContent: string) => void;
	setContentDirectly: (content: string) => void;
}

export function useSceneContent({
	projectId,
	activeSceneId,
	initialContent,
	onContentUpdate,
}: UseSceneContentProps): UseSceneContentReturn {
	// Initialize with initialContent if provided
	const [sceneContent, setSceneContent] = useState(initialContent ?? "");
	const [isSaving, setIsSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);

	// Ref to track if we've edited the content locally, to prevent overwriting
	const hasEditedRef = useRef(false);
	// Ref to track the current ID to avoid race conditions
	const activeSceneIdRef = useRef(activeSceneId);
	// Ref to track pending retry timeouts for cleanup
	const retryTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

	// Cleanup retry timeouts on unmount
	useEffect(() => {
		return () => {
			retryTimeoutsRef.current.forEach(clearTimeout);
			retryTimeoutsRef.current.clear();
		};
	}, []);

	// Load content or sync when active scene changes
	useEffect(() => {
		let isMounted = true;
		
		// Update ref immediately when activeSceneId changes to track current target
		const isSceneChanging = activeSceneIdRef.current !== activeSceneId;
		if (isSceneChanging) {
			activeSceneIdRef.current = activeSceneId;
			hasEditedRef.current = false;
		}

		if (activeSceneId) {
			// If we have initial content, use it.
			if (initialContent !== undefined && initialContent !== null) {
				setSceneContent((prev) => (prev === initialContent ? prev : initialContent));
			} else {
				// No initial content, clear and fetch.
				setSceneContent((prev) => (prev === "" ? prev : ""));

				if (!projectId) {
					console.warn("No projectId provided to useSceneContent");
					return;
				}

				getSceneContent(projectId, activeSceneId).then((result) => {
					if (!isMounted) return;

					// Race condition check: make sure we are still on the same scene
					if (activeSceneId !== activeSceneIdRef.current) return;

					if (result.success && result.content !== undefined) {
						// Only update if user hasn't started typing
						if (!hasEditedRef.current) {
							const content = result.content || "";
							setSceneContent((prev) => (prev === content ? prev : content));
							onContentUpdate?.(activeSceneId, content);
						}
					}
				});
			}
		} else {
			setSceneContent((prev) => (prev === "" ? prev : ""));
		}

		return () => {
			isMounted = false;
		};
	}, [activeSceneId, initialContent, onContentUpdate, projectId]); // Dependency on initialContent ensures we update if cache becomes available

	const performSave = async (content: string, id: string, retryCount = 0) => {
		setIsSaving(true);
		try {
			const result = await updateSceneContent(id, content);
			if (result.success) {
				setIsSaving(false);
				setLastSaved(new Date());
				onContentUpdate?.(id, content);
			} else {
				// Retry up to 2 times with exponential backoff
				if (retryCount < 2) {
					const timeoutId = setTimeout(
						() => {
							retryTimeoutsRef.current.delete(timeoutId);
							performSave(content, id, retryCount + 1);
						},
						1000 * 2 ** retryCount,
					);
					retryTimeoutsRef.current.add(timeoutId);
				} else {
					setIsSaving(false);
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
		} catch (_error) {
			if (retryCount < 2) {
				const timeoutId = setTimeout(
					() => {
						retryTimeoutsRef.current.delete(timeoutId);
						performSave(content, id, retryCount + 1);
					},
					1000 * 2 ** retryCount,
				);
				retryTimeoutsRef.current.add(timeoutId);
			} else {
				setIsSaving(false);
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

	const debouncedSave = useDebounceCallback((content: string, id: string) => {
		performSave(content, id, 0);
	}, 1000);

	const handleContentChange = useCallback(
		(newContent: string) => {
			hasEditedRef.current = true;
			setSceneContent(newContent);
			if (activeSceneId) {
				debouncedSave(newContent, activeSceneId);
			}
		},
		[activeSceneId, debouncedSave],
	);

	const setContentDirectly = useCallback((content: string) => {
		// Used for external updates (e.g. AI, undo/redo)
		// We consider this an "edit" too, or maybe not?
		// If AI generates content, we want it to stick.
		hasEditedRef.current = true;
		setSceneContent(content);
	}, []);

	return {
		sceneContent,
		isSaving,
		lastSaved,
		handleContentChange,
		setContentDirectly,
	};
}
