"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { planChapterScenes, generateSceneText } from "@/app/actions/story-generation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/atoms/dropdown-menu";
import { Button } from "@/components/atoms/button";

interface ChapterActionsProps {
  chapterId: string;
  onUpdate: () => void;
  isReadOnly?: boolean;
}

export function ChapterActions({ chapterId, onUpdate, isReadOnly }: ChapterActionsProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    const toastId = toast.loading("Planning scenes...");

    try {
      // 1. Plan Structure
      const planResult = await planChapterScenes(chapterId);

      if (!planResult.success || !planResult.sceneIds) {
        toast.error(planResult.error || "Failed to plan scenes", { id: toastId });
        setLoading(false);
        return;
      }

      onUpdate(); // Show empty scenes immediately

      // 2. Generate Content Sequentially
      const total = planResult.sceneIds.length;

      for (let i = 0; i < total; i++) {
        const sceneId = planResult.sceneIds[i];
        toast.loading(`Writing scene ${i + 1} of ${total}...`, { id: toastId });

        await generateSceneText(sceneId);
        onUpdate(); // Update UI as scenes fill in
      }

      toast.success("Chapter generation complete!", { id: toastId });

    } catch (e) {
      toast.error("An error occurred during generation", { id: toastId });
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  if (isReadOnly) return null;

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                 {loading ? <Loader2 className="h-3 w-3 animate-spin"/> : <Sparkles className="h-3 w-3 text-purple-500" />}
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleGenerate} disabled={loading}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Scenes (AI)
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}
