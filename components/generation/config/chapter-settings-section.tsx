"use client";

import { BookOpen } from "lucide-react";
import { useId } from "react";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TipCard } from "@/components/ui/tip-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type GenerationSettings } from "@/lib/db/schema";

import { type SettingsChangeHandler } from "./constants";

interface ChapterSettingsSectionProps {
  settings: Partial<GenerationSettings>;
  onSettingChange: SettingsChangeHandler;
  tip?: string;
}

export function ChapterSettingsSection({ settings, onSettingChange, tip }: ChapterSettingsSectionProps) {
  const chaptersId = useId();
  const pagesId = useId();
  const revisionsId = useId();

  return (
    <CollapsibleSection
      title="Chapter Structure"
      icon={<BookOpen className="h-5 w-5" />}
      defaultOpen
      accentColor="blue"
    >
      {tip ? <TipCard>{tip}</TipCard> : null}

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor={chaptersId}>Number of Chapters</Label>
            <span className="rounded-lg bg-primary/10 px-3 py-1 font-mono text-lg font-bold text-primary">
              {settings.totalChapters ?? 10}
            </span>
          </div>
          <Slider
            id={chaptersId}
            aria-label="Number of Chapters"
            value={[settings.totalChapters ?? 10]}
            onValueChange={([v]) => onSettingChange("totalChapters", v)}
            min={1}
            max={50}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Short Story</span>
            <span>Novel</span>
            <span>Epic</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor={pagesId}>Pages per Chapter</Label>
            <span className="rounded-lg bg-primary/10 px-3 py-1 font-mono text-lg font-bold text-primary">
              {settings.pagesPerChapter ?? 8}
            </span>
          </div>
          <Slider
            id={pagesId}
            aria-label="Pages per Chapter"
            value={[settings.pagesPerChapter ?? 8]}
            onValueChange={([v]) => onSettingChange("pagesPerChapter", v)}
            min={1}
            max={30}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            ≈ {(Number(settings.pagesPerChapter ?? 8) * 250).toLocaleString()} words per chapter
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor={revisionsId}>Revision Rounds</Label>
              <Tooltip>
                <TooltipTrigger aria-label="Revision rounds info">
                  <span className="text-muted-foreground">ℹ</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>More rounds = higher quality but higher cost</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="rounded-lg bg-primary/10 px-3 py-1 font-mono text-lg font-bold text-primary">
              {settings.revisionRounds ?? 1}
            </span>
          </div>
          <Slider
            id={revisionsId}
            aria-label="Revision Rounds"
            value={[settings.revisionRounds ?? 1]}
            onValueChange={([v]) => onSettingChange("revisionRounds", v)}
            min={1}
            max={3}
            step={1}
          />
          <p className="text-xs text-muted-foreground">Each round: Draft → Review → Revise</p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
