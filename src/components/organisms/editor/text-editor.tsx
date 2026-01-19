"use client";

import { redo, undo } from "prosemirror-history";
import {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { EditorBubbleMenu } from "@/features/writer/components/tools/editor-bubble-menu";
import type { Entity, Suggestion } from "@/lib/db/schema";
import { type MentionState, useMention } from "./hooks/use-mention";
import { useProseMirror } from "./hooks/use-prosemirror";
import { useSuggestions } from "./hooks/use-suggestions";
import { MentionList } from "./mention-list";
import { SuggestionPopup } from "./suggestion-popup";

export interface EditorHandle {
	undo: () => void;
	redo: () => void;
	insertText: (text: string) => void;
	getSelection: () => { from: number; to: number; text: string } | null;
}

type EditorProps = {
	content: string;
	onSaveContent: (updatedContent: string, debounce: boolean) => void;
	status: "streaming" | "idle";
	isCurrentVersion: boolean;
	currentVersionIndex: number;
	suggestions: Suggestion[];
	onSelectionChange?: (selectionText: string) => void;
	readOnly?: boolean;
	typewriterMode?: boolean;
	mentionables?: Entity[];
};

const PureEditor = forwardRef<EditorHandle, EditorProps>(
	(
		{
			content,
			onSaveContent,
			suggestions,
			status,
			onSelectionChange,
			readOnly = false,
			typewriterMode = false,
			mentionables = [],
		},
		ref,
	) => {
		const containerRef = useRef<HTMLDivElement>(null);

		// Hoist mention state to pass to useProseMirror init
		const [tempMentionState, setTempMentionState] =
			useState<MentionState | null>(null);
		const [tempMentionCoords, setTempMentionCoords] = useState<{
			left: number;
			top: number;
		} | null>(null);

		const handleMentionStateChange = useCallback(
			(
				state: MentionState | null,
				coords: {
					left: number;
					top: number;
				} | null,
			) => {
				setTempMentionState(state);
				setTempMentionCoords(coords);
			},
			[],
		);

		const { editorRef, mounted: _mounted } = useProseMirror({
			containerRef: containerRef as React.RefObject<HTMLDivElement>,
			content,
			readOnly,
			onSaveContent,
			onSelectionChange,
			typewriterMode,
			status,
			onMentionStateChange: handleMentionStateChange,
		});

		// Sync local mention state with hook
		const {
			mentionState,
			mentionCoords,
			setMentionState,
			setMentionCoords,
			filteredEntities,
			insertMention,
		} = useMention(editorRef.current, mentionables);

		// This effect synchronizes the state from the ProseMirror plugin (captured in useProseMirror)
		// to the useMention hook which manages the UI
		useEffect(() => {
			setMentionState(tempMentionState);
			setMentionCoords(tempMentionCoords);
		}, [
			tempMentionState,
			tempMentionCoords,
			setMentionState,
			setMentionCoords,
		]);

		const {
			activeSuggestion,
			setActiveSuggestion,
			projectedSuggestions: _projectedSuggestions,
			handleApplySuggestion,
		} = useSuggestions(
			editorRef.current,
			suggestions,
			content,
			containerRef as React.RefObject<HTMLDivElement>,
		);

		useImperativeHandle(
			ref,
			() => ({
				undo: () => {
					if (editorRef.current) {
						undo(editorRef.current.state, editorRef.current.dispatch);
						editorRef.current.focus();
					}
				},
				redo: () => {
					if (editorRef.current) {
						redo(editorRef.current.state, editorRef.current.dispatch);
						editorRef.current.focus();
					}
				},
				insertText: (text: string) => {
					if (editorRef.current) {
						const { from, to } = editorRef.current.state.selection;
						const tr = editorRef.current.state.tr.replaceWith(
							from,
							to,
							editorRef.current.state.schema.text(text),
						);
						editorRef.current.dispatch(tr);
						editorRef.current.focus();
					}
				},
				getSelection: () => {
					if (editorRef.current) {
						const { from, to } = editorRef.current.state.selection;
						const text = editorRef.current.state.doc.textBetween(from, to);
						return { from, to, text };
					}
					return null;
				},
			}),
			[editorRef],
		);

		// Update Editor Props (Handlers) to close over latest state
		// This is necessary because some handlers (keydown) need access to the latest react state (mentionState, activeSuggestion)
		useEffect(() => {
			if (editorRef.current) {
				const view = editorRef.current;

				// We access the current props of the view to merge or overwrite handlers
				// Note: useProseMirror sets basic props, here we add interaction-specific ones
				const currentProps = view.props;

				view.setProps({
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
			mentionState,
			filteredEntities,
			insertMention,
			activeSuggestion,
			setActiveSuggestion,
			editorRef.current, // Dependency on ref.current is stable but good for completeness if ref changes
		]);

		return (
			<div
				className="prose dark:prose-invert max-w-none relative h-full"
				ref={containerRef}
			>
				{!readOnly && editorRef.current && (
					<EditorBubbleMenu editorView={editorRef.current} />
				)}

				<MentionList
					mentionState={mentionState}
					mentionCoords={mentionCoords}
					filteredEntities={filteredEntities}
					insertMention={insertMention}
				/>

				<SuggestionPopup
					activeSuggestion={activeSuggestion}
					onApply={handleApplySuggestion}
					onReject={() => setActiveSuggestion(null)}
				/>
			</div>
		);
	},
);

function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
	return (
		prevProps.suggestions === nextProps.suggestions &&
		prevProps.currentVersionIndex === nextProps.currentVersionIndex &&
		prevProps.isCurrentVersion === nextProps.isCurrentVersion &&
		!(prevProps.status === "streaming" && nextProps.status === "streaming") &&
		prevProps.content === nextProps.content &&
		prevProps.onSaveContent === nextProps.onSaveContent &&
		prevProps.onSelectionChange === nextProps.onSelectionChange &&
		prevProps.readOnly === nextProps.readOnly &&
		prevProps.typewriterMode === nextProps.typewriterMode &&
		prevProps.mentionables === nextProps.mentionables
	);
}

export const Editor = memo(PureEditor, areEqual);
