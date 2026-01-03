"use client";

import { useCallback, useEffect, useRef } from "react";
import {
	type EditorHandle,
} from "@/components/organisms/editor/text-editor";
import { ContextualPrompts } from "@/components/organisms/writer/tools/contextual-prompts";
import { TimeTravelControls } from "@/components/organisms/writer/tools/time-travel-controls";
import { WritingStyleAnalyzer } from "@/components/organisms/writer/tools/writing-style-analyzer";
import { WriterContent } from "@/components/organisms/writer/writer-content";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useWriterControl } from "@/components/organisms/writer/writer-control-context";
import { WriterHeader } from "@/components/organisms/writer/writer-header";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { useEditorHistory } from "@/hooks/use-editor-history";
import { useProjectEntities } from "@/hooks/use-project-entities";

export function WriterEditor() {
	const {
		project,
		activeSceneId,
		sceneContent,
		handleContentChange,
		structure,
		isReadOnly,
	} = useWriterContext();

	const { isTypewriterMode, isDirectorMode } = useWriterLayoutContext();
	const { registerEditorActions } = useWriterControl();
	const { data: entities } = useProjectEntities(project.id);
	const editorRef = useRef<EditorHandle>(null);

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

	// Register Editor Actions (Undo/Redo/Insert)
	useEffect(() => {
		if (editorRef.current) {
			registerEditorActions({
				undo: () => editorRef.current?.undo(),
				redo: () => editorRef.current?.redo(),
				insertText: (text: string) => editorRef.current?.insertText(text),
				getSelection: () => editorRef.current?.getSelection() ?? null,
			});
		}
	}, [registerEditorActions]); // Re-register when scene changes

	const onEditorContentChange = useCallback(
		(content: string, _debounce: boolean) => {
			// Standard save
			handleContentChange(content);
			// History push
			pushHistory(content);
		},
		[handleContentChange, pushHistory],
	);

	return (
		<div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background/50">
			<WriterHeader />

			<div className="flex-1 overflow-y-auto relative scroll-smooth">
				<WriterContent
					ref={editorRef}
					projectId={project.id}
					activeSceneId={activeSceneId}
					sceneContent={sceneContent}
					previewContent={previewContent}
					structure={structure}
					isReadOnly={isReadOnly}
					isTimeTraveling={isTimeTraveling}
					isTypewriterMode={isTypewriterMode}
					entities={entities}
					onSaveContent={onEditorContentChange}
				/>
			</div>

			{/* Contextual Prompts */}
			<ContextualPrompts />

			{/* Writing Style Analyzer */}
			{isDirectorMode && <WritingStyleAnalyzer />}

			{/* Time Travel Controls */}
			{activeSceneId && (
				<TimeTravelControls
					historyStackLength={historyStack.length}
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
