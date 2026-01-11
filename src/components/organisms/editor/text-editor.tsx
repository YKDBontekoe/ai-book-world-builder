"use client";

import { AnimatePresence, motion } from "framer-motion";
import { redo, undo } from "prosemirror-history";
import {
	forwardRef,
	memo,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { GlassCard } from "@/components/molecules/glass-card";
import { PreviewSuggestion } from "@/components/molecules/preview-suggestion";
import { EditorBubbleMenu } from "@/components/organisms/writer/tools/editor-bubble-menu";
import type { Entity, Suggestion } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { type MentionState, useMention } from "./hooks/use-mention";
import { useProseMirror } from "./hooks/use-prosemirror";
import { useSuggestions } from "./hooks/use-suggestions";

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

		const { editorRef, mounted: _mounted } = useProseMirror({
			containerRef: containerRef as React.RefObject<HTMLDivElement>,
			content,
			readOnly,
			onSaveContent,
			onSelectionChange,
			typewriterMode,
			status,
			onMentionStateChange: (state, coords) => {
				setTempMentionState(state);
				setTempMentionCoords(coords);
			},
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

		useImperativeHandle(ref, () => ({
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
		}));

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
				className="prose dark:prose-invert relative h-full"
				ref={containerRef}
			>
				{!readOnly && editorRef.current && (
					<EditorBubbleMenu editorView={editorRef.current} />
				)}

				<AnimatePresence>
					{mentionState?.active && mentionCoords && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="fixed z-50 w-64"
							style={{
								left: mentionCoords.left,
								top: mentionCoords.top,
							}}
						>
							<GlassCard
								variant="liquid"
								className="p-2 flex flex-col gap-1 max-h-64 overflow-y-auto shadow-2xl border-primary/20"
							>
								{filteredEntities.length === 0 ? (
									<div className="px-3 py-2 text-xs text-muted-foreground">
										No entities found
									</div>
								) : (
									filteredEntities.map((entity, i) => (
										<button
											type="button"
											key={entity.id}
											className={cn(
												"flex items-start gap-3 px-3 py-2.5 text-sm rounded-lg transition-all text-left group",
												"hover:bg-primary/10 hover:scale-[1.02]",
												i === mentionState.index
													? "bg-primary/20 text-primary shadow-sm border border-primary/30"
													: "hover:bg-muted/50",
											)}
											onClick={() => insertMention(entity)}
										>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<span className="text-[10px] uppercase tracking-wider opacity-60 font-bold px-1.5 py-0.5 rounded bg-background/50">
														{entity.kind}
													</span>
													<span className="truncate font-semibold text-foreground">
														{entity.name}
													</span>
												</div>
												{entity.summary && (
													<p className="text-xs text-muted-foreground line-clamp-2 mt-1">
														{entity.summary}
													</p>
												)}
											</div>
										</button>
									))
								)}
							</GlassCard>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Suggestion Popup - Rendered within React tree using portal */}
				{activeSuggestion &&
					typeof document !== "undefined" &&
					createPortal(
						<motion.div
							data-suggestion-popup
							initial={{ opacity: 0, y: -5 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -5 }}
							className="fixed z-[100]"
							style={{
								left: activeSuggestion.coords.left,
								top: activeSuggestion.coords.top,
							}}
						>
							<PreviewSuggestion
								suggestion={activeSuggestion.suggestion}
								onApply={handleApplySuggestion}
								onReject={() => setActiveSuggestion(null)}
								artifactKind="text"
							/>
						</motion.div>,
						document.body,
					)}
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
