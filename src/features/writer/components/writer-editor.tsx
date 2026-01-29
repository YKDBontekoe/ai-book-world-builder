"use client";

import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
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
import { useSceneOperations } from "@/features/writer/hooks/use-scene-operations";
import { exportProjectToClipboard } from "@/features/writer/utils/export-utils";
import { useEditorHistory } from "@/hooks/use-editor-history";

export function WriterEditor() {
	const {
		project,
		activeSceneId,
		structure,
		isReadOnly,
		setActiveSceneId,
		fetchStructure,
	} = useWriterContext();
	const { sceneContent, handleContentChange } = useWriterContent();

	const { isDirectorMode } = useWriterLayoutContext();
	const { toggleChat } = useWriterControl();

	const { handleCreateSceneManually } = useSceneOperations({
		projectId: project.id,
		activeSceneId,
		onSceneSelect: setActiveSceneId,
		onStructureUpdate: fetchStructure,
		structure,
	});

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

	useHotkeys(
		"mod+shift+e",
		async (e) => {
			e.preventDefault();
			await exportProjectToClipboard(project.id);
		},
		{ enableOnFormTags: true, description: "Export Project" },
		[project.id],
	);

	useHotkeys(
		"mod+alt+n",
		async (e) => {
			e.preventDefault();

			// Determine chapter ID
			let targetChapterId: string | null = null;
			if (activeSceneId && structure) {
				const chapter = structure.find((c) =>
					c.scenes.some((s) => s.id === activeSceneId),
				);
				if (chapter) targetChapterId = chapter.id;
			}

			if (!targetChapterId && structure && structure.length > 0) {
				targetChapterId = structure[structure.length - 1].id;
			}

			if (targetChapterId) {
				await handleCreateSceneManually(targetChapterId);
			} else {
				toast.error("No chapter found to create scene in");
			}
		},
		{ enableOnFormTags: true, description: "New Scene" },
		[activeSceneId, structure, handleCreateSceneManually],
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
