"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/atoms/resizable";
import { Project } from "@/lib/db/schema";
import { ChapterWithScenes } from "@/lib/types";
import { BookCanvas } from "@/components/organisms/book-canvas/book-canvas";
import { useBookCanvasActions } from "@/components/organisms/book-canvas/book-canvas-context";
import { WriterSidebar } from "@/components/organisms/writer/writer-sidebar";
import { WriterEditor } from "@/components/organisms/writer/writer-editor";
import { WriterSkeleton } from "@/components/organisms/writer/writer-skeleton";
import { WriterProvider } from "@/components/organisms/writer/writer-context";

// Lazy load assistant
const FloatingAssistant = dynamic(() => import("@/components/organisms/chat/floating-assistant").then(mod => mod.FloatingAssistant));

interface WriterViewProps {
  project: Project;
  initialStructure?: ChapterWithScenes[];
  initialStructureText?: string;
  isReadOnly?: boolean;
}

function WriterViewContent() {
	const isMobile = useMediaQuery("(max-width: 768px)");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <WriterSkeleton />;
	}

	return (
		<ResizablePanelGroup
			direction={isMobile ? "vertical" : "horizontal"}
			autoSaveId={
				isMobile ? "writer-view-layout-vertical" : "writer-view-layout-horizontal"
			}
			className="flex-1"
		>
			{/* Left Panel: Navigation */}
			<ResizablePanel
				defaultSize={20}
				minSize={15}
				maxSize={30}
				className="bg-muted/10 backdrop-blur-md"
				order={1}
			>
				<WriterSidebar />
			</ResizablePanel>

			<ResizableHandle />

			{/* Center Panel: Editor */}
			<ResizablePanel defaultSize={50} minSize={30} order={2}>
				<WriterEditor />
			</ResizablePanel>

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
		</ResizablePanelGroup>
	);
}

function CanvasSync({ projectId, isReadOnly }: { projectId: string, isReadOnly: boolean }) {
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
        }
    }, [projectId, isReadOnly, setProjectId, setIsReadOnly]);

    return null;
}

export function WriterView(props: WriterViewProps) {
  const { project, isReadOnly = false } = props;

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
       <WriterProvider {...props}>
           <CanvasSync projectId={project.id} isReadOnly={isReadOnly} />
           <WriterViewContent />
           <FloatingAssistant projectId={project.id} />
       </WriterProvider>
    </div>
  );
}
