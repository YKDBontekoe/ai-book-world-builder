"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Lightbulb,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { continueWriting, generateIdeas } from "@/lib/ai/writer";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AISidebarProps {
  context: string;
  currentText: string;
  onInsertText: (text: string) => void;
}

export function AISidebar({
  context,
  currentText,
  onInsertText,
}: AISidebarProps) {
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<string | null>(null);

  const handleContinue = async () => {
    setLoading(true);
    const result = await continueWriting(context, currentText);
    setLoading(false);

    if (result.text) {
      onInsertText(result.text);
    } else {
      toast.error("Failed to generate text");
    }
  };

  const handleIdeas = async () => {
    setLoading(true);
    const result = await generateIdeas(context, currentText);
    setLoading(false);

    if (result.ideas) {
      setIdeas(result.ideas);
    } else {
      toast.error("Failed to generate ideas");
    }
  };

  return (
    <aside className="w-80 shrink-0 border-l bg-background/50 backdrop-blur-xl hidden xl:flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          AI Assistant
        </h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">
              Quick Actions
            </h3>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Continue Writing
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleIdeas}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              Generate Ideas
            </Button>
          </div>

          {/* Ideas Output */}
          {ideas && (
            <Card className="bg-muted/30">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-sm whitespace-pre-wrap">
                {ideas}
              </CardContent>
            </Card>
          )}

           {/* Tip */}
           <div className="rounded-lg bg-blue-500/10 p-3 text-xs text-blue-500">
             <strong>Tip:</strong> Highlight text in the editor to see specific rewrite options.
           </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
