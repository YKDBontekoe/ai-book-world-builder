"use client";

import { AnimatePresence, motion } from "framer-motion";
import { exampleSetup } from "prosemirror-example-setup";
import { redo, undo } from "prosemirror-history";
import { inputRules } from "prosemirror-inputrules";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { GlassCard } from "@/components/molecules/glass-card";
import { EditorBubbleMenu } from "@/components/organisms/writer/tools/editor-bubble-menu";
import type { Entity, Suggestion } from "@/lib/db/schema";
import {
	documentSchema,
	handleTransaction,
	headingRule,
} from "@/lib/editor/config";
import {
	buildContentFromDocument,
	buildDocumentFromContent,
	createDecorations,
} from "@/lib/editor/functions";
import { mentionPlugin } from "@/lib/editor/plugins/mention";
import {
	projectWithPositions,
	suggestionsPlugin,
	suggestionsPluginKey,
} from "@/lib/editor/suggestions";
import { cn } from "@/lib/utils";

export interface EditorHandle {
	undo: () => void;
	redo: () => void;
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

interface MentionState {
	active: boolean;
	range: { from: number; to: number } | null;
	query: string;
	index: number;
}

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
		const editorRef = useRef<EditorView | null>(null);
		const [, setMounted] = useState(false);

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
		}));

		// Mention State
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
				if (!editorRef.current || !mentionState || !mentionState.range) return;

				const { range } = mentionState;
				const tr = editorRef.current.state.tr.replaceWith(
					range.from,
					range.to,
					editorRef.current.state.schema.text(`${entity.name} `),
				);

				editorRef.current.dispatch(tr);
				editorRef.current.focus();
				setMentionState(null);
			},
			[mentionState],
		);

		// biome-ignore lint/correctness/useExhaustiveDependencies: Init effect
		useEffect(() => {
			if (containerRef.current && !editorRef.current) {
				const state = EditorState.create({
					doc: buildDocumentFromContent(content),
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
						suggestionsPlugin,
						mentionPlugin((state) => {
							setMentionState(state);
							if (state?.active && state.range && editorRef.current) {
								const coords = editorRef.current.coordsAtPos(state.range.from);
								setMentionCoords({ left: coords.left, top: coords.bottom + 5 });
							} else {
								setMentionCoords(null);
							}
						}),
					],
				});

				editorRef.current = new EditorView(containerRef.current, {
					state,
					editable: () => !readOnly,
				});
				setMounted(true);
			}

			return () => {
				if (editorRef.current) {
					editorRef.current.destroy();
					editorRef.current = null;
				}
			};
		}, []);

		// Update Editor Props (Handlers) to close over latest state
		useEffect(() => {
			if (editorRef.current) {
				editorRef.current.setProps({
					editable: () => !readOnly,
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
						return false;
					},
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
			mentionState,
			filteredEntities,
			insertMention,
		]);

		useEffect(() => {
			if (editorRef.current && content) {
				const currentContent = buildContentFromDocument(
					editorRef.current.state.doc,
				);

				if (status === "streaming") {
					const newDocument = buildDocumentFromContent(content);

					const transaction = editorRef.current.state.tr.replaceWith(
						0,
						editorRef.current.state.doc.content.size,
						newDocument.content,
					);

					transaction.setMeta("no-save", true);
					editorRef.current.dispatch(transaction);
					return;
				}

				if (editorRef.current.hasFocus()) {
					return;
				}

				if (currentContent !== content) {
					const newDocument = buildDocumentFromContent(content);

					const transaction = editorRef.current.state.tr.replaceWith(
						0,
						editorRef.current.state.doc.content.size,
						newDocument.content,
					);

					transaction.setMeta("no-save", true);
					editorRef.current.dispatch(transaction);
				}
			}
		}, [content, status]);

		useEffect(() => {
			if (editorRef.current?.state.doc && content) {
				const projectedSuggestions = projectWithPositions(
					editorRef.current.state.doc,
					suggestions,
				).filter(
					(suggestion) => suggestion.selectionStart && suggestion.selectionEnd,
				);

				const decorations = createDecorations(
					projectedSuggestions,
					editorRef.current,
				);

				const transaction = editorRef.current.state.tr;
				transaction.setMeta(suggestionsPluginKey, { decorations });
				editorRef.current.dispatch(transaction);
			}
		}, [suggestions, content]);

		return (
			<div
				className="prose dark:prose-invert relative h-full"
				ref={containerRef}
			>
				{!readOnly && <EditorBubbleMenu editorView={editorRef.current} />}

				<AnimatePresence>
					{mentionState?.active &&
						mentionCoords &&
						filteredEntities.length > 0 && (
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
									className="p-1 flex flex-col gap-1 max-h-48 overflow-y-auto"
								>
									{filteredEntities.map((entity, i) => (
										<button
											type="button"
											key={entity.id}
											className={cn(
												"flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-left",
												i === mentionState.index
													? "bg-primary/10 text-primary"
													: "hover:bg-muted",
											)}
											onClick={() => insertMention(entity)}
										>
											<span className="text-xs uppercase opacity-50 font-bold w-12 shrink-0">
												{entity.kind}
											</span>
											<span className="truncate font-medium">
												{entity.name}
											</span>
										</button>
									))}
								</GlassCard>
							</motion.div>
						)}
				</AnimatePresence>
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
