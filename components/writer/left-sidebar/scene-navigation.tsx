"use client";

import { useState } from "react";
import { Project } from "@/lib/db/schema";
import { Loader2, FileText, Plus, Sparkles, BookPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from "@/components/ui/context-menu";
import { generateScene, createNewChapter } from "@/app/actions/writer";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChapterWithScenes } from "@/lib/types";

interface SceneNavigationProps {
  project: Project;
  activeSceneId: string | null;
  onSceneSelect: (sceneId: string) => void;
  structure: ChapterWithScenes[] | null;
  loading: boolean;
  onStructureUpdate?: () => void;
}

export function SceneNavigation({
  project,
  activeSceneId,
  onSceneSelect,
  structure,
  loading,
  onStructureUpdate
}: SceneNavigationProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);

  const handleGenerateNextScene = async (chapterId: string, prevSceneId?: string) => {
      setIsGenerating(true);
      const toastId = toast.loading("Generating new scene...");

      try {
          const result = await generateScene(chapterId, prevSceneId);
          if (result.success && result.sceneId) {
              toast.success("Scene generated!", { id: toastId });
              if (onStructureUpdate) {
                onStructureUpdate();
              } else {
                window.location.reload();
              }
          } else {
              toast.error("Generation failed", { id: toastId });
          }
      } catch (e) {
          toast.error("Error generating scene", { id: toastId });
      } finally {
          setIsGenerating(false);
      }
  };

  const handleCreateChapter = async () => {
      setIsCreatingChapter(true);
      const toastId = toast.loading("Creating new chapter...");
      try {
          const result = await createNewChapter(project.id);
          if (result.success) {
               toast.success("Chapter created!", { id: toastId });
               if (onStructureUpdate) {
                   onStructureUpdate();
               } else {
                   window.location.reload();
               }
          } else {
               toast.error("Failed to create chapter", { id: toastId });
          }
      } catch (e) {
          toast.error("Error creating chapter", { id: toastId });
      } finally {
          setIsCreatingChapter(false);
      }
  }

  if (loading) {
     return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      );
  }

  if (!structure) {
     return (
        <div className="p-4 text-sm text-muted-foreground">
          Failed to load structure.
        </div>
      );
  }

  if (structure.length === 0) {
      return (
          <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-4">
              <p className="text-sm text-muted-foreground">No chapters yet.</p>
              <Button onClick={handleCreateChapter} disabled={isCreatingChapter} variant="outline" size="sm">
                  {isCreatingChapter ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookPlus className="mr-2 h-4 w-4" />}
                  Add Chapter
              </Button>
          </div>
      );
  }

  return (
    <ScrollArea className="flex-1">
        <Accordion type="multiple" defaultValue={structure.map((c) => c.id)} className="w-full">
          {structure.map((chapter) => (
            <AccordionItem key={chapter.id} value={chapter.id} className="border-b-0 px-2">
              <ContextMenu>
                <ContextMenuTrigger>
                  <AccordionTrigger className="hover:no-underline py-2 text-sm font-medium">
                    <span className="truncate text-left">{chapter.title}</span>
                  </AccordionTrigger>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={() => handleGenerateNextScene(chapter.id)} disabled={isGenerating}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate New Scene
                    </ContextMenuItem>
                    <ContextMenuItem disabled>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Scene Manually (Coming Soon)
                    </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>

              <AccordionContent className="pb-2 pt-0">
                <div className="flex flex-col gap-1 pl-2 relative border-l ml-2">
                  {chapter.scenes.map((scene) => (
                    <div key={scene.id} className="relative">
                        <ContextMenu>
                            <ContextMenuTrigger>
                                <Button
                                  variant={activeSceneId === scene.id ? "secondary" : "ghost"}
                                  size="sm"
                                  className={cn(
                                    "justify-start h-8 w-full px-2 text-xs font-normal",
                                    activeSceneId === scene.id && "bg-secondary/50 font-medium"
                                  )}
                                  onClick={() => onSceneSelect(scene.id)}
                                >
                                  <FileText className="mr-2 h-3 w-3 opacity-70" />
                                  <span className="truncate">{scene.title}</span>
                                </Button>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuItem onClick={() => handleGenerateNextScene(chapter.id, scene.id)} disabled={isGenerating}>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Continuation
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem className="text-destructive" disabled>
                                    Delete Scene
                                </ContextMenuItem>
                            </ContextMenuContent>
                        </ContextMenu>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="justify-start h-8 w-full px-2 text-xs text-muted-foreground italic" onClick={() => handleGenerateNextScene(chapter.id)} disabled={isGenerating}>
                     {isGenerating ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Plus className="mr-2 h-3 w-3" />}
                     Add Scene
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
          {/* Always allow adding a new chapter at the bottom */}
          <div className="p-2">
               <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleCreateChapter} disabled={isCreatingChapter}>
                   {isCreatingChapter ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                   Add Chapter
               </Button>
          </div>
        </Accordion>
    </ScrollArea>
  );
}
