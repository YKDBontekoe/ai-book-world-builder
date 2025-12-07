"use client";

import {
  ActivityIcon,
  BookOpenIcon,
  ChevronRightIcon,
  FileTextIcon,
  HistoryIcon,
  LayoutIcon,
  LibraryIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type CanvasPane, useBookCanvas } from "./book-canvas-context";
import { BiblePane } from "./panes/bible-pane";
import { ChangeLogPane } from "./panes/changelog-pane";
import { DiagnosticsPane } from "./panes/diagnostics-pane";
import { DraftPane } from "./panes/draft-pane";
import { OutlinePane } from "./panes/outline-pane";
import { ScenePane } from "./panes/scene-pane";

export function BookCanvas() {
  const { isOpen, setIsOpen, activePane, setActivePane, overallStatus } =
    useBookCanvas();

  const renderContent = () => {
    switch (activePane) {
      case "outline":
        return <OutlinePane />;
      case "scenes":
        return <ScenePane />;
      case "draft":
        return <DraftPane />;
      case "diagnostics":
        return <DiagnosticsPane />;
      case "bible":
        return <BiblePane />;
      case "changes":
        return <ChangeLogPane />;
      default:
        return <OutlinePane />;
    }
  };

  const tabs: { id: CanvasPane; label: string; icon: any }[] = [
    { id: "outline", label: "Outline", icon: LayoutIcon },
    { id: "scenes", label: "Scenes", icon: LibraryIcon },
    { id: "draft", label: "Draft", icon: FileTextIcon },
    { id: "diagnostics", label: "Readiness", icon: ActivityIcon },
    { id: "bible", label: "Bible", icon: BookOpenIcon },
    { id: "changes", label: "Log", icon: HistoryIcon },
  ];

  // Collapsed state - show expand button
  if (!isOpen) {
    return (
      <div className="hidden h-dvh w-12 flex-shrink-0 flex-col items-center border-l bg-muted/30 py-4 md:flex">
        <Button
          className="h-10 w-10 rounded-full"
          onClick={() => setIsOpen(true)}
          size="icon"
          variant="ghost"
        >
          <ChevronRightIcon className="h-5 w-5 rotate-180" />
        </Button>
        <div className="mt-4 flex flex-1 flex-col items-center gap-2">
          {tabs.slice(0, 4).map((tab) => (
            <Button
              className={cn(
                "h-9 w-9 rounded-lg",
                activePane === tab.id && "bg-primary/10 text-primary"
              )}
              key={tab.id}
              onClick={() => {
                setActivePane(tab.id);
                setIsOpen(true);
              }}
              size="icon"
              title={tab.label}
              variant="ghost"
            >
              <tab.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "hidden h-dvh w-[380px] flex-shrink-0 flex-col border-l bg-background md:flex lg:w-[420px]",
        "transition-all duration-300 ease-in-out"
      )}
    >
      {/* Header with gradient */}
      <div className="flex items-center justify-between border-b bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <SparklesIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Book Canvas</h2>
            <span
              className={cn(
                "text-xs",
                overallStatus === "running"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground"
              )}
            >
              {overallStatus === "running" ? "✨ Generating..." : "Ready"}
            </span>
          </div>
        </div>
        <Button
          className="h-7 w-7"
          onClick={() => setIsOpen(false)}
          size="icon"
          variant="ghost"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs with enhanced styling */}
      <div className="scrollbar-hide flex overflow-x-auto border-b bg-muted/20">
        {tabs.map((tab) => (
          <button
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2.5 font-medium text-muted-foreground text-xs transition-all",
              "hover:bg-muted/50 hover:text-foreground",
              activePane === tab.id &&
                "border-primary border-b-2 bg-background text-primary shadow-sm"
            )}
            key={tab.id}
            onClick={() => setActivePane(tab.id)}
            type="button"
          >
            <tab.icon className="h-4 w-4" />
            <span className="mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area with subtle background */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/5 to-muted/20 pb-16">
        {renderContent()}
      </div>

      {/* Status Footer with subtle design */}
      <div className="absolute bottom-0 w-full border-t bg-background/95 p-2 text-muted-foreground text-xs backdrop-blur-sm">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>AI Ready</span>
          </div>
          <span className="text-muted-foreground/70">
            Ask anything in chat →
          </span>
        </div>
      </div>
    </div>
  );
}
