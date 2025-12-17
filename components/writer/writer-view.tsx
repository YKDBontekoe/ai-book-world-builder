"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { Project } from "@/lib/db/schema";
import { Loader2, Save, History } from "lucide-react";
import { Button } from "../ui/button";
import { Editor } from "../editor/text-editor";
import { SceneNavigation } from "./left-sidebar/scene-navigation";
import { BookCanvas } from "../book-canvas/book-canvas";
import { StructureEditorDialog } from "./structure-editor-dialog";
import { FloatingAssistant } from "../chat/floating-assistant";
import { ProjectSettingsModal } from "./project-settings-modal";
import { useWriterState } from "../../hooks/use-writer-state";
import { EmptyProjectState } from "./empty-project-state";

interface WriterViewProps {
  project: Project;
}

export function WriterView({ project }: WriterViewProps) {
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
  } = useWriterState({ projectId: project.id });

  const isEmpty = !loading && structure && structure.length === 0;

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
                {!isEmpty && (
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
                )}

                <div className="flex-1 overflow-y-auto relative">
                   {isEmpty ? (
                     <EmptyProjectState
                        project={project}
                        structureText={structureText}
                        onStructureUpdate={fetchStructure}
                     />
                   ) : activeSceneId ? (
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
