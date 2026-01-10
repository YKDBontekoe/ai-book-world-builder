import { type ReactNode } from "react";
import { useBookCanvasActions } from "@/components/organisms/book-canvas/book-canvas-context";
import { useWriterLayout } from "@/components/organisms/writer/hooks/use-writer-layout";
import { WriterProvider } from "@/components/organisms/writer/writer-context";
import { WriterControlProvider } from "@/components/organisms/writer/writer-control-context";
import { WriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import type { ChatModel } from "@/lib/ai/models";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";
import { useEffect } from "react";

interface WriterContextShellProps {
	project: Project;
	initialStructure?: ChapterWithScenes[];
	initialStructureText?: string;
	isReadOnly?: boolean;
	defaultModelId?: string;
	availableModels?: ChatModel[];
	children: ReactNode;
}

function CanvasSync({
	projectId,
	isReadOnly,
}: {
	projectId: string;
	isReadOnly: boolean;
}) {
	const { setProjectId, setIsReadOnly } = useBookCanvasActions();

	useEffect(() => {
		setProjectId(projectId);
		setIsReadOnly(isReadOnly);
		return () => {
			setProjectId(null);
			setIsReadOnly(false);
		};
	}, [projectId, isReadOnly, setProjectId, setIsReadOnly]);

	return null;
}

export function WriterContextShell({
	project,
	isReadOnly = false,
	initialStructure,
	initialStructureText,
	defaultModelId,
	availableModels,
	children,
}: WriterContextShellProps) {
	// Use extracted layout hook
	const {
		isSidebarOpen,
		isCanvasOpen,
		viewMode,
		isTypewriterMode,
		isDirectorMode,
		isMobile,
		sidebarRef,
		canvasRef,
		actions,
	} = useWriterLayout();

	return (
		<WriterProvider
			project={project}
			initialStructure={initialStructure}
			initialStructureText={initialStructureText}
			isReadOnly={isReadOnly}
			defaultModelId={defaultModelId}
			availableModels={availableModels}
		>
			<WriterControlProvider>
				<CanvasSync projectId={project.id} isReadOnly={isReadOnly} />
				<WriterLayoutContext.Provider
					value={{
						isSidebarOpen,
						toggleSidebar: actions.toggleSidebar,
						isCanvasOpen,
						toggleCanvas: actions.toggleCanvas,
						viewMode,
						toggleZenMode: actions.toggleZenMode,
						isTypewriterMode,
						toggleTypewriterMode: actions.toggleTypewriterMode,
						isDirectorMode,
						toggleDirectorMode: actions.toggleDirectorMode,
						isMobile,
						sidebarRef,
						canvasRef,
						actions: {
							setSidebarOpen: actions.setSidebarOpen,
							setCanvasOpen: actions.setCanvasOpen,
						},
					}}
				>
					{children}
				</WriterLayoutContext.Provider>
			</WriterControlProvider>
		</WriterProvider>
	);
}
