"use client";

import { useEffect, useState } from "react";
import { Project } from "@/lib/db/schema";
import { Scene, Chapter } from "@/lib/db/schema";
import { Loader2, FileText, ChevronRight, ChevronDown, Plus, Sparkles } from "lucide-react";
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
import { generateScene } from "@/app/actions/writer";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SceneNavigationProps {
  project: Project;
  activeSceneId: string | null;
  onSceneSelect: (sceneId: string) => void;
  structure: ChapterWithScenes[] | null;
  loading: boolean;
}

type SceneWithPrev = Scene & { prevSceneId: string | null };
export type ChapterWithScenes = Chapter & { scenes: SceneWithPrev[] };

export function SceneNavigation({
  project,
  activeSceneId,
  onSceneSelect,
  structure,
  loading
}: SceneNavigationProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateNextScene = async (chapterId: string, prevSceneId?: string) => {
      setIsGenerating(true);
      const toastId = toast.loading("Generating new scene...");

      try {
          const result = await generateScene(chapterId, prevSceneId);
          if (result.success && result.sceneId) {
              toast.success("Scene generated!", { id: toastId });
              // Refresh data - in a real app we might update local state or revalidate
              // Since we pass structure as prop, the parent needs to reload.
              // But we can also force a refresh via router if using RSC.
              // Ideally the parent component should expose a reload function.
              // For now, let's assume the parent WriterView handles data fetching and we might need to trigger it.
              // Triggering a router refresh might re-run the server component if it was one,
              // but WriterView fetches client-side in useEffect.
              // We'll trust the user to reload or implement a callback in props later.
              // Wait, the parent passes `onStructureUpdate` to StructureEditorDialog.
              // We should probably accept an `onStructureUpdate` prop here too.
              // For this refactor, I'll just select the new scene if I could, but I can't without reloading structure.
              window.location.reload(); // Brute force refresh for MVP correctness
          } else {
              toast.error("Generation failed", { id: toastId });
          }
      } catch (e) {
          toast.error("Error generating scene", { id: toastId });
      } finally {
          setIsGenerating(false);
      }
  };

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
        </Accordion>
    </ScrollArea>
  );
}
