"use client";

import { useState } from "react";
import { Project } from "@/lib/db/schema";
import { EmptyState } from "../ui/empty-state";
import { Button } from "../ui/button";
import { BookOpen, Sparkles, FileText, Loader2, Plus } from "lucide-react";
import { StructureEditorDialog } from "./structure-editor-dialog";
import { createNewChapter, generateScene } from "../../app/actions/writer";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EmptyProjectStateProps {
  project: Project;
  structureText: string;
  onStructureUpdate: () => void;
}

export function EmptyProjectState({
  project,
  structureText,
  onStructureUpdate,
}: EmptyProjectStateProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleStartFromScratch = async () => {
    setIsCreating(true);
    const toastId = toast.loading("Setting up your book...");

    try {
      // 1. Create Chapter 1
      const chapterResult = await createNewChapter(project.id, "Chapter 1");
      if (!chapterResult.success || !chapterResult.chapterId) {
        throw new Error("Failed to create chapter");
      }

      // 2. Create Scene 1 (Wait for structure update? No, we can just create it)
      // The generateScene action handles creation logic. If we pass chapterId, it creates a scene.
      // But generateScene calls AI. We might just want an empty scene.
      // generateScene is for AI.
      // We should probably just let the user add a scene manually or use AI.
      // But "Start from Scratch" implies *some* structure.
      // Let's create an AI generated scene introduction or just an empty one.
      // Since generateScene is "Generate New Scene" (AI), let's use it to "Kickstart" the book.
      // Or maybe just stop at Chapter 1?
      // If we stop at Chapter 1, the user sees "Chapter 1" in the sidebar, and can click "Add Scene".
      // That's better than nothing.

      // Let's actually create the first scene too so the editor opens immediately.
      // But `generateScene` is AI driven.
      // If we want a blank scene, we'd need a `createScene` action exposed.
      // But we only have `generateScene` in `writer.ts` (publicly exposed).
      // Wait, `createNewChapter` was just added.
      // Let's just create the chapter. That's enough to "break" the empty state.

      toast.success("Chapter 1 created!", { id: toastId });
      onStructureUpdate();
    } catch (e) {
      toast.error("Failed to start project", { id: toastId });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="max-w-md w-full">
        <EmptyState
          title="Start Your Masterpiece"
          description="Your book is currently empty. Choose how you want to begin."
          icon={BookOpen}
          className="bg-background/50 backdrop-blur-sm border-muted"
          action={
            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto mt-6">
              <Button
                onClick={handleStartFromScratch}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Start from Scratch
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <StructureEditorDialog
                project={project}
                initialStructureText={structureText}
                onStructureUpdate={onStructureUpdate}
              >
                 <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Paste Outline
                 </Button>
              </StructureEditorDialog>
            </div>
          }
        />

        <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
                Need inspiration?
            </p>
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Ask the Assistant to "Generate an outline for a Sci-Fi novel"
            </div>
        </div>
      </div>
    </div>
  );
}
