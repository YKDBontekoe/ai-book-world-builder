import { exampleSetup } from "prosemirror-example-setup";
import { inputRules } from "prosemirror-inputrules";
import type { Node } from "prosemirror-model";
import { placeholder } from "prosemirror-placeholder";
import { EditorState } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import type { MutableRefObject } from "react";
import { documentSchema, headingRule } from "@/lib/editor/config";
import { mentionPlugin } from "@/lib/editor/plugins/mention";
import { suggestionsPlugin } from "@/lib/editor/suggestions";
import type { MentionState } from "../hooks/use-mention";

interface CreateEditorStateOptions {
	doc: Node;
	editorRef: MutableRefObject<EditorView | null>;
	onMentionStateChangeRef: MutableRefObject<
		(
			state: MentionState | null,
			coords: { left: number; top: number } | null,
		) => void
	>;
}

export function createEditorState({
	doc,
	editorRef,
	onMentionStateChangeRef,
}: CreateEditorStateOptions) {
	return EditorState.create({
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
}
