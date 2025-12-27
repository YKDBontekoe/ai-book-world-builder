import type { EditorView } from "prosemirror-view";
import { useCallback, useEffect, useState } from "react";
import type { Suggestion } from "@/lib/db/schema";
import { createDecorations } from "@/lib/editor/functions";
import {
	projectWithPositions,
	suggestionsPluginKey,
	type UISuggestion,
} from "@/lib/editor/suggestions";

export interface ActiveSuggestion {
	suggestion: UISuggestion;
	coords: { left: number; top: number };
}

export function useSuggestions(
	editorView: EditorView | null,
	suggestions: Suggestion[],
	content: string,
	containerRef: React.RefObject<HTMLDivElement>,
): {
	activeSuggestion: ActiveSuggestion | null;
	setActiveSuggestion: React.Dispatch<React.SetStateAction<ActiveSuggestion | null>>;
	projectedSuggestions: UISuggestion[];
	handleApplySuggestion: () => void;
} {
	const [activeSuggestion, setActiveSuggestion] =
		useState<ActiveSuggestion | null>(null);
	const [projectedSuggestions, setProjectedSuggestions] = useState<
		UISuggestion[]
	>([]);

	// Handle suggestion apply
	const handleApplySuggestion = useCallback(() => {
		if (!editorView || !activeSuggestion) return;

		const { suggestion } = activeSuggestion;
		const { state, dispatch } = editorView;

		const currentState = suggestionsPluginKey.getState(state);
		const currentDecorations = currentState?.decorations;
		if (!currentDecorations) return;

		const newDecorations = currentDecorations
			.find()
			.filter(
				(decoration: { spec: { suggestionId?: string } }) =>
					decoration.spec.suggestionId !== suggestion.id,
			);

		const tr = state.tr.replaceWith(
			suggestion.selectionStart,
			suggestion.selectionEnd,
			state.schema.text(suggestion.suggestedText),
		);
		tr.setMeta("no-debounce", true);
		tr.setMeta(suggestionsPluginKey, {
			decorations:
				newDecorations.length > 0
					? currentDecorations.remove(
							currentDecorations
								.find()
								.filter(
									(d: { spec: { suggestionId?: string } }) =>
										d.spec.suggestionId === suggestion.id,
								),
						)
					: currentDecorations,
			selected: null,
		});
		dispatch(tr);

		setActiveSuggestion(null);
	}, [editorView, activeSuggestion]);

	// Handle click on suggestion highlights
	const handleEditorClick = useCallback(
		(event: MouseEvent) => {
			const target = event.target as HTMLElement;
			const suggestionId = target
				.closest("[data-suggestion-id]")
				?.getAttribute("data-suggestion-id");

			if (suggestionId) {
				const suggestion = projectedSuggestions.find(
					(s) => s.id === suggestionId,
				);
				if (suggestion && editorView) {
					const coords = editorView.coordsAtPos(suggestion.selectionStart);
					setActiveSuggestion({
						suggestion,
						coords: { left: coords.left, top: coords.bottom + 8 },
					});
					event.preventDefault();
					event.stopPropagation();
				}
			} else if (activeSuggestion) {
				// Close suggestion if clicking outside
				const suggestionPopup = (event.target as HTMLElement).closest(
					"[data-suggestion-popup]",
				);
				if (!suggestionPopup) {
					setActiveSuggestion(null);
				}
			}
		},
		[projectedSuggestions, activeSuggestion, editorView],
	);

	// Add click handler for suggestion highlights
	useEffect(() => {
		const container = containerRef.current;
		if (container) {
			container.addEventListener("click", handleEditorClick);
			return () => container.removeEventListener("click", handleEditorClick);
		}
	}, [handleEditorClick, containerRef]);

	useEffect(() => {
		if (editorView?.state.doc && content) {
			const projected = projectWithPositions(
				editorView.state.doc,
				suggestions,
			).filter(
				(suggestion) =>
					suggestion.selectionStart != null && suggestion.selectionEnd != null,
			);

			setProjectedSuggestions(projected);

			const decorations = createDecorations(projected, editorView);

			const transaction = editorView.state.tr;
			transaction.setMeta(suggestionsPluginKey, { decorations });
			editorView.dispatch(transaction);
		}
	}, [suggestions, content, editorView]);

	return {
		activeSuggestion,
		setActiveSuggestion,
		projectedSuggestions,
		handleApplySuggestion,
	};
}
