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
import {
	buildContentFromDocument,
	buildDocumentFromContent,
} from "@/lib/editor/functions";
import { mentionPlugin } from "@/lib/editor/plugins/mention";
import { suggestionsPlugin } from "@/lib/editor/suggestions";
import type { MentionState } from "./use-mention";

interface UseProseMirrorProps {
	containerRef: React.RefObject<HTMLDivElement | null>;
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

	useEffect(() => {
		if (!containerRef.current || editorRef.current) return;

		const state = EditorState.create({
			doc: buildDocumentFromContent(content),
			plugins: [
				...exampleSetup({ schema: documentSchema, menuBar: false }),
				inputRules({ rules: [headingRule(1), headingRule(2), headingRule(3)] }),
				placeholder({ content: "Start writing..." } as any),
				mentionPlugin(onMentionStateChange),
				suggestionsPlugin,
			],
		});

		const view = new EditorView(containerRef.current, {
			state,
			dispatchTransaction(transaction) {
				handleTransaction({
					transaction,
					editorRef,
					onSaveContent,
					onSelectionChange,
				});
			},
			editable: () => !readOnly,
		});

		editorRef.current = view;
		setMounted(true);

		return () => {
			view.destroy();
			editorRef.current = null;
		};
	}, [
		containerRef,
		onSaveContent,
		onSelectionChange,
		readOnly,
		onMentionStateChange,
		content,
	]);

	useEffect(() => {
		if (editorRef.current && status === "idle") {
			const { state } = editorRef.current;
			// Use the helper to get content directly instead of handleTransaction which is for dispatch
			const currentDoc = buildContentFromDocument(state.doc);
			if (currentDoc !== content) {
				const newState = EditorState.create({
					doc: buildDocumentFromContent(content),
					plugins: state.plugins,
				});
				editorRef.current.updateState(newState);
			}
		}
	}, [content, status]);

	return { editorRef, mounted };
}
