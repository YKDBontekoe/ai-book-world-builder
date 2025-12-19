"use client";

import { Loader2, Save, History } from "lucide-react";
import { Button } from "../ui/button";
import { useWriterContext } from "./writer-context";

export function WriterHeader() {
  const {
    activeScene,
    structure,
    handleSnapshot,
    isSnapshotting,
    isSaving,
    lastSaved
  } = useWriterContext();

  const hasScenes = structure ? structure.some(c => c.scenes.length > 0) : false;

  return (
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
  );
}
