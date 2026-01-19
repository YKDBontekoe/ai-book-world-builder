import { exampleSetup } from "prosemirror-example-setup";
import { inputRules } from "prosemirror-inputrules";
import { placeholder } from "prosemirror-placeholder";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { useEffect, useRef, useState } from "react";
import {
	documentSchema,
	handleTransaction,
	headingRule,
} from "@/lib/editor/config";
import { buildDocumentFromContent } from "@/lib/editor/functions";
import { mentionPlugin } from "@/lib/editor/plugins/mention";
import { suggestionsPlugin } from "@/lib/editor/suggestions";
import type { MentionState } from "./use-mention";
import { useTypewriterScroll } from "./use-typewriter-scroll";

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
}: UseProseMirrorProps) {
	const editorRef = useRef<EditorView | null>(null);
	const [mounted, setMounted] = useState(false);
	const prevContentRef = useRef<string | null>(null);
	const onMentionStateChangeRef = useRef(onMentionStateChange);

	const handleTypewriterScroll = useTypewriterScroll({
		editorRef,
		containerRef,
		typewriterMode,
	});

	// Update ref whenever the callback changes
	onMentionStateChangeRef.current = onMentionStateChange;

	// Initialize editor once
	useEffect(() => {
		if (!containerRef.current) return;

		// If editor already exists, don't recreate it
		if (editorRef.current) return;

		const doc = buildDocumentFromContent(content || "");

		const state = EditorState.create({
			doc,
			plugins: [
				...exampleSetup({ schema: documentSchema, menuBar: false }),
				inputRules({
					rules: [
						headingRule(1),
						headingRule(2),
						headingRule(3),
						headingRule(4),
						headingRule(5),
						headingRule(6),
					],
				}),
				placeholder("Start writing your scene... (Type '/' for commands)"),
				suggestionsPlugin,
				mentionPlugin((state) => {
					if (state?.active && state.range && editorRef.current) {
						const coords = editorRef.current.coordsAtPos(state.range.from);
						onMentionStateChangeRef.current(state, {
							left: coords.left,
							top: coords.bottom + 5,
						});
					} else {
						onMentionStateChangeRef.current(null, null);
					}
				}),
			],
		});

		editorRef.current = new EditorView(containerRef.current, {
			state,
			editable: () => !readOnly,
		});

		prevContentRef.current = content;
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
		// Skip if content hasn't changed or editor doesn't exist
		if (prevContentRef.current === content || !editorRef.current) {
			return;
		}

		// If user is editing (has focus), don't overwrite their work with external updates
		// UNLESS we are in streaming mode, which is an additive process we want to show
		if (editorRef.current.hasFocus() && status !== "streaming") {
			return;
		}
		const newDocument = buildDocumentFromContent(content || "");
		const transaction = editorRef.current.state.tr.replaceWith(
			0,
			editorRef.current.state.doc.content.size,
			newDocument.content,
		);

		// Mark as no-save to prevent looping back
		transaction.setMeta("no-save", true);

		editorRef.current.dispatch(transaction);
		prevContentRef.current = content;
	}, [content, status]);

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

					handleTypewriterScroll(transaction.selectionSet);
				},
			});
		}
	}, [readOnly, onSaveContent, onSelectionChange, handleTypewriterScroll]);

	return { editorRef, mounted };
}
