"use client";

import { Loader2, Save, History, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { cn } from "@/lib/utils";

export function WriterHeader() {
  const {
    activeScene,
    structure,
    handleSnapshot,
    isSnapshotting,
    isSaving,
    lastSaved
  } = useWriterContext();

  const { isSidebarOpen, toggleSidebar } = useWriterLayoutContext();

  const hasScenes = structure ? structure.some(c => c.scenes.length > 0) : false;

  return (
      <div className={cn(
        "flex items-center justify-between border-b px-4 py-2 shrink-0 z-10",
        "glass-surface"
      )}>
        <div className="flex items-center gap-2 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
             {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
          <div className="text-sm font-medium truncate max-w-[200px]">
            {activeScene?.title || (hasScenes ? "No scene selected" : "Welcome")}
          </div>
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
