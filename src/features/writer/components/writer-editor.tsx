"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { EditorHandle } from "@/components/organisms/editor/text-editor";
import { ContextualPrompts } from "@/features/writer/components/tools/contextual-prompts";
import { TimeTravelControls } from "@/features/writer/components/tools/time-travel-controls";
import { WritingStyleAnalyzer } from "@/features/writer/components/tools/writing-style-analyzer";
import { WriterContent } from "@/features/writer/components/writer-content";
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
	const { registerEditorActions, toggleChat } = useWriterControl();
	const { data: entities } = useProjectEntities(project.id);

	// Use a standard ref to access the editor instance for non-effect usage
	const editorRef = useRef<EditorHandle | null>(null);

	// Time Travel Logic
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
	const setEditorRef = useCallback(
		(node: EditorHandle | null) => {
			if (editorRef.current === node) return;
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
			handleContentChange(content);
			pushHistory(content);
		},
		[handleContentChange, pushHistory],
	);

	// Add hotkey scope for editor specific actions
	useHotkeys(
		"meta+enter, ctrl+enter",
		(e) => {
			e.preventDefault();
			toggleChat();
		},
		{ enableOnFormTags: true, description: "Trigger AI Assistant" },
		[toggleChat],
	);

	return (
		<div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background/50">
			<WriterHeader />

			<div className="flex-1 overflow-y-auto relative scroll-smooth">
				<WriterContent
					project={project}
					activeSceneId={activeSceneId}
					sceneContent={sceneContent}
					previewContent={previewContent}
					onContentChange={onEditorContentChange}
					structure={structure}
					isReadOnly={isReadOnly}
					isTimeTraveling={isTimeTraveling}
					isTypewriterMode={isTypewriterMode}
					entities={entities || []}
					editorRef={setEditorRef}
					onWizardComplete={() => router.refresh()}
				/>
			</div>

			{/* Contextual Prompts */}
			<ContextualPrompts />

			{/* Writing Style Analyzer */}
			{isDirectorMode && <WritingStyleAnalyzer />}

			{/* Time Travel Controls */}
			{activeSceneId && (
				<TimeTravelControls
					historyStack={historyStack}
					isTimeTraveling={isTimeTraveling}
					sliderValue={sliderValue}
					onTimeTravel={handleTimeTravel}
					onCancel={cancelTimeTravel}
					onRestore={restoreVersion}
					onToggle={toggleTimeTravel}
				/>
			)}
		</div>
	);
}
