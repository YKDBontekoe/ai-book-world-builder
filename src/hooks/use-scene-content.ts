import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import { getSceneContent, updateSceneContent } from "@/app/actions/writer";

interface UseSceneContentProps {
	activeSceneId?: string;
	initialContent?: string;
	onContentUpdate?: (sceneId: string, content: string) => void;
}

export function useSceneContent({
	activeSceneId,
	initialContent,
	onContentUpdate,
}: UseSceneContentProps) {
	// Initialize with initialContent if provided
	const [sceneContent, setSceneContent] = useState(initialContent ?? "");
	const [isSaving, setIsSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);

	// Ref to track if we've edited the content locally, to prevent overwriting
	const hasEditedRef = useRef(false);
	// Ref to track the current ID to avoid race conditions
	const activeSceneIdRef = useRef(activeSceneId);

	// Reset edited flag and sync ID ref on ID change
	if (activeSceneIdRef.current !== activeSceneId) {
		activeSceneIdRef.current = activeSceneId;
		hasEditedRef.current = false;
		// If we are switching scenes, we reset the state based on the new initialContent
		// We do this in the render phase (derived state) pattern or effect?
		// React docs suggest effect or key-reset. But here we are inside the hook.
		// Since we use useEffect below, we can let it handle the sync.
	}

	// Load content or sync when active scene changes
	useEffect(() => {
		let isMounted = true;

		if (activeSceneId) {
			// If we have initial content, use it.
			if (initialContent !== undefined && initialContent !== null) {
				setSceneContent(initialContent);
			} else {
				// No initial content, clear and fetch.
				setSceneContent("");

				getSceneContent(activeSceneId).then((result) => {
					if (!isMounted) return;

					// Race condition check: make sure we are still on the same scene
					if (activeSceneId !== activeSceneIdRef.current) return;

					if (result.success && result.content !== undefined) {
						// Only update if user hasn't started typing
						if (!hasEditedRef.current) {
							setSceneContent(result.content || "");
							onContentUpdate?.(activeSceneId, result.content || "");
						}
					}
				});
			}
		} else {
			setSceneContent("");
		}

		return () => {
			isMounted = false;
		};
	}, [activeSceneId, initialContent]); // Dependency on initialContent ensures we update if cache becomes available

	const performSave = async (content: string, id: string, retryCount = 0) => {
		setIsSaving(true);
		try {
			const result = await updateSceneContent(id, content);
			setIsSaving(false);
			if (result.success) {
				setLastSaved(new Date());
				onContentUpdate?.(id, content);
			} else {
				// Retry up to 2 times with exponential backoff
				if (retryCount < 2) {
					setTimeout(
						() => {
							performSave(content, id, retryCount + 1);
						},
						1000 * 2 ** retryCount,
					);
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
				setTimeout(
					() => {
						performSave(content, id, retryCount + 1);
					},
					1000 * 2 ** retryCount,
				);
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
		setContentDirectly
	};
}
