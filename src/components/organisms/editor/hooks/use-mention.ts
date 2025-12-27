import type { EditorView } from "prosemirror-view";
import { useCallback, useMemo, useState } from "react";
import type { Entity } from "@/lib/db/schema";
import type { MentionState } from "@/lib/editor/plugins/mention";
export type { MentionState } from "@/lib/editor/plugins/mention";

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
	const filteredEntities = useMemo(
		() =>
			mentionables
				.filter((e) =>
					e.name
						.toLowerCase()
						.includes(mentionState?.query.toLowerCase() || ""),
				)
				.slice(0, 5),
		[mentionables, mentionState?.query],
	);

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

	return {
		mentionState,
		mentionCoords,
		setMentionCoords,
		setMentionState,
		filteredEntities,
		insertMention,
	};
}
