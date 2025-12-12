"use client";

import { CheckCircle2, Info, Sparkles } from "lucide-react";
import { useId } from "react";

import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getModelBenchmark, isRecommendedFor } from "@/lib/ai/benchmark-service";
import { type ChatModel, chatModels } from "@/lib/ai/models";
import { cn } from "@/lib/utils";

interface ModelSelectionProps {
  label: string;
  task: "writing" | "reviewing";
  tooltip?: string;
  models?: ChatModel[];
  selectedModelId?: string;
  onModelChange: (modelId: string) => void;
}

function ModelCard({
  model,
  selected,
  onSelect,
  task,
}: {
  model: ChatModel;
  selected: boolean;
  onSelect: () => void;
  task: "writing" | "reviewing";
}) {
  const benchmark = getModelBenchmark(model.id);
  const isRecommended = isRecommendedFor(model.id, task);
  const score = benchmark
    ? task === "writing"
      ? benchmark.writingScore
      : benchmark.reviewingScore
    : 3;
  const costTier = benchmark?.costTier || "standard";

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary"
          : "border-border/50 bg-background/50 hover:bg-muted/50 hover:border-border",
        isRecommended && !selected && "border-amber-500/40",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          score >= 5 && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
          score === 4 && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
          score === 3 && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
          score < 3 && "bg-muted text-muted-foreground",
        )}
      >
        {score}/5
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{model.name}</span>
          {isRecommended && <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
          <span>${model.pricing?.output}/1M</span>
          <span className="opacity-40">·</span>
          <span className="capitalize">{costTier}</span>
          {benchmark?.contextWindow && (
            <>
              <span className="opacity-40">·</span>
              <span>{benchmark.contextWindow}</span>
            </>
          )}
        </div>
      </div>

      {selected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
    </button>
  );
}

export function ModelSelection({
  label,
  task,
  tooltip,
  models = chatModels,
  selectedModelId,
  onModelChange,
}: ModelSelectionProps) {
  const labelId = useId();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label htmlFor={labelId} className="text-sm font-semibold">
          {label}
        </Label>
        {tooltip ? (
          <Tooltip>
            <TooltipTrigger aria-label={`${label} info`}>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <div id={labelId} className="grid gap-2 sm:grid-cols-2">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            selected={selectedModelId === model.id}
            onSelect={() => onModelChange(model.id)}
            task={task}
          />
        ))}
      </div>
    </div>
  );
}
