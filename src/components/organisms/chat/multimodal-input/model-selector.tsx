"use client";

import { Trigger } from "@radix-ui/react-select";
import { ChevronDownIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import {
	PromptInputModelSelect,
	PromptInputModelSelectContent,
} from "@/components/molecules/prompt-input";
import { Button } from "@/components/atoms/button";
import { useModelSelection } from "@/hooks/use-model-selection";
import {
	type ChatModel,
	type ChatModelId,
	DEFAULT_MODELS,
} from "@/lib/ai/models";
import { cn } from "@/lib/utils";
import { ProviderIcon } from "@/components/organisms/chat/provider-icon";
import { ModelListItem } from "@/components/organisms/chat/multimodal-input/model-list-item";

function PureModelSelectorCompact({
	selectedModelId,
	onModelChange,
	availableModels,
}: {
	selectedModelId: ChatModelId;
	onModelChange?: (modelId: ChatModelId) => void;
	availableModels: ChatModel[];
}) {
	const {
		optimisticModelId,
		favoriteModels,
		toggleFavorite,
		moveFavorite,
		selectModel,
	} = useModelSelection({ availableModels, selectedModelId, onModelChange });

	const fallbackModel = availableModels[0];
	const selectedModel =
		availableModels.find((model) => model.id === optimisticModelId) ??
		fallbackModel;

	if (!selectedModel) {
		return null;
	}

	const getModelItemValue = useCallback(
		(modelId: string) => `model__${modelId}`,
		[],
	);

	const handleSelectModel = useCallback(
		(value: string) => {
			const [, ...rest] = value.split("__");
			const modelId = rest.join("__");
			selectModel(modelId);
		},
		[selectModel],
	);

	// Determine which models to show:
	// If favorites exist, show top 3 favorites.
	// Otherwise, show default Light/Middle/Large models.
	const displayModels = useMemo(() => {
		let targetIds: string[] = [];

		if (favoriteModels.length > 0) {
			targetIds = favoriteModels.slice(0, 3);
		} else {
			targetIds = Object.values(DEFAULT_MODELS);
		}

		// Filter availableModels to find the targets, preserving order of targetIds
		return targetIds
			.map((id) => availableModels.find((m) => m.id === id))
			.filter((m): m is ChatModel => !!m);
	}, [favoriteModels, availableModels]);

	const currentSelectValue = useMemo(
		() => getModelItemValue(optimisticModelId),
		[optimisticModelId, getModelItemValue],
	);

	return (
		<PromptInputModelSelect
			onValueChange={handleSelectModel}
			value={currentSelectValue}
		>
			<Trigger asChild>
				<Button className="h-8 gap-1.5 px-2" variant="ghost">
					<ProviderIcon provider={selectedModel.provider} size="sm" />
					<span className="hidden max-w-[120px] truncate font-medium text-xs sm:block">
						{selectedModel?.name}
					</span>
					<ChevronDownIcon className="h-3.5 w-3.5 text-muted-foreground" />
				</Button>
			</Trigger>
			<PromptInputModelSelectContent
				className={cn(
					"w-[85vw] md:w-[400px] overflow-hidden rounded-xl border-0 p-0",
					"bg-background/80 shadow-xl backdrop-blur-xl",
					"dark:bg-background/90",
				)}
			>
				<div className="space-y-0.5 p-2">
					{displayModels.map((model) => (
						<ModelListItem
							key={model.id}
							model={model}
							isSelected={model.id === optimisticModelId}
							isFavorite={false}
							canSort={false}
							isFirst={false}
							isLast={false}
							onMoveFavorite={(id, dir) => moveFavorite(id, dir)}
							onToggleFavorite={(id) => toggleFavorite(id)}
							value={getModelItemValue(model.id)}
							showProvider={true}
							showFavoriteToggle={false}
						/>
					))}
					{displayModels.length === 0 && (
						<div className="p-4 text-center text-muted-foreground text-sm">
							No models available.
						</div>
					)}
				</div>
			</PromptInputModelSelectContent>
		</PromptInputModelSelect>
	);
}

export const ModelSelectorCompact = memo(PureModelSelectorCompact);
