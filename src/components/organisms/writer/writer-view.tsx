"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { useMediaQuery } from "usehooks-ts";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/atoms/resizable";
import { BookCanvas } from "@/components/organisms/book-canvas/book-canvas";
import { useBookCanvasActions } from "@/components/organisms/book-canvas/book-canvas-context";
import { WriterSpotlight } from "@/components/organisms/writer/tools/writer-spotlight";
import { WriterProvider } from "@/components/organisms/writer/writer-context";
import { WriterControlBar } from "@/components/organisms/writer/writer-control-bar";
import {
	useWriterControl,
	WriterControlProvider,
} from "@/components/organisms/writer/writer-control-context";
import { WriterEditor } from "@/components/organisms/writer/writer-editor";
import {
	type ViewMode,
	WriterLayoutContext,
} from "@/components/organisms/writer/writer-layout-context";
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
	const isMobile = useMediaQuery("(max-width: 768px)");
	const [mounted, setMounted] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [viewMode, setViewMode] = useState<ViewMode>("standard");
	const [isTypewriterMode, setIsTypewriterMode] = useState(false);
	const [isDirectorMode, setIsDirectorMode] = useState(false);

	// Control Context
	const { isChatOpen, setChatOpen } = useWriterControl();

	const sidebarRef = useRef<ImperativePanelHandle>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleSidebar = () => {
		const panel = sidebarRef.current;
		if (panel) {
			if (isSidebarOpen) {
				panel.collapse();
			} else {
				panel.expand();
			}
		}
	};

	const toggleZenMode = () => {
		setViewMode((prev) => (prev === "standard" ? "zen" : "standard"));
	};

	const toggleTypewriterMode = () => {
		setIsTypewriterMode((prev) => !prev);
	};

	const toggleDirectorMode = () => {
		setIsDirectorMode((prev) => !prev);
	};

	if (!mounted) {
		return <WriterSkeleton />;
	}

	const isZen = viewMode === "zen";

	return (
		<WriterLayoutContext.Provider
			value={{
				isSidebarOpen,
				toggleSidebar,
				viewMode,
				toggleZenMode,
				isTypewriterMode,
				toggleTypewriterMode,
				isDirectorMode,
				toggleDirectorMode,
			}}
		>
			<ResizablePanelGroup
				direction={isMobile ? "vertical" : "horizontal"}
				autoSaveId={
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
							minSize={15}
							maxSize={30}
							collapsible={true}
							collapsedSize={0}
							onCollapse={() => setIsSidebarOpen(false)}
							onExpand={() => setIsSidebarOpen(true)}
							className="bg-muted/10 backdrop-blur-md"
							order={1}
						>
							<WriterSidebar />
						</ResizablePanel>
						<ResizableHandle />
					</>
				)}

				{/* Center Panel: Editor */}
				<ResizablePanel
					defaultSize={50}
					minSize={30}
					order={2}
					className="relative z-10"
				>
					<WriterEditor />
					{/* Control Bar lives here, overlaying the editor */}
					<WriterControlBar />
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
							order={3}
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
			// We might not want to clear projectId immediately if navigating away,
			// but for safety in SPA transitions:
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
