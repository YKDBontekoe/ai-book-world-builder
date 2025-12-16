"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getProjectStructure, updateSceneContent, createChapterSnapshot } from "@/app/(chat)/projects/[id]/generate/actions";
import { Project } from "@/lib/db/schema";
import { Loader2, FileText, ChevronRight, Save, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Editor } from "@/components/editor/text-editor";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import { AISidebar } from "@/components/writer/tools/ai-sidebar";
import { StructureEditorDialog } from "@/components/writer/structure-editor-dialog";
import { AIWriterPanel } from "@/components/writer/ai-writer-panel";
import { Wand2 } from "lucide-react";

interface WriterViewProps {
  project: Project;
}

type Scene = {
  id: string;
  title: string;
  sequence: number;
  content: string | null;
  status: string;
  chapterId: string;
};

type Chapter = {
  id: string;
  title: string;
  sequence: number;
  scenes: Scene[];
};

export function WriterView({ project }: WriterViewProps) {
  const [structure, setStructure] = useState<Chapter[] | null>(null);
  const [structureText, setStructureText] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [sceneContent, setSceneContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showAIWriter, setShowAIWriter] = useState(false);

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
    const result = await getProjectStructure(project.id);
    if ("structure" in result && result.structure) {
      setStructure(result.structure);
      if (result.structureText) {
        setStructureText(result.structureText);
      }
      // Default to first scene of first chapter if available, only if no active scene selected yet
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
    if ("success" in result && result.success) {
      setLastSaved(new Date());
      // Update local structure state to reflect content change
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
    if ("success" in result && result.success) {
      toast.success("Chapter version saved");
    } else {
      toast.error("Failed to create version");
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Sidebar: Navigation */}
      <aside className="w-64 shrink-0 border-r bg-muted/20 backdrop-blur-xl flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-1">Outline</h2>
          <p className="text-xs text-muted-foreground mb-2">Select a scene to edit</p>
          <StructureEditorDialog
            project={project}
            initialStructureText={structureText}
            onStructureUpdate={fetchStructure}
          />
        </div>
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : structure ? (
            <Accordion type="multiple" defaultValue={structure.map((c) => c.id)} className="w-full">
              {structure.map((chapter) => (
                <AccordionItem key={chapter.id} value={chapter.id} className="border-b-0 px-2">
                  <AccordionTrigger className="hover:no-underline py-2 text-sm font-medium">
                    <span className="truncate text-left">{chapter.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2 pt-0">
                    <div className="flex flex-col gap-1 pl-2">
                      {chapter.scenes.map((scene) => (
                        <Button
                          key={scene.id}
                          variant={activeSceneId === scene.id ? "secondary" : "ghost"}
                          size="sm"
                          className={cn(
                            "justify-start h-8 px-2 text-xs font-normal",
                            activeSceneId === scene.id && "bg-secondary/50 font-medium"
                          )}
                          onClick={() => setActiveSceneId(scene.id)}
                        >
                          <FileText className="mr-2 h-3 w-3 opacity-70" />
                          <span className="truncate">{scene.title}</span>
                        </Button>
                      ))}
                      {chapter.scenes.length === 0 && (
                        <div className="px-2 py-1 text-xs text-muted-foreground italic">
                          No scenes
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              Failed to load structure.
            </div>
          )}
        </ScrollArea>
      </aside>

      {/* Main Area: Editor */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex items-center justify-between border-b px-4 py-2 shrink-0 bg-background/50 backdrop-blur-sm">
          <div className="text-sm font-medium">
            {activeScene?.title || "No scene selected"}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {activeScene && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setShowAIWriter(!showAIWriter)}
                >
                  <Wand2 className="mr-1 h-3 w-3" />
                  AI Assist
                </Button>
                <div className="h-4 w-[1px] bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={handleSnapshot}
                  disabled={isSnapshotting}
                  title="Save current state as a chapter version"
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
                Saved {lastSaved.toLocaleTimeString()}
              </>
            ) : null}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeSceneId ? (
            <div className="max-w-3xl mx-auto min-h-full py-8 px-8">
              {showAIWriter && activeScene && (
                <AIWriterPanel
                  sceneId={activeSceneId}
                  projectId={project.id}
                  onContentGenerated={(content) => handleContentChange(sceneContent ? sceneContent + "\n" + content : content)}
                  onClose={() => setShowAIWriter(false)}
                />
              )}
              <Editor
                key={activeSceneId}
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
      {/* AISidebar removed as requested to move away from Chat interface */}
    </div>
  );
}
