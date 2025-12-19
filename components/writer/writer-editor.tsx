"use client";

import { Loader2, Save, History, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Editor } from "../editor/text-editor";
import { EmptyState } from "../ui/empty-state";
import { initializeProject } from "@/app/actions/writer";
import { toast } from "sonner";
import { useState } from "react";
import type { Scene } from "@/lib/db/schema";

interface WriterEditorProps {
  projectId: string;
  activeScene: Scene | undefined;
  activeSceneId: string | null;
  sceneContent: string;
  handleContentChange: (content: string) => void;
  handleSnapshot: () => void;
  isSnapshotting: boolean;
  isSaving: boolean;
  lastSaved: boolean;
  hasScenes: boolean;
}

export function WriterEditor({
  projectId,
  activeScene,
  activeSceneId,
  sceneContent,
  handleContentChange,
  handleSnapshot,
  isSnapshotting,
  isSaving,
  lastSaved,
  hasScenes,
}: WriterEditorProps) {
  const [isInitializing, setIsInitializing] = useState(false);

  const handleStartWriting = async () => {
    setIsInitializing(true);
    const toastId = toast.loading("Initializing your book...");
    try {
      const result = await initializeProject(projectId);
      if (result.success && result.sceneId) {
        toast.success("Ready to write!", { id: toastId });
        // Refresh the page to load the new structure and select the scene
        // In a more complex app we might update local state, but reload ensures full sync
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
      <div className="flex items-center justify-between border-b px-4 py-2 shrink-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="text-sm font-medium truncate max-w-[200px]">
          {activeScene?.title || (hasScenes ? "No scene selected" : "Welcome")}
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
