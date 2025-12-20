"use client";

import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plus, ChevronDown, ChevronRight, FileText, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";
import { createNewChapter } from "@/app/actions/writer";
import { toast } from "sonner";
import { StructureEditorDialog } from "./structure-editor-dialog";
import { useWriterContext } from "./writer-context";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

function SidebarSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items
        <div key={i} className="space-y-2">
          <Skeleton className="h-8 w-full rounded-md" />
          <div className="pl-4 space-y-1">
             <Skeleton className="h-6 w-5/6 rounded-md" />
             <Skeleton className="h-6 w-4/6 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WriterSidebar() {
  const {
    project,
    structure,
    structureText,
    activeSceneId,
    setActiveSceneId,
    loading,
    fetchStructure
  } = useWriterContext();

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const handleAddChapter = async () => {
    const toastId = toast.loading("Creating chapter...");
    try {
      await createNewChapter(project.id);
      toast.success("Chapter created", { id: toastId });
      fetchStructure();
    } catch (e) {
      toast.error("Failed to create chapter", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col h-full border-r bg-sidebar">
      <div className="p-4 border-b flex items-center justify-between bg-sidebar-accent/50 shrink-0">
        <h2 className="font-semibold text-sm text-sidebar-foreground">Book Structure</h2>
        <div className="flex items-center gap-1">
           <StructureEditorDialog
             projectId={project.id}
             currentStructure={structureText}
             onSave={() => {
                fetchStructure();
             }}
           >
             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/50">
               <FileText className="h-4 w-4" />
             </Button>
           </StructureEditorDialog>
           <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/50" onClick={handleAddChapter}>
             <Plus className="h-4 w-4" />
           </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
           {loading ? (
             <SidebarSkeleton />
           ) : !structure || structure.length === 0 ? (
             <div className="p-4">
               <EmptyState
                  variant="dashed"
                  title="No chapters"
                  description="Start by creating a chapter."
                  icon={FolderOpen}
                  className="py-8"
                  action={
                    <Button variant="outline" size="sm" onClick={handleAddChapter} className="w-full">
                      <Plus className="mr-2 h-3 w-3" />
                      Add Chapter
                    </Button>
                  }
                />
             </div>
           ) : (
             structure.map((chapter) => (
               <div key={chapter.id} className="space-y-1">
                 <button
                   onClick={() => toggleChapter(chapter.id)}
                   className={cn(
                     "w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground group",
                     expandedChapters[chapter.id] && "bg-sidebar-accent"
                   )}
                 >
                   <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                     {expandedChapters[chapter.id] ? (
                       <ChevronDown className="h-4 w-4" />
                     ) : (
                       <ChevronRight className="h-4 w-4" />
                     )}
                   </div>
                   <Folder className={cn("h-4 w-4 transition-colors", expandedChapters[chapter.id] ? "text-blue-500" : "text-blue-500/70 group-hover:text-blue-500")} />
                   <span className="truncate">{chapter.title}</span>
                 </button>

                 {expandedChapters[chapter.id] && (
                   <div className="ml-4 pl-2 border-l border-border/50 space-y-1 mt-1 animate-accordion-down overflow-hidden">
                     {chapter.scenes.map((scene) => (
                       <button
                         key={scene.id}
                         onClick={() => setActiveSceneId(scene.id)}
                         className={cn(
                           "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-left",
                           activeSceneId === scene.id
                             ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                             : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                         )}
                       >
                         <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", activeSceneId === scene.id ? "bg-blue-500" : "bg-muted-foreground/40")} />
                         <span className="truncate">{scene.title}</span>
                       </button>
                     ))}
                     {chapter.scenes.length === 0 && (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground italic pl-6">
                           No scenes
                        </div>
                     )}
                   </div>
                 )}
               </div>
             ))
           )}
        </div>
      </ScrollArea>
    </div>
  );
}
