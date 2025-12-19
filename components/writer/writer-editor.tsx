"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Editor } from "../editor/text-editor";
import { EmptyState } from "../ui/empty-state";
import { initializeProject } from "@/app/actions/writer";
import { toast } from "sonner";
import { useState } from "react";
import { useWriterContext } from "./writer-context";
import { WriterHeader } from "./writer-header";

export function WriterEditor() {
  const {
    project,
    activeScene,
    activeSceneId,
    sceneContent,
    handleContentChange,
    structure
  } = useWriterContext();

  const hasScenes = structure ? structure.some(c => c.scenes.length > 0) : false;

  const [isInitializing, setIsInitializing] = useState(false);

  const handleStartWriting = async () => {
    setIsInitializing(true);
    const toastId = toast.loading("Initializing your book...");
    try {
      const result = await initializeProject(project.id);
      if (result.success && result.sceneId) {
        toast.success("Ready to write!", { id: toastId });
        window.location.reload();
      } else {
        toast.error("Failed to start project", { id: toastId });
      }
    } catch (error) {
      toast.error("An error occurred", { id: toastId });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background/50">
      <WriterHeader />

      <div className="flex-1 overflow-y-auto relative">
        {activeSceneId ? (
          <div className="max-w-3xl mx-auto min-h-full py-8 px-8">
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
        ) : !hasScenes ? (
            <div className="flex h-full items-center justify-center p-8">
              <EmptyState
                title="Start Your Story"
                description="Create your first scene to begin your journey. AI tools will become available once you start."
                icon={Sparkles}
                action={
                  <Button onClick={handleStartWriting} disabled={isInitializing}>
                    {isInitializing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Start Writing
                  </Button>
                }
              />
            </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a scene to start writing
          </div>
        )}
      </div>
    </div>
  );
}
