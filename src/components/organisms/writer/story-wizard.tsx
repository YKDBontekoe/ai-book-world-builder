"use client";

import { useState } from "react";
import { Loader2, Sparkles, Wand2, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Textarea } from "@/components/atoms/textarea";
import { Card } from "@/components/atoms/card";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { generateBookPlan, createBookFromPlan, type BookPlan } from "@/app/actions/story-generation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface StoryWizardProps {
  projectId: string;
  onComplete: () => void;
}

export function StoryWizard({ projectId, onComplete }: StoryWizardProps) {
  const [step, setStep] = useState<"input" | "generating" | "review" | "creating">("input");
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<BookPlan | null>(null);

  const handleGeneratePlan = async () => {
    if (!prompt.trim()) return;

    setStep("generating");
    try {
      const result = await generateBookPlan(prompt);
      if (result.success && result.plan) {
        setPlan(result.plan);
        setStep("review");
      } else {
        toast.error("Failed to generate plan. Please try again.");
        setStep("input");
      }
    } catch (error) {
      toast.error("An error occurred.");
      setStep("input");
    }
  };

  const handleCreateStory = async () => {
    if (!plan) return;

    setStep("creating");
    const toastId = toast.loading("Building your story structure...");

    try {
      const result = await createBookFromPlan(projectId, plan);
      if (result.success) {
        toast.success("Story structure created!", { id: toastId });
        // Trigger a reload or update
        onComplete();
      } else {
        toast.error("Failed to save story.", { id: toastId });
        setStep("review");
      }
    } catch (error) {
      toast.error("An error occurred.", { id: toastId });
      setStep("review");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full space-y-6 text-center"
            key="input"
          >
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Wand2 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Generate Your Story</h2>
              <p className="text-muted-foreground">
                Describe your book idea, genre, or theme. The AI will create a complete outline for you.
              </p>
            </div>

            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A cyberpunk detective story set on Mars where water is more valuable than gold..."
                className="min-h-[120px] text-lg p-4 resize-none glass-input"
              />
              <Button
                className="absolute bottom-4 right-4"
                onClick={handleGeneratePlan}
                disabled={!prompt.trim()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Plan
              </Button>
            </div>
          </motion.div>
        )}

        {step === "generating" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center justify-center space-y-4"
            key="generating"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg font-medium animate-pulse">Designing your story structure...</p>
          </motion.div>
        )}

        {step === "review" && plan && (
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="w-full flex flex-col h-[80vh]"
             key="review"
          >
             <div className="mb-6 flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-bold">{plan.title}</h2>
                   <p className="text-muted-foreground">{plan.logline}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep("input")}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                    <Button onClick={handleCreateStory}>
                        <Check className="w-4 h-4 mr-2" />
                        Create Story
                    </Button>
                </div>
             </div>

             <Card className="flex-1 overflow-hidden glass-card">
                <ScrollArea className="h-full p-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Summary</h3>
                            <p className="leading-relaxed">{plan.summary}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Chapter Outline</h3>
                            <div className="space-y-4">
                                {plan.chapters.map((chapter, i) => (
                                    <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">CH {i + 1}</span>
                                            <h4 className="font-semibold">{chapter.title}</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{chapter.summary}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
             </Card>
          </motion.div>
        )}

        {step === "creating" && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="flex flex-col items-center justify-center space-y-4"
             key="creating"
           >
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-lg font-medium">Creating chapters and scenes...</p>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
