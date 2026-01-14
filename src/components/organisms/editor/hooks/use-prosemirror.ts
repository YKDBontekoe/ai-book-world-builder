import { EditorView } from "prosemirror-view";
import { useEffect, useRef, useState } from "react";
import { handleTransaction } from "@/lib/editor/config";
import { buildDocumentFromContent } from "@/lib/editor/functions";
import { createEditorState } from "../utils/create-editor-state";
import type { MentionState } from "./use-mention";

interface UseProseMirrorProps {
	containerRef: React.RefObject<HTMLDivElement>;
	content: string;
	readOnly: boolean;
	onSaveContent: (updatedContent: string, debounce: boolean) => void;
	onSelectionChange?: (selectionText: string) => void;
	typewriterMode?: boolean;
	status: "streaming" | "idle";
	onMentionStateChange: (
		state: MentionState | null,
		coords: { left: number; top: number } | null,
	) => void;
	sceneId?: string;
}

export function useProseMirror({
	containerRef,
	content,
	readOnly,
	onSaveContent,
	onSelectionChange,
	typewriterMode,
	status,
	onMentionStateChange,
	sceneId,
}: UseProseMirrorProps) {
	const editorRef = useRef<EditorView | null>(null);
	const [mounted, setMounted] = useState(false);
	const prevContentRef = useRef<string | null>(null);
	const prevSceneIdRef = useRef<string | undefined>(sceneId);
	const onMentionStateChangeRef = useRef(onMentionStateChange);

	// Update ref whenever the callback changes
	onMentionStateChangeRef.current = onMentionStateChange;

	// Initialize editor once
	useEffect(() => {
		if (!containerRef.current) return;

		// If editor already exists, don't recreate it
		if (editorRef.current) return;

		const doc = buildDocumentFromContent(content || "");

		// Use the new helper to create state
		const state = createEditorState({
			doc,
			editorRef,
			onMentionStateChangeRef,
		});

		editorRef.current = new EditorView(containerRef.current, {
			state,
			editable: () => !readOnly,
		});

		prevContentRef.current = content;
		prevSceneIdRef.current = sceneId;
		setMounted(true);

		return () => {
			if (editorRef.current) {
				editorRef.current.destroy();
				editorRef.current = null;
			}
		};
	}, [containerRef]); // Only run on mount or if dependencies change (early return if already initialized)

	// Synchronize content when it changes externally
	useEffect(() => {
		// Skip if editor doesn't exist
		if (!editorRef.current) {
			return;
		}

		const isSceneChange = sceneId !== prevSceneIdRef.current;
		const isContentChanged = prevContentRef.current !== content;

		// If nothing changed, return
		if (!isSceneChange && !isContentChanged) {
			return;
		}

		// If user is editing (has focus), don't overwrite their work with external updates
		// UNLESS:
		// 1. We are in streaming mode (additive)
		// 2. OR The scene ID changed (user switched scene) - this overrides focus
		const shouldOverrideFocus = status === "streaming" || isSceneChange;

		if (editorRef.current.hasFocus() && !shouldOverrideFocus) {
			return;
		}

		const newDocument = buildDocumentFromContent(content || "");

		if (isSceneChange) {
			// ⚡ Bolt Optimization:
			// When scene changes, we reuse the existing EditorView instance but
			// completely reset the EditorState. This is much faster than destroying
			// and recreating the DOM/EditorView.
			// It also ensures history (Undo/Redo) is reset for the new scene.
			const newState = createEditorState({
				doc: newDocument,
				editorRef,
				onMentionStateChangeRef,
			});
			editorRef.current.updateState(newState);
		} else {
			// Normal update: replace content in existing state (preserves history)
			const transaction = editorRef.current.state.tr.replaceWith(
				0,
				editorRef.current.state.doc.content.size,
				newDocument.content,
			);
			// Mark as no-save to prevent looping back
			transaction.setMeta("no-save", true);
			editorRef.current.dispatch(transaction);
		}

		prevContentRef.current = content;
		prevSceneIdRef.current = sceneId;
	}, [content, status, sceneId]);

	useEffect(() => {
		if (editorRef.current) {
			editorRef.current.setProps({
				editable: () => !readOnly,
				// Handlers will be updated by the parent component via direct manipulation or another effect if needed
				// But generally props are enough
				dispatchTransaction: (transaction) => {
					handleTransaction({
						transaction,
						editorRef,
						onSaveContent,
						onSelectionChange,
					});

					// Typewriter Logic
					if (typewriterMode && transaction.selectionSet) {
						setTimeout(() => {
							const view = editorRef.current;
							if (!view) return;
							const coords = view.coordsAtPos(view.state.selection.from);
							const scrollable =
								containerRef.current?.closest(".overflow-y-auto");
							if (scrollable) {
								const containerRect = scrollable.getBoundingClientRect();
								const relativeTop = coords.top - containerRect.top;
								const target = containerRect.height / 2;
								const diff = relativeTop - target;
								scrollable.scrollBy({ top: diff, behavior: "smooth" });
							}
						}, 0);
					}
				},
			});
		}
	}, [
		readOnly,
		typewriterMode,
		onSaveContent,
		onSelectionChange,
		containerRef.current?.closest,
	]);

	return { editorRef, mounted };
}
