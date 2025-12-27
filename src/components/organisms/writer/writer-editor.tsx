"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import {
	Editor,
	type EditorHandle,
} from "@/components/organisms/editor/text-editor";
import { DirectorDashboard } from "@/components/organisms/writer/dashboard/director-dashboard";
import { useTimeTravel } from "@/components/organisms/writer/hooks/use-time-travel";
import { ContextualPrompts } from "@/components/organisms/writer/tools/contextual-prompts";
import { TimeTravelControls } from "@/components/organisms/writer/tools/time-travel-controls";
import { WritingStyleAnalyzer } from "@/components/organisms/writer/tools/writing-style-analyzer";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useWriterControl } from "@/components/organisms/writer/writer-control-context";
import { WriterEmptyState } from "@/components/organisms/writer/writer-empty-state";
import { WriterHeader } from "@/components/organisms/writer/writer-header";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { useNarrativeIntelligence } from "@/hooks/use-narrative-intelligence";
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

	const { isTypewriterMode, isDirectorMode, toggleDirectorMode } =
		useWriterLayoutContext();
	const { registerEditorActions } = useWriterControl();
	const { data: entities } = useProjectEntities(project.id);
	const editorRef = useRef<EditorHandle>(null);

	const hasStructure = !!(structure && structure.length > 0);

    // Time Travel Hook
    const {
        historyStack,
        isTimeTraveling,
        previewContent,
        sliderValue,
        handleContentUpdate,
        toggleTimeTravel,
        handleTimeTravelChange,
        restoreVersion,
        cancelTimeTravel
    } = useTimeTravel({
        initialContent: sceneContent,
        onContentChange: handleContentChange
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
	}, [registerEditorActions]);

	// Narrative Intelligence Hook
	const narrativeMetrics = useNarrativeIntelligence({
		content: previewContent ?? sceneContent,
		entities: entities || [],
	});

    // Content to display: either preview or current
    const displayContent = previewContent ?? sceneContent;

	return (
		<div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background/50">
			<WriterHeader />

			<div className="flex-1 overflow-y-auto relative scroll-smooth">
				{activeSceneId ? (
					<div className="writer-instance max-w-3xl mx-auto min-h-full py-8 px-8 pb-32">
						<Editor
							ref={editorRef}
							key={activeSceneId} // Reset editor when scene changes
							content={displayContent}
							onSaveContent={handleContentUpdate}
							status="idle"
							isCurrentVersion={true}
							currentVersionIndex={0}
							suggestions={[]}
							readOnly={isReadOnly || isTimeTraveling}
							typewriterMode={isTypewriterMode && !isTimeTraveling}
							mentionables={entities || []}
						/>
					</div>
				) : (
                    <WriterEmptyState
                        activeSceneId={activeSceneId}
                        hasStructure={hasStructure}
                        isReadOnly={!!isReadOnly}
                        projectId={project.id}
                    />
                )}
			</div>

			{/* Director Dashboard Overlay */}
			<AnimatePresence>
				{isDirectorMode && (
					<DirectorDashboard
						metrics={narrativeMetrics}
						isVisible={true}
						onClose={toggleDirectorMode}
					/>
				)}
			</AnimatePresence>

			{/* Contextual Prompts */}
			<ContextualPrompts />

			{/* Writing Style Analyzer */}
			{isDirectorMode && <WritingStyleAnalyzer />}

			{/* Time Travel Controls */}
			<TimeTravelControls
                isVisible={!!activeSceneId}
                historyStack={historyStack}
                isTimeTraveling={isTimeTraveling}
                sliderValue={sliderValue}
                onTimeTravelChange={handleTimeTravelChange}
                onToggle={toggleTimeTravel}
                onRestore={restoreVersion}
                onCancel={cancelTimeTravel}
            />
		</div>
	);
}
