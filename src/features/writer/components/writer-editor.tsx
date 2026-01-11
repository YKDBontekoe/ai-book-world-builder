"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock, MousePointerClick, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "@/components/atoms/button";
import { Slider } from "@/components/atoms/slider";
import { EmptyState } from "@/components/molecules/empty-state";
import { GlassCard } from "@/components/molecules/glass-card";
import {
	Editor,
	type EditorHandle,
} from "@/components/organisms/editor/text-editor";
import { useAppearance } from "@/components/providers/appearance-provider";
import { StoryWizard } from "@/features/writer/components/story-wizard";
import { ContextualPrompts } from "@/features/writer/components/tools/contextual-prompts";
import { WritingStyleAnalyzer } from "@/features/writer/components/tools/writing-style-analyzer";
import { useWriterContext } from "@/features/writer/components/writer-context";
import { useWriterControl } from "@/features/writer/components/writer-control-context";
import { WriterHeader } from "@/features/writer/components/writer-header";
import { useWriterLayoutContext } from "@/features/writer/components/writer-layout-context";
import { useEditorHistory } from "@/hooks/use-editor-history";
import { useProjectEntities } from "@/hooks/use-project-entities";

export function WriterEditor() {
	const router = useRouter();
	const {
		project,
		activeSceneId,
		sceneContent,
		handleContentChange,
		structure,
		isReadOnly,
	} = useWriterContext();

	const { isTypewriterMode, isDirectorMode } = useWriterLayoutContext();
	const { registerEditorActions, toggleChat, toggleSpotlight } = useWriterControl();
	const { data: entities } = useProjectEntities(project.id);
	// Use a standard ref to access the editor instance for non-effect usage
	const editorRef = useRef<EditorHandle | null>(null);
	const { editorFont, editorFontSize, editorLineHeight } = useAppearance();

	const hasStructure = structure && structure.length > 0;

	// Time Travel Logic Extracted to Hook
	const {
		historyStack,
		isTimeTraveling,
		previewContent,
		sliderValue,
		pushHistory,
		toggleTimeTravel,
		handleTimeTravel,
		cancelTimeTravel,
		restoreVersion,
	} = useEditorHistory({
		sceneId: activeSceneId || undefined,
		sceneContent,
		onRestore: handleContentChange,
	});

	// Use a callback ref to handle editor registration/unregistration reliably.
	// This ensures that whenever the Editor instance changes (e.g. key change),
	// the actions are re-registered with the correct instance.
	const setEditorRef = useCallback(
		(node: EditorHandle | null) => {
			// Update the mutable ref for other consumers
			editorRef.current = node;

			if (node) {
				registerEditorActions({
					undo: () => node.undo(),
					redo: () => node.redo(),
					insertText: (text: string) => node.insertText(text),
					getSelection: () => node.getSelection() ?? null,
				});
			}
		},
		[registerEditorActions],
	);

	const onEditorContentChange = useCallback(
		(content: string, _debounce: boolean) => {
			// Standard save
			handleContentChange(content);
			// History push
			pushHistory(content);
		},
		[handleContentChange, pushHistory],
	);

	// Add hotkey scope for editor specific actions
	useHotkeys(
		"meta+enter, ctrl+enter",
		(e) => {
			e.preventDefault();
			// Logic to "Continue Writing" or "Focus Chat"
			toggleChat();
		},
		{ enableOnFormTags: true, description: "Trigger AI Assistant" },
	);

	return (
		<div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background/50">
			<WriterHeader />

			<div className="flex-1 overflow-y-auto relative scroll-smooth">
				{activeSceneId ? (
					<div
						className="writer-instance max-w-3xl mx-auto min-h-full py-8 px-8 pb-32 transition-all duration-300"
						style={{
							fontFamily:
								editorFont === "mono"
									? "var(--font-mono)"
									: editorFont === "serif"
										? "serif"
										: "var(--font-sans)",
							fontSize: `${editorFontSize}px`,
							lineHeight: editorLineHeight,
						}}
					>
						<Editor
							ref={setEditorRef}
							key={activeSceneId} // Reset editor when scene changes
							content={previewContent ?? sceneContent}
							onSaveContent={onEditorContentChange}
							status="idle"
							isCurrentVersion={true}
							currentVersionIndex={0}
							suggestions={[]}
							readOnly={isReadOnly || isTimeTraveling}
							typewriterMode={isTypewriterMode && !isTimeTraveling}
							mentionables={entities || []}
						/>
					</div>
				) : !hasStructure ? (
					isReadOnly ? (
						<div className="flex h-full items-center justify-center p-8">
							<EmptyState
								data-testid="empty-state"
								title="Empty Project"
								description="This project has no content yet."
								icon={Lock}
								variant="dashed"
							/>
						</div>
					) : (
						<StoryWizard
							projectId={project.id}
							onComplete={() => router.refresh()}
						/>
					)
				) : (
					<div className="flex h-full items-center justify-center p-8">
						<EmptyState
							data-testid="empty-state"
							title="No Scene Selected"
							description="Select a scene from the sidebar to continue reading."
							icon={MousePointerClick}
							variant="dashed"
						/>
					</div>
				)}
			</div>

			{/* Contextual Prompts */}
			<ContextualPrompts />

			{/* Writing Style Analyzer */}
			{isDirectorMode && <WritingStyleAnalyzer />}

			{/* Time Travel Controls */}
			{activeSceneId && historyStack.length > 1 && (
				<div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
					<AnimatePresence>
						{isTimeTraveling ? (
							<motion.div
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: 20, opacity: 0 }}
							>
								<GlassCard variant="liquid" className="p-4 flex flex-col gap-4">
									<div className="flex items-center justify-between text-xs text-muted-foreground">
										<span>Original</span>
										<span className="font-bold text-primary">
											Now Previewing
										</span>
										<span>Current</span>
									</div>
									<Slider
										value={sliderValue}
										min={0}
										max={historyStack.length - 1}
										step={1}
										onValueChange={handleTimeTravel}
										className="py-2"
									/>
									<div className="flex justify-end gap-2">
										<Button
											size="sm"
											variant="ghost"
											onClick={cancelTimeTravel}
										>
											Cancel
										</Button>
										<Button size="sm" onClick={restoreVersion}>
											Restore Version
										</Button>
									</div>
								</GlassCard>
							</motion.div>
						) : (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								whileHover={{ scale: 1.05 }}
							>
								<Button
									variant="outline"
									size="sm"
									className="bg-background/50 backdrop-blur-sm shadow-lg rounded-full px-4 gap-2 border-primary/20 hover:border-primary/50"
									onClick={toggleTimeTravel}
								>
									<RotateCcw className="h-3.5 w-3.5" />
									<span className="text-xs">Time Travel</span>
								</Button>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			)}
		</div>
	);
}
