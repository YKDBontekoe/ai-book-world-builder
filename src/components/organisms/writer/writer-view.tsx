"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/atoms/resizable";
import { BookCanvas } from "@/components/organisms/book-canvas/book-canvas";
import { useBookCanvasActions } from "@/components/organisms/book-canvas/book-canvas-context";
import { useWriterLayout } from "@/components/organisms/writer/hooks/use-writer-layout";
import { PowerDock } from "@/components/organisms/writer/power-dock";
import { WriterSpotlight } from "@/components/organisms/writer/tools/writer-spotlight";
import { WriterProvider } from "@/components/organisms/writer/writer-context";
import {
	useWriterControl,
	WriterControlProvider,
} from "@/components/organisms/writer/writer-control-context";
import { WriterEditor } from "@/components/organisms/writer/writer-editor";
import { WriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { WriterSidebar } from "@/components/organisms/writer/writer-sidebar";
import { WriterSkeleton } from "@/components/organisms/writer/writer-skeleton";
import type { ChatModel } from "@/lib/ai/models";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

// Lazy load assistant
const FloatingAssistant = dynamic(() =>
	import("@/components/organisms/chat/floating-assistant").then(
		(mod) => mod.FloatingAssistant,
	),
);

interface WriterViewProps {
	project: Project;
	initialStructure?: ChapterWithScenes[];
	initialStructureText?: string;
	isReadOnly?: boolean;
	defaultModelId?: string;
	availableModels?: ChatModel[];
}

function WriterViewContent({ props }: { props: WriterViewProps }) {
	const [mounted, setMounted] = useState(false);

	// Use extracted layout hook
	const {
		isSidebarOpen,
		viewMode,
		isTypewriterMode,
		isDirectorMode,
		isMobile,
		sidebarRef,
		actions,
	} = useWriterLayout();

	// Control Context
	const { isChatOpen, setChatOpen } = useWriterControl();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <WriterSkeleton />;
	}

	const isZen = viewMode === "zen";

	return (
		<WriterLayoutContext.Provider
			value={{
				isSidebarOpen,
				toggleSidebar: actions.toggleSidebar,
				viewMode,
				toggleZenMode: actions.toggleZenMode,
				isTypewriterMode,
				toggleTypewriterMode: actions.toggleTypewriterMode,
				isDirectorMode,
				toggleDirectorMode: actions.toggleDirectorMode,
			}}
		>
			<ResizablePanelGroup
				orientation={isMobile ? "vertical" : "horizontal"}
				id={
					isMobile
						? "writer-view-layout-vertical"
						: "writer-view-layout-horizontal"
				}
				className="flex-1"
			>
				{/* Zen Mode: Animate panels out */}
				{!isZen && (
					<>
						{/* Left Panel: Navigation */}
						<ResizablePanel
							ref={sidebarRef}
							defaultSize={isMobile ? 0 : 20}
							minSize={20}
							maxSize={30}
							collapsible={true}
							collapsedSize={0}
							className="bg-muted/10 backdrop-blur-md"
							onCollapse={() => actions.setSidebarOpen(false)}
							onExpand={() => actions.setSidebarOpen(true)}
						>
							<WriterSidebar />
						</ResizablePanel>
						<ResizableHandle />
					</>
				)}

				{/* Center Panel: Editor */}
				<ResizablePanel defaultSize={50} minSize={30} className="relative z-10">
					<WriterEditor />
					{/* Control Bar lives here, overlaying the editor */}
					<PowerDock />
					<WriterSpotlight />
				</ResizablePanel>

				{!isZen && (
					<>
						<ResizableHandle />
						{/* Right Panel: Book Canvas */}
						<ResizablePanel
							defaultSize={30}
							minSize={20}
							collapsible={true}
							collapsedSize={0}
						>
							<BookCanvas variant="embedded" />
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>

			<FloatingAssistant
				projectId={props.project.id}
				defaultModelId={props.defaultModelId}
				availableModels={props.availableModels}
				isOpen={isChatOpen}
				onOpenChange={setChatOpen}
				hideTrigger={true}
			/>
		</WriterLayoutContext.Provider>
	);
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
		// Reset when unmounting (optional, but good for cleanup)
		return () => {
			setProjectId(null);
			setIsReadOnly(false);
		};
	}, [projectId, isReadOnly, setProjectId, setIsReadOnly]);

	return null;
}

export function WriterView(props: WriterViewProps) {
	const { project, isReadOnly = false } = props;

	return (
		<div className="h-full w-full overflow-hidden flex flex-col">
			<WriterProvider {...props}>
				<WriterControlProvider>
					<CanvasSync projectId={project.id} isReadOnly={isReadOnly} />
					<WriterViewContent props={props} />
				</WriterControlProvider>
			</WriterProvider>
		</div>
	);
}
