"use client";

import { Loader2, Play } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { writingStylePresets } from "../../lib/db/schema";

type FormValues = {
    genre: string;
    tone: string;
    totalChapters: number;
    pagesPerChapter: number;
    suggestions: string;
}

interface GenerationSettingsFormProps {
  onSubmit: (values: FormValues) => void;
  isStarting: boolean;
}

export function GenerationSettingsForm({
  onSubmit,
  isStarting,
}: GenerationSettingsFormProps) {
  const [values, setValues] = useState<FormValues>({
      genre: "Fantasy",
      tone: "custom",
      totalChapters: 10,
      pagesPerChapter: 10,
      suggestions: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(values);
  };

  const updateValue = (key: keyof FormValues, value: any) => {
      setValues(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
          <form
            id="generation-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">Story Settings</h2>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                    id="genre"
                    placeholder="e.g. Cyberpunk Noir"
                    value={values.genre}
                    onChange={(e) => updateValue("genre", e.target.value)}
                    required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Writing Style / Tone</Label>
                 <Select
                      value={values.tone}
                      onValueChange={(val) => updateValue("tone", val)}
                    >
                      <SelectTrigger id="tone">
                        <SelectValue placeholder="Select a style" />
                      </SelectTrigger>
                      <SelectContent>
                        {writingStylePresets.map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            {preset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {
                        writingStylePresets.find((p) => p.id === values.tone)
                          ?.description
                      }
                    </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">Structure</h2>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Chapters</Label>
                  <span className="text-sm text-muted-foreground">
                    {values.totalChapters}
                  </span>
                </div>
                <Slider
                    min={1}
                    max={50}
                    step={1}
                    value={[values.totalChapters]}
                    onValueChange={(vals) => updateValue("totalChapters", vals[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Pages per Chapter</Label>
                  <span className="text-sm text-muted-foreground">
                    ~{values.pagesPerChapter * 250} words
                  </span>
                </div>
                <Slider
                    min={1}
                    max={30}
                    step={1}
                    value={[values.pagesPerChapter]}
                    onValueChange={(vals) => updateValue("pagesPerChapter", vals[0])}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">Guidance</h2>
              <div className="space-y-2">
                <Label htmlFor="suggestions">AI Instructions (Optional)</Label>
                <Textarea
                    id="suggestions"
                    placeholder="Describe the plot, key themes, or specific events you want to happen..."
                    className="min-h-[150px] resize-y"
                    value={values.suggestions}
                    onChange={(e) => updateValue("suggestions", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                    The AI will use this to guide the generation process.
                </p>
              </div>
            </div>
          </form>
      </div>

      <div className="p-6 bg-gradient-to-t from-background/50 to-transparent pt-0">
        <Button
          type="submit"
          form="generation-form"
          className="w-full gap-2 shadow-lg hover:shadow-primary/25 transition-all duration-300"
          size="lg"
          disabled={isStarting}
        >
          {isStarting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start Generation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
