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
import { ContextualPrompts } from "@/components/organisms/writer/tools/contextual-prompts";
import { WritingStyleAnalyzer } from "@/components/organisms/writer/tools/writing-style-analyzer";
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
		isCanvasOpen,
		viewMode,
		isTypewriterMode,
		isDirectorMode,
		isMobile,
		sidebarRef,
		canvasRef,
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
				isCanvasOpen,
				toggleCanvas: actions.toggleCanvas,
				viewMode,
				toggleZenMode: actions.toggleZenMode,
				isTypewriterMode,
				toggleTypewriterMode: actions.toggleTypewriterMode,
				isDirectorMode,
				toggleDirectorMode: actions.toggleDirectorMode,
			}}
		>
			<ResizablePanelGroup
				// @ts-expect-error react-resizable-panels types are slightly inconsistent between versions for direction/orientation alias
				direction={isMobile ? "vertical" : "horizontal"}
				id={
					isMobile
						? "writer-view-layout-vertical"
						: "writer-view-layout-horizontal"
				}
				className="flex-1 bg-background" // Studio Base
			>
				{/* Zen Mode: Animate panels out */}
				{!isZen && (
					<>
						{/* Left Panel: Navigation (Glass Rail) */}
						<ResizablePanel
							// @ts-expect-error ref is available in v4.1 but types might be outdated
							ref={sidebarRef}
							defaultSize={isMobile ? 0 : 18}
							minSize={12}
							maxSize={35}
							collapsible={true}
							collapsedSize={0}
							className="glass-surface border-r border-border/20 shadow-lg z-20"
							onResize={(size) => {
								const isCollapsed = (size as unknown as number) === 0;
								actions.setSidebarOpen(!isCollapsed);
							}}
						>
							<WriterSidebar />
						</ResizablePanel>
						{/* Subtle Handle */}
						<ResizableHandle
							className="w-1 bg-transparent hover:bg-primary/20 transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1"
							aria-label="Resize sidebar"
						/>
					</>
				)}

				{/* Center Panel: Editor (Studio Stage) */}
				<ResizablePanel defaultSize={62} minSize={30} className="relative z-10">
					{/* Editor Container - Centered "Paper" look managed inside WriterEditor */}
					<WriterEditor />

					{/* Command Deck (Floating) */}
					<PowerDock />
					<WriterSpotlight />
				</ResizablePanel>

				{!isZen && (
					<>
						<ResizableHandle
							className="w-1 bg-transparent hover:bg-primary/20 transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1"
							aria-label="Resize tools rail"
						/>
						<ResizablePanel
							defaultSize={20}
							minSize={16}
							maxSize={28}
							className="glass-surface border-l border-border/20 shadow-lg z-20"
						>
							<div className="flex h-full flex-col gap-4 p-4 overflow-y-auto">
								<ContextualPrompts />
								{isDirectorMode && <WritingStyleAnalyzer />}
							</div>
						</ResizablePanel>
						<ResizableHandle
							className="w-1 bg-transparent hover:bg-primary/20 transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1"
							aria-label="Resize book canvas"
						/>
						{/* Right Panel: Book Canvas (On-Demand Drawer) */}
						<ResizablePanel
							// @ts-expect-error ref available
							ref={canvasRef}
							defaultSize={0} // Default collapsed
							minSize={25}
							collapsible={true}
							collapsedSize={0}
							className="glass-surface border-l border-border/20 shadow-lg z-20"
							onResize={(size) => {
								const isCollapsed = (size as unknown as number) === 0;
								actions.setCanvasOpen(!isCollapsed);
							}}
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
		<div className="h-full w-full overflow-hidden flex flex-col bg-background">
			<WriterProvider {...props}>
				<WriterControlProvider>
					<CanvasSync projectId={project.id} isReadOnly={isReadOnly} />
					<WriterViewContent props={props} />
				</WriterControlProvider>
			</WriterProvider>
		</div>
	);
}
