"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/atoms/resizable";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/atoms/sheet";
import { BookCanvas } from "@/components/organisms/book-canvas/book-canvas";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { PowerDock } from "@/components/organisms/writer/power-dock";
import { WriterSpotlight } from "@/components/organisms/writer/tools/writer-spotlight";
import { useWriterControl } from "@/components/organisms/writer/writer-control-context";
import { WriterEditor } from "@/components/organisms/writer/writer-editor";
import { WriterSidebar } from "@/components/organisms/writer/writer-sidebar";
import { WriterSkeleton } from "@/components/organisms/writer/writer-skeleton";
import type { ChatModel } from "@/lib/ai/models";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";
import { WriterContextShell } from "./writer-context-shell";

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

	const {
		isSidebarOpen,
		isCanvasOpen,
		viewMode,
		isMobile,
		sidebarRef,
		canvasRef,
		actions,
	} = useWriterLayoutContext();

	// Control Context
	const { isChatOpen, setChatOpen } = useWriterControl();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <WriterSkeleton />;
	}

	const isZen = viewMode === "zen";
	const editorPanel = (
		<div className="relative z-10 flex-1">
			<WriterEditor />
			<PowerDock />
			<WriterSpotlight />
		</div>
	);

	return (
		<>
			{isMobile ? (
				<div className="flex flex-col flex-1 bg-background">
					{editorPanel}
					{!isZen && (
						<>
							<Sheet open={isSidebarOpen} onOpenChange={actions.setSidebarOpen}>
								<SheetContent
									side="left"
									className="border-border/20 p-0 shadow-xl"
								>
									<SheetHeader className="sr-only">
										<SheetTitle>Writer sidebar</SheetTitle>
										<SheetDescription>
											Writer navigation and structure.
										</SheetDescription>
									</SheetHeader>
									<WriterSidebar />
								</SheetContent>
							</Sheet>
							<Sheet open={isCanvasOpen} onOpenChange={actions.setCanvasOpen}>
								<SheetContent
									side="right"
									className="border-border/20 p-0 shadow-xl"
								>
									<SheetHeader className="sr-only">
										<SheetTitle>Book canvas</SheetTitle>
										<SheetDescription>
											Visualize scenes and chapters on the canvas.
										</SheetDescription>
									</SheetHeader>
									<BookCanvas variant="embedded" />
								</SheetContent>
							</Sheet>
						</>
					)}
				</div>
			) : (
				<ResizablePanelGroup
					// @ts-expect-error react-resizable-panels types are slightly inconsistent between versions for direction/orientation alias
					direction="horizontal"
					id="writer-view-layout-horizontal"
					className="flex-1 bg-background" // Studio Base
				>
					{/* Zen Mode: Animate panels out */}
					{!isZen && (
						<>
							{/* Left Panel: Navigation (Glass Rail) */}
							<ResizablePanel
								// @ts-expect-error ref is available in v4.1 but types might be outdated
								ref={sidebarRef}
								defaultSize={18}
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
					<ResizablePanel
						defaultSize={82}
						minSize={30}
						className="relative z-10"
					>
						{editorPanel}
					</ResizablePanel>

					{!isZen && (
						<>
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
			)}

			<FloatingAssistant
				projectId={props.project.id}
				defaultModelId={props.defaultModelId}
				availableModels={props.availableModels}
				isOpen={isChatOpen}
				onOpenChange={setChatOpen}
				hideTrigger={true}
			/>
		</>
	);
}

export function WriterView(props: WriterViewProps) {
	return (
		<div className="h-full w-full overflow-hidden flex flex-col bg-background">
			<WriterContextShell {...props}>
				<WriterViewContent props={props} />
			</WriterContextShell>
		</div>
	);
}
