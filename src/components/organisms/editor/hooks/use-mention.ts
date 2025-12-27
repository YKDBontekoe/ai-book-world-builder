import type { EditorView } from "prosemirror-view";
import { useCallback, useState } from "react";
import type { Entity } from "@/lib/db/schema";
import { mentionPlugin } from "@/lib/editor/plugins/mention";

export interface MentionState {
	active: boolean;
	range: { from: number; to: number } | null;
	query: string;
	index: number;
}

export function useMention(
	editorView: EditorView | null,
	mentionables: Entity[] = [],
) {
	const [mentionState, setMentionState] = useState<MentionState | null>(null);
	const [mentionCoords, setMentionCoords] = useState<{
		left: number;
		top: number;
	} | null>(null);

	// Filter Entities
	const filteredEntities = mentionables
		.filter((e) =>
			e.name.toLowerCase().includes(mentionState?.query.toLowerCase() || ""),
		)
		.slice(0, 5);

	// Handle Mention Selection
	const insertMention = useCallback(
		(entity: Entity) => {
			if (!editorView || !mentionState || !mentionState.range) return;

			const { range } = mentionState;
			const tr = editorView.state.tr.replaceWith(
				range.from,
				range.to,
				editorView.state.schema.text(`${entity.name} `),
			);

			editorView.dispatch(tr);
			editorView.focus();
			setMentionState(null);
		},
		[editorView, mentionState],
	);

	const plugin = mentionPlugin((state) => {
		setMentionState(state);
		if (state?.active && state.range && editorView) {
			const coords = editorView.coordsAtPos(state.range.from);
			setMentionCoords({ left: coords.left, top: coords.bottom + 5 });
		} else {
			setMentionCoords(null);
		}
	});

	return {
		mentionState,
		mentionCoords,
		setMentionCoords,
		setMentionState,
		filteredEntities,
		insertMention,
		plugin,
	};
}
