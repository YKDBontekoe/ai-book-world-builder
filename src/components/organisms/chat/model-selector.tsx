"use client";

import { CheckCircleIcon, ChevronDownIcon } from "lucide-react";
import { startTransition, useMemo, useOptimistic, useState } from "react";
import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import { Button } from "@/components/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import { cn } from "@/lib/utils";

export function ModelSelector({
  selectedModelId,
  className,
  models,
}: {
  selectedModelId: ChatModelId;
  models: ChatModel[];
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const availableChatModels = models;

  const fallbackModel = availableChatModels[0];

  const selectedChatModel = useMemo(
    () =>
      availableChatModels.find(
        (chatModel) => chatModel.id === optimisticModelId
      ) ?? fallbackModel,
    [optimisticModelId, availableChatModels, fallbackModel]
  );

  // Define recommended models (first 3 models)
  const recommendedModelIds = useMemo(
    () => availableChatModels.slice(0, 3).map((m) => m.id),
    [availableChatModels]
  );

  const recommendedModels = useMemo(
    () => availableChatModels.filter((m) => recommendedModelIds.includes(m.id)),
    [availableChatModels, recommendedModelIds]
  );

  const otherModels = useMemo(
    () =>
      availableChatModels.filter((m) => !recommendedModelIds.includes(m.id)),
    [availableChatModels, recommendedModelIds]
  );

  const renderModelItem = (chatModel: ChatModel) => {
    const { id } = chatModel;
    const isRecommended = recommendedModelIds.includes(id);

    return (
      <DropdownMenuItem
        asChild
        data-active={id === optimisticModelId}
        data-testid={`model-selector-item-${id}`}
        key={id}
        onSelect={() => {
          setOpen(false);

          startTransition(() => {
            setOptimisticModelId(id);
            saveChatModelAsCookie(id);
          });
        }}
      >
        <button
          className="group/item flex w-full flex-row items-center justify-between gap-2"
          type="button"
        >
          <div className="flex flex-col items-start gap-1 py-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{chatModel.name}</span>
              {isRecommended && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-medium text-[10px] text-primary">
                  Popular
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>{chatModel.provider}</span>
              {chatModel.pricing && (
                <>
                  <span>•</span>
                  <span className="font-mono text-[10px] opacity-80">
                    (${chatModel.pricing.input}/{chatModel.pricing.output})
                  </span>
                </>
              )}
              <span>•</span>
              <span>{chatModel.supportsImages ? "Vision" : "Text only"}</span>
              {chatModel.reasoning && (
                <>
                  <span>•</span>
                  <span>Reasoning</span>
                </>
              )}
            </div>
          </div>

          <div className="shrink-0 text-foreground opacity-0 group-data-[active=true]/item:opacity-100 dark:text-foreground">
            <CheckCircleIcon size={16} />
          </div>
        </button>
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
      >
        <Button
          className="md:h-[34px] md:px-2"
          data-testid="model-selector"
          variant="outline"
        >
          {selectedChatModel?.name}
          <ChevronDownIcon size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[260px] max-w-[90vw] sm:min-w-[280px]"
      >
        {recommendedModels.length > 0 && (
          <>
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Recommended
            </DropdownMenuLabel>
            {recommendedModels.map(renderModelItem)}
          </>
        )}

        {otherModels.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Other Models
            </DropdownMenuLabel>
            {otherModels.map(renderModelItem)}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
