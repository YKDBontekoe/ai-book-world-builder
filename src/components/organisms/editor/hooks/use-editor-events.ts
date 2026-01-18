import { useEffect } from "react";
import type { EditorView } from "prosemirror-view";
import type { Entity, Suggestion } from "@/lib/db/schema";
import type { MentionState } from "./use-mention";

interface UseEditorEventsProps {
	editorView: EditorView | null;
	mentionState: MentionState | null;
	filteredEntities: Entity[];
	insertMention: (entity: Entity) => void;
	activeSuggestion: Suggestion | null;
	setActiveSuggestion: (suggestion: Suggestion | null) => void;
}

export function useEditorEvents({
	editorView,
	mentionState,
	filteredEntities,
	insertMention,
	activeSuggestion,
	setActiveSuggestion,
}: UseEditorEventsProps) {
	useEffect(() => {
		if (editorView) {
			const currentProps = editorView.props;

			editorView.setProps({
				...currentProps,
				handleKeyDown: (_view, event) => {
					// Check if mention menu is active
					if (mentionState?.active) {
						if (event.key === "Enter") {
							event.preventDefault();
							if (filteredEntities.length > 0) {
								const entityToInsert =
									filteredEntities[mentionState.index] || filteredEntities[0];
								insertMention(entityToInsert);
								return true;
							}
							return true;
						}
						return false;
					}
					// Close suggestion popup on Escape
					if (activeSuggestion && event.key === "Escape") {
						setActiveSuggestion(null);
						return true;
					}
					return false;
				},
			});
		}
	}, [
		editorView,
		mentionState,
		filteredEntities,
		insertMention,
		activeSuggestion,
		setActiveSuggestion,
	]);
}
