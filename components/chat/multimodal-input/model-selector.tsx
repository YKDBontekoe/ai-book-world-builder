"use client";

import { Trigger } from "@radix-ui/react-select";
import { ChevronDownIcon, CpuIcon } from "lucide-react";
import { memo, startTransition, useEffect, useMemo, useState } from "react";
import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import {
  PromptInputModelSelect,
  PromptInputModelSelectContent,
} from "@/components/elements/prompt-input";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";

function PureModelSelectorCompact({
  selectedModelId,
  onModelChange,
  availableModels,
}: {
  selectedModelId: ChatModelId;
  onModelChange?: (modelId: ChatModelId) => void;
  availableModels: ChatModel[];
}) {
  const [optimisticModelId, setOptimisticModelId] =
    useState<ChatModelId>(selectedModelId);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllModels, setShowAllModels] = useState(false);

  useEffect(() => {
    setOptimisticModelId(selectedModelId);
  }, [selectedModelId]);

  // Filter models based on search and display mode
  const displayedModels = useMemo(() => {
    let models = availableModels;

    // If not showing all models and no search, show only common/popular models
    if (!showAllModels && !searchQuery) {
      // Define patterns for common, reasonably priced models
      const isCommonModel = (model: ChatModel) => {
        const id = model.id.toLowerCase();
        const name = model.name.toLowerCase();
        const provider = model.provider.toLowerCase();

        // Popular providers and their affordable models
        const commonPatterns = [
          // OpenAI
          id.includes("gpt-4o-mini") || id.includes("gpt-3.5"),
          // Anthropic
          id.includes("claude") && id.includes("haiku"),
          // Google
          id.includes("gemini") && id.includes("flash"),
          // xAI Grok
          provider === "xai" || id.includes("grok"),
          // Meta Llama (affordable)
          (id.includes("llama") || name.includes("llama")) &&
            (id.includes("3.1") || id.includes("3.2") || id.includes("3.3")),
          // Mistral (affordable models)
          id.includes("mistral") && !id.includes("large"),
        ];

        return commonPatterns.some((pattern) => pattern);
      };

      models = availableModels.filter(isCommonModel);

      // If no common models found or too few, show first 8
      if (models.length < 3) {
        models = availableModels.slice(0, 8);
      }
    }

    // Apply search filter if query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      models = models.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.provider.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query)
      );
    }

    return models;
  }, [availableModels, showAllModels, searchQuery]);

  const fallbackModel = availableModels[0];
  const selectedModel =
    availableModels.find((m) => m.id === optimisticModelId) ?? fallbackModel;

  const hasMoreModels = availableModels.length > displayedModels.length;

  return (
    <PromptInputModelSelect
      onValueChange={(modelName) => {
        const model = availableModels.find((m) => m.name === modelName);
        if (!model) {
          return;
        }

        setOptimisticModelId(model.id);
        onModelChange?.(model.id);
        startTransition(() => {
          saveChatModelAsCookie(model.id);
        });
      }}
      value={selectedModel.name}
    >
      <Trigger asChild>
        <Button className="h-8 px-2" variant="ghost">
          <CpuIcon size={16} />
          <span className="hidden font-medium text-xs sm:block">
            {selectedModel?.name}
          </span>
          <ChevronDownIcon size={16} />
        </Button>
      </Trigger>
      <PromptInputModelSelectContent className="max-h-[400px] min-w-[280px] p-0">
        <div className="sticky top-0 z-10 border-b bg-background p-2">
          <input
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models..."
            type="text"
            value={searchQuery}
          />
        </div>
        <div className="flex max-h-[320px] flex-col gap-px overflow-y-auto p-1">
          {displayedModels.length > 0 ? (
            displayedModels.map((model) => (
              <SelectItem key={model.id} value={model.name}>
                <div className="flex items-center gap-2">
                  <div className="truncate font-medium text-xs">
                    {model.name}
                  </div>
                  {model.supportsImages && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">
                      Vision
                    </span>
                  )}
                  {model.reasoning && (
                    <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[9px] text-blue-600 dark:text-blue-400">
                      Reasoning
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {model.provider}
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-4 text-center text-muted-foreground text-xs">
              No models found
            </div>
          )}
        </div>
        {hasMoreModels && !showAllModels && !searchQuery && (
          <div className="sticky bottom-0 border-t bg-background p-2">
            <button
              className="w-full rounded-md px-2 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={(e) => {
                e.preventDefault();
                setShowAllModels(true);
              }}
              type="button"
            >
              Show all {availableModels.length} models
            </button>
          </div>
        )}
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
}

export const ModelSelectorCompact = memo(PureModelSelectorCompact);
