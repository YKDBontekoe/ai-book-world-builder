"use client";

import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ActiveSceneEditor } from "@/features/writer/components/editor-states/active-scene-editor";
import { WriterEmptyState } from "@/features/writer/components/editor-states/writer-empty-state";
import { TimeTravelControls } from "@/features/writer/components/time-travel-controls";
import { ContextualPrompts } from "@/features/writer/components/tools/contextual-prompts";
import { WritingStyleAnalyzer } from "@/features/writer/components/tools/writing-style-analyzer";
import { useWriterContent } from "@/features/writer/components/writer-content-context";
import { useWriterContext } from "@/features/writer/components/writer-context";
import { useWriterControl } from "@/features/writer/components/writer-control-context";
import { WriterHeader } from "@/features/writer/components/writer-header";
import { useWriterLayoutContext } from "@/features/writer/components/writer-layout-context";
import { useEditorHistory } from "@/hooks/use-editor-history";

export function WriterEditor() {
	const { project, activeSceneId, structure, isReadOnly } = useWriterContext();
	const { sceneContent, handleContentChange } = useWriterContent();

	const { isDirectorMode } = useWriterLayoutContext();
	const { toggleChat } = useWriterControl();

	const hasStructure = !!(structure && structure.length > 0);

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

	// Wrapper for handleContentChange to match expected signature
	const onContentChange = useCallback(
		(content: string) => {
			handleContentChange(content);
		},
		[handleContentChange],
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
		[toggleChat],
	);

	return (
		<div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background/50">
			<WriterHeader />

			<div className="flex-1 overflow-y-auto relative scroll-smooth">
				{activeSceneId ? (
					<ActiveSceneEditor
						projectId={project.id}
						activeSceneId={activeSceneId}
						isReadOnly={isReadOnly}
						sceneContent={sceneContent}
						onContentChange={onContentChange}
						historyProps={{
							historyStack,
							isTimeTraveling,
							previewContent,
							sliderValue,
							pushHistory,
							toggleTimeTravel,
							handleTimeTravel,
							cancelTimeTravel,
							restoreVersion,
						}}
					/>
				) : (
					<WriterEmptyState
						projectId={project.id}
						hasStructure={hasStructure}
						isReadOnly={isReadOnly}
					/>
				)}
			</div>

			{/* Contextual Prompts */}
			<ContextualPrompts />

			{/* Writing Style Analyzer */}
			{isDirectorMode && <WritingStyleAnalyzer />}

			{/* Time Travel Controls */}
			<TimeTravelControls
				activeSceneId={activeSceneId}
				historyStack={historyStack}
				isTimeTraveling={isTimeTraveling}
				sliderValue={sliderValue}
				toggleTimeTravel={toggleTimeTravel}
				handleTimeTravel={handleTimeTravel}
				cancelTimeTravel={cancelTimeTravel}
				restoreVersion={restoreVersion}
			/>
		</div>
	);
}
