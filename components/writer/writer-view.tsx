"use client";

import dynamic from "next/dynamic";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { Project } from "@/lib/db/schema";
import { ChapterWithScenes } from "@/lib/types";
import { BookCanvas } from "../book-canvas/book-canvas";
import { useWriterState } from "../../hooks/use-writer-state";
import { WriterSidebar } from "./writer-sidebar";
import { WriterEditor } from "./writer-editor";
import { useOptimistic, useTransition } from "react";
import { createNewChapter } from "@/app/actions/writer";
import { toast } from "sonner";

// Lazy load assistant
const FloatingAssistant = dynamic(() => import("../chat/floating-assistant").then(mod => mod.FloatingAssistant));

interface WriterViewProps {
  project: Project;
  initialStructure?: ChapterWithScenes[];
  initialStructureText?: string;
}

export function WriterView({ project, initialStructure, initialStructureText }: WriterViewProps) {
  const {
    structure,
    structureText,
    loading,
    activeSceneId,
    setActiveSceneId,
    sceneContent,
    activeScene,
    isSaving,
    lastSaved,
    isSnapshotting,
    handleContentChange,
    handleSnapshot,
    fetchStructure,
  } = useWriterState({
    projectId: project.id,
    initialStructure,
    initialStructureText
  });

  const [optimisticStructure, addOptimisticChapter] = useOptimistic(
    structure || [],
    (state, newChapter: ChapterWithScenes) => [...state, newChapter]
  );
  const [isPending, startTransition] = useTransition();

  const handleCreateChapter = () => {
    const nextSequence = (optimisticStructure.length) + 1;
    const tempChapter: ChapterWithScenes = {
        id: crypto.randomUUID(),
        projectId: project.id,
        volumeId: "temp",
        outlineId: "temp",
        title: `Chapter ${nextSequence}`,
        sequence: nextSequence,
        status: "planned",
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        scenes: []
    };

    startTransition(async () => {
        addOptimisticChapter(tempChapter);

        const promise = async () => {
            const result = await createNewChapter(project.id);
            if (!result.success) throw new Error("Failed to create chapter");
            await fetchStructure();
        };

        toast.promise(promise(), {
            loading: "Creating new chapter...",
            success: "Chapter created",
            error: "Failed to create chapter"
        });
    });
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
       <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel: Navigation */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-muted/10 backdrop-blur-md">
             <WriterSidebar
               project={project}
               structure={optimisticStructure}
               structureText={structureText}
               activeSceneId={activeSceneId}
               onSceneSelect={setActiveSceneId}
               loading={loading}
               onStructureUpdate={fetchStructure}
               onCreateChapter={handleCreateChapter}
             />
          </ResizablePanel>

          <ResizableHandle />

          {/* Center Panel: Editor */}
          <ResizablePanel defaultSize={50} minSize={30}>
             <WriterEditor
               projectId={project.id}
               activeScene={activeScene}
               activeSceneId={activeSceneId}
               sceneContent={sceneContent}
               handleContentChange={handleContentChange}
               handleSnapshot={handleSnapshot}
               isSnapshotting={isSnapshotting}
               isSaving={isSaving}
               lastSaved={!!lastSaved}
               hasScenes={structure ? structure.some(c => c.scenes.length > 0) : false}
             />
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel: Book Canvas */}
          <ResizablePanel defaultSize={30} minSize={20} collapsible={true} collapsedSize={0}>
             <BookCanvas variant="embedded" />
          </ResizablePanel>
       </ResizablePanelGroup>
       <FloatingAssistant projectId={project.id} />
    </div>
  );
}
