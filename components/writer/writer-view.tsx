"use client";

import { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { getProjectStructure, updateSceneContent, createChapterSnapshot } from "../../app/actions/writer";
import { Project } from "@/lib/db/schema";
import { Loader2, Save, History } from "lucide-react";
import { Button } from "../ui/button";
import { Editor } from "../editor/text-editor";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import { SceneNavigation, ChapterWithScenes } from "./left-sidebar/scene-navigation";
import { BookCanvas } from "../book-canvas/book-canvas";
import { useBookCanvasActions, useBookCanvasValue } from "../book-canvas/book-canvas-context";
import { StructureEditorDialog } from "./structure-editor-dialog";
import { FloatingAssistant } from "../chat/floating-assistant";
import { ProjectSettingsModal } from "./project-settings-modal";

interface WriterViewProps {
  project: Project;
}

export function WriterView({ project }: WriterViewProps) {
  const [structure, setStructure] = useState<ChapterWithScenes[] | null>(null);
  const [structureText, setStructureText] = useState("");
  const [loading, setLoading] = useState(true);

  // Use context for active scene to sync with Book Canvas
  const { activeSceneId } = useBookCanvasValue();
  const { setActiveSceneId, setProjectId } = useBookCanvasActions();

  const [sceneContent, setSceneContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Sync project ID to Book Canvas context
  useEffect(() => {
    setProjectId(project.id);
  }, [project.id, setProjectId]);

  // Find the active scene object
  const activeScene = structure
    ?.flatMap((c) => c.scenes)
    .find((s) => s.id === activeSceneId);

  // Load content when active scene changes
  useEffect(() => {
    if (activeScene) {
      setSceneContent(activeScene.content || "");
    }
  }, [activeSceneId, activeScene]);

  const fetchStructure = async () => {
    setLoading(true);
    // Note: getProjectStructure server action needs to be updated to return prevSceneId
    // But assuming the type is compatible or we cast it for now.
    const result = await getProjectStructure(project.id);
    if (result.structure) {
      // Cast the result to our extended type for now
      setStructure(result.structure as unknown as ChapterWithScenes[]);
      if (result.structureText) {
        setStructureText(result.structureText);
      }
      if (
        !activeSceneId &&
        result.structure.length > 0 &&
        result.structure[0].scenes.length > 0
      ) {
        setActiveSceneId(result.structure[0].scenes[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStructure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const debouncedSave = useDebounceCallback(async (content: string, id: string) => {
    setIsSaving(true);
    const result = await updateSceneContent(id, content);
    setIsSaving(false);
    if (result.success) {
      setLastSaved(new Date());
      setStructure((prev) =>
        prev
          ? prev.map((c) => ({
              ...c,
              scenes: c.scenes.map((s) =>
                s.id === id ? { ...s, content } : s
              ),
            }))
          : null
      );
    } else {
      toast.error("Failed to save changes");
    }
  }, 1000);

  const handleContentChange = (newContent: string) => {
    setSceneContent(newContent);
    if (activeSceneId) {
      debouncedSave(newContent, activeSceneId);
    }
  };

  const handleSnapshot = async () => {
    if (!activeScene?.chapterId) return;
    setIsSnapshotting(true);
    const result = await createChapterSnapshot(activeScene.chapterId);
    setIsSnapshotting(false);
    if (result.success) {
      toast.success("Chapter version saved");
    } else {
      toast.error("Failed to create version");
    }
  };

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
