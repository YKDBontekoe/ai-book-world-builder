"use client";

import { Loader2, Save, History } from "lucide-react";
import { Button } from "../ui/button";
import { Editor } from "../editor/text-editor";
import type { Scene } from "@/lib/db/schema";

interface WriterEditorProps {
  activeScene: Scene | undefined;
  activeSceneId: string | null;
  sceneContent: string;
  handleContentChange: (content: string) => void;
  handleSnapshot: () => void;
  isSnapshotting: boolean;
  isSaving: boolean;
  lastSaved: boolean;
}

export function WriterEditor({
  activeScene,
  activeSceneId,
  sceneContent,
  handleContentChange,
  handleSnapshot,
  isSnapshotting,
  isSaving,
  lastSaved,
}: WriterEditorProps) {
  return (
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
  );
}
