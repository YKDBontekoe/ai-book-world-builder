"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Wand2, Loader2, X } from "lucide-react";
import { generateSceneContent } from "@/app/(chat)/projects/[id]/generate/actions";
import { toast } from "sonner";

interface AIWriterPanelProps {
  sceneId: string;
  projectId: string;
  onContentGenerated: (content: string) => void;
  onClose: () => void;
}

export function AIWriterPanel({
  sceneId,
  projectId,
  onContentGenerated,
  onClose,
}: AIWriterPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
        const result = await generateSceneContent(sceneId, prompt);

        if ("success" in result && result.success && result.content) {
            onContentGenerated(result.content);
            toast.success("Content generated");
        } else if ("error" in result) {
            toast.error(result.error || "Failed to generate content");
        }
    } catch (error) {
        toast.error("Failed to generate content");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <Card className="p-4 mb-4 border-primary/20 bg-primary/5">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium flex items-center gap-2 text-primary">
          <Wand2 className="h-4 w-4" />
          AI Writer
        </h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe what should happen in this scene... (e.g. 'Write a dialogue between Alice and Bob about the missing key, keep it tense')"
        className="mb-2 h-24 bg-background/50"
      />

      <div className="flex justify-end gap-2">
         <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
        >
            {isGenerating ? (
                <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Writing...
                </>
            ) : (
                "Generate Draft"
            )}
         </Button>
      </div>
    </Card>
  );
}
