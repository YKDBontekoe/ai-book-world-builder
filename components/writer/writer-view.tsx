"use client";

import dynamic from "next/dynamic";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { Project } from "@/lib/db/schema";
import { ChapterWithScenes } from "@/lib/types";
import { BookCanvas } from "../book-canvas/book-canvas";
import { WriterSidebar } from "./writer-sidebar";
import { WriterEditor } from "./writer-editor";
import { WriterProvider } from "./writer-context";

// Lazy load assistant
const FloatingAssistant = dynamic(() => import("../chat/floating-assistant").then(mod => mod.FloatingAssistant));

interface WriterViewProps {
  project: Project;
  initialStructure?: ChapterWithScenes[];
  initialStructureText?: string;
}

export function WriterView(props: WriterViewProps) {
  const { project } = props;

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
       <WriterProvider {...props}>
          <ResizablePanelGroup direction="horizontal" className="flex-1">
              {/* Left Panel: Navigation */}
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-muted/10 backdrop-blur-md">
                 <WriterSidebar />
              </ResizablePanel>

              <ResizableHandle />

              {/* Center Panel: Editor */}
              <ResizablePanel defaultSize={50} minSize={30}>
                 <WriterEditor />
              </ResizablePanel>

              <ResizableHandle />

              {/* Right Panel: Book Canvas */}
              <ResizablePanel defaultSize={30} minSize={20} collapsible={true} collapsedSize={0}>
                 <BookCanvas variant="embedded" />
              </ResizablePanel>
           </ResizablePanelGroup>
           <FloatingAssistant projectId={project.id} />
       </WriterProvider>
    </div>
  );
}
