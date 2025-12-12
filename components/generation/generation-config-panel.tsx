"use client";

import {
  Brain,
  Coins,
  HelpCircle,
  Image,
  Settings,
  Zap,
} from "lucide-react";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TipCard } from "@/components/ui/tip-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type ChatModel, chatModels } from "@/lib/ai/models";
import { type GenerationSettings } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

import { ChapterSettingsSection } from "./config/chapter-settings-section";
import { additionalOptions, imageModels, type SettingsChangeHandler } from "./config/constants";
import { MetadataSection } from "./config/metadata-section";
import { ModelSelection } from "./config/model-selection";
import { WritingStyleSection } from "./config/writing-style-section";

interface GenerationConfigPanelProps {
  projectId: string;
  settings: Partial<GenerationSettings>;
  onSettingsChange?: (settings: Partial<GenerationSettings>) => void;
}

const TIPS = {
  chapters: "Start with fewer chapters for your first draft. You can always expand later!",
  models: "Use GPT-4o mini for reviewing to cut costs by ~80% without losing quality.",
  revision: "2 revision rounds catches most issues. 3 rounds for polished literary fiction.",
  style: "Custom styles work best when you describe the mood, pacing, and vocabulary level.",
};

export function GenerationConfigPanel({ settings, onSettingsChange }: GenerationConfigPanelProps) {
  const updateSetting: SettingsChangeHandler = (key, value) => {
    onSettingsChange?.({ ...settings, [key]: value });
  };

  const estimatedWords = (settings.totalChapters ?? 10) * (settings.pagesPerChapter ?? 8) * 250;
  const writerModel: ChatModel | undefined = chatModels.find((m) => m.id === settings.writerModelId);
  const reviewerModel: ChatModel | undefined = chatModels.find((m) => m.id === settings.reviewerModelId);
  const writerCost = ((estimatedWords * 1.3) / 1_000_000) * parseFloat(writerModel?.pricing?.output ?? "3");
  const reviewerCost =
    ((estimatedWords * 0.5) / 1_000_000) *
    parseFloat(reviewerModel?.pricing?.output ?? "0.6") *
    (settings.revisionRounds ?? 1);
  const totalCost = writerCost + reviewerCost;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <GlassCard padding="lg" rounded="2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Generation Settings</h2>
              <p className="text-sm text-muted-foreground">Configure AI models and book parameters</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="primary" padding="md" rounded="2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-primary" />
              <span className="font-medium">Estimated Cost</span>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Based on ~{estimatedWords.toLocaleString()} words with current model selection.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">${totalCost.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                Writer: ${writerCost.toFixed(2)} • Reviewer: ${reviewerCost.toFixed(2)}
              </p>
            </div>
          </div>
        </GlassCard>

        <CollapsibleSection
          title="AI Model Configuration"
          icon={<Brain className="h-5 w-5" />}
          defaultOpen
          accentColor="violet"
        >
          <TipCard>{TIPS.models}</TipCard>

          <ModelSelection
            label="Writer Model"
            task="writing"
            selectedModelId={settings.writerModelId}
            onModelChange={(modelId) => updateSetting("writerModelId", modelId)}
            tooltip="The main model that generates your story content."
          />

          <ModelSelection
            label="Reviewer Model"
            task="reviewing"
            selectedModelId={settings.reviewerModelId}
            onModelChange={(modelId) => updateSetting("reviewerModelId", modelId)}
            tooltip="Reviews and suggests improvements. Can be cheaper as it only analyzes."
          />

          {settings.generateFrontCover ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-pink-500" />
                <Label className="text-sm font-semibold">Image Generation</Label>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {imageModels.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    className={cn(
                      "flex flex-col gap-1 rounded-xl border p-3 text-left backdrop-blur-sm transition-all",
                      model.id === "dall-e-3"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/50 bg-background/50 hover:bg-background/80",
                    )}
                    aria-pressed={model.id === "dall-e-3"}
                  >
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                    <span className="text-xs text-primary">{model.pricing}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </CollapsibleSection>

        <ChapterSettingsSection settings={settings} onSettingChange={updateSetting} tip={TIPS.chapters} />

        <WritingStyleSection settings={settings} onSettingChange={updateSetting} tip={TIPS.style} />

        <MetadataSection settings={settings} onSettingChange={updateSetting} />

        <CollapsibleSection title="Additional Options" icon={<Zap className="h-5 w-5" />} accentColor="emerald">
          <div className="grid gap-3 sm:grid-cols-2">
            {additionalOptions.map((option) => (
              <div
                key={option.key}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-3 backdrop-blur-sm transition-all",
                  settings[option.key as keyof GenerationSettings]
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/50 bg-background/50 hover:bg-muted/30",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{option.icon}</span>
                  <div>
                    <Label className="text-sm font-medium">{option.label}</Label>
                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={Boolean(settings[option.key as keyof GenerationSettings])}
                  onCheckedChange={(checked) => updateSetting(option.key, checked)}
                />
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </div>
    </TooltipProvider>
  );
}
