"use client";

import dynamic from "next/dynamic";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { Project } from "@/lib/db/schema";
import { ChapterWithScenes } from "@/lib/types";
import { Loader2, Save, History } from "lucide-react";
import { Button } from "../ui/button";
import { Editor } from "../editor/text-editor";
import { SceneNavigation } from "./left-sidebar/scene-navigation";
import { BookCanvas } from "../book-canvas/book-canvas";
import { useWriterState } from "../../hooks/use-writer-state";

// Lazy load dialogs and assistant to reduce initial bundle size
const StructureEditorDialog = dynamic(() => import("./structure-editor-dialog").then(mod => mod.StructureEditorDialog));
const ProjectSettingsModal = dynamic(() => import("./project-settings-modal").then(mod => mod.ProjectSettingsModal));
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

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
       <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel: Navigation */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-muted/10 backdrop-blur-md">
             <div className="flex flex-col h-full border-r">
                <div className="p-4 border-b flex items-center justify-between">
                   <h2 className="font-semibold">Outline</h2>
                   <div className="flex gap-1">
                       <StructureEditorDialog
                          project={project}
                          initialStructureText={structureText}
                          onStructureUpdate={fetchStructure}
                       />
                       <ProjectSettingsModal project={project} />
                   </div>
                </div>
                <SceneNavigation
                   project={project}
                   structure={structure}
                   activeSceneId={activeSceneId}
                   onSceneSelect={setActiveSceneId}
                   loading={loading}
                   onStructureUpdate={fetchStructure}
                />
             </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Center Panel: Editor */}
          <ResizablePanel defaultSize={50} minSize={30}>
             <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background/50">
                <div className="flex items-center justify-between border-b px-4 py-2 shrink-0 bg-background/80 backdrop-blur-sm z-10">
                  <div className="text-sm font-medium truncate max-w-[200px]">
                    {activeScene?.title || "No scene selected"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {activeScene && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={handleSnapshot}
                          disabled={isSnapshotting}
                        >
                          {isSnapshotting ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <History className="mr-1 h-3 w-3" />
                          )}
                          Snapshot
                        </Button>
                      </>
                    )}
                    <div className="h-4 w-[1px] bg-border mx-1" />
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Saving...
                      </>
                    ) : lastSaved ? (
                      <>
                        <Save className="h-3 w-3" />
                        Saved
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto relative">
                   {activeSceneId ? (
                      <div className="max-w-3xl mx-auto min-h-full py-8 px-8">
                        <Editor
                          key={activeSceneId} // Force remount on scene change
                          content={sceneContent}
                          onSaveContent={handleContentChange}
                          status="idle"
                          isCurrentVersion={true}
                          currentVersionIndex={0}
                          suggestions={[]}
                        />
                      </div>
                   ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        Select a scene to start writing
                      </div>
                   )}
                </div>
             </div>
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
