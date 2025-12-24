"use client";

import { Trigger } from "@radix-ui/react-select";
import { ChevronDownIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/atoms/button";
import {
	PromptInputModelSelect,
	PromptInputModelSelectContent,
} from "@/components/molecules/prompt-input";
import { ModelList } from "@/components/organisms/chat/multimodal-input/model-list";
import { ModelListItem } from "@/components/organisms/chat/multimodal-input/model-list-item";
import { ModelSearchBar } from "@/components/organisms/chat/multimodal-input/model-search-bar";
import { ModelTabs } from "@/components/organisms/chat/multimodal-input/model-tabs";
// Use relative imports to go back to root then down
import { ProviderIcon } from "@/components/organisms/chat/provider-icon";
import { useModelSelection } from "@/hooks/use-model-selection";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import { cn } from "@/lib/utils";

// Re-implementing logic from ModelSelectorCompact but with a custom trigger for settings
function PureSettingsModelSelector({
	selectedModelId,
	onModelChange,
	availableModels,
}: {
	selectedModelId: ChatModelId | null;
	onModelChange?: (modelId: ChatModelId) => void;
	availableModels: ChatModel[];
}) {
	const {
		optimisticModelId,
		searchQuery,
		setSearchQuery,
		activeTab,
		setActiveTab,
		sortOption,
		setSortOption,
		groupedByProvider,
		favoriteModels,
		recentModels,
		toggleFavorite,
		moveFavorite,
		selectModel,
		error,
	} = useModelSelection({
		availableModels,
		selectedModelId:
			selectedModelId || availableModels[0]?.id || "gpt-3.5-turbo", // Fallback
		onModelChange,
	});

	const fallbackModel = availableModels[0];
	const selectedModel =
		availableModels.find((model) => model.id === optimisticModelId) ??
		fallbackModel;

	const getModelItemValue = useCallback(
		(modelId: string, prefix: string) => `${prefix}__${modelId}`,
		[],
	);

	const handleSelectModel = useCallback(
		(value: string) => {
			const [prefix, ...rest] = value.split("__");
			const modelId = rest.join("__");
			selectModel(modelId);
		},
		[selectModel],
	);

	const currentSelectValue = useMemo(() => {
		if (!selectedModel) return "";

		if (favoriteModels.includes(optimisticModelId)) {
			return getModelItemValue(optimisticModelId, "fav");
		}
		if (recentModels.includes(optimisticModelId)) {
			return getModelItemValue(optimisticModelId, "recent");
		}

		const provider = availableModels.find(
			(model) => model.id === optimisticModelId,
		)?.provider;
		return getModelItemValue(
			optimisticModelId,
			provider ? `all-${provider}` : "all",
		);
	}, [
		availableModels,
		favoriteModels,
		optimisticModelId,
		recentModels,
		getModelItemValue,
		selectedModel,
		optimisticModelId,
	]);

	const renderModelCard = useCallback(
		(model: ChatModel, keyPrefix: string, showProvider = true) => {
			const isFavorite = favoriteModels.includes(model.id);
			const isSelected = model.id === optimisticModelId;
			const canSort = keyPrefix === "fav";
			const isFirst = favoriteModels.indexOf(model.id) === 0;
			const isLast =
				favoriteModels.indexOf(model.id) === favoriteModels.length - 1;

			return (
				<ModelListItem
					key={`${keyPrefix}-${model.id}`}
					model={model}
					isSelected={isSelected}
					isFavorite={isFavorite}
					canSort={canSort}
					isFirst={isFirst}
					isLast={isLast}
					onMoveFavorite={(id: string, dir: "up" | "down") =>
						moveFavorite(id, dir)
					}
					onToggleFavorite={(id: string) => toggleFavorite(id)}
					value={getModelItemValue(model.id, keyPrefix)}
					showProvider={showProvider}
				/>
			);
		},
		[
			favoriteModels,
			getModelItemValue,
			moveFavorite,
			toggleFavorite,
			optimisticModelId,
		],
	);

	const favoriteModelsList = useMemo(
		() =>
			favoriteModels
				.map((id) => availableModels.find((model) => model.id === id))
				.filter((model): model is ChatModel => Boolean(model)),
		[favoriteModels, availableModels],
	);

	const recentModelsList = useMemo(
		() =>
			recentModels
				.map((id) => availableModels.find((model) => model.id === id))
				.filter((model): model is ChatModel => Boolean(model))
				.slice(0, 3),
		[recentModels, availableModels],
	);

	return (
		<PromptInputModelSelect
			onValueChange={handleSelectModel}
			value={currentSelectValue}
		>
			<Trigger asChild>
				<Button
					variant="outline"
					className="w-full justify-between h-10 px-3 font-normal bg-background"
				>
					{selectedModel ? (
						<span className="flex items-center gap-2 truncate">
							<ProviderIcon provider={selectedModel.provider} size="sm" />
							<span className="truncate">{selectedModel.name}</span>
						</span>
					) : (
						<span className="text-muted-foreground">Select a model</span>
					)}
					<ChevronDownIcon className="h-4 w-4 opacity-50" />
				</Button>
			</Trigger>
			<PromptInputModelSelectContent
				className={cn(
					"w-[400px] overflow-hidden rounded-xl border-0 p-0",
					"bg-background/95 shadow-xl backdrop-blur-xl",
					"dark:bg-background/95",
					"z-[9999]",
				)}
			>
				<div className="sticky top-0 z-20 border-b bg-background/95 p-3 pb-2 backdrop-blur-sm">
					<ModelSearchBar
						onSearchChange={setSearchQuery}
						onSortChange={setSortOption}
						searchQuery={searchQuery}
						sortOption={sortOption}
					/>
					<ModelTabs activeTab={activeTab} onTabChange={setActiveTab} />
					{error && (
						<p className="mt-2 text-xs text-destructive" role="alert">
							{error}
						</p>
					)}
				</div>

				<ModelList
					activeTab={activeTab}
					favoriteModels={favoriteModelsList}
					groupedByProvider={groupedByProvider}
					recentModels={recentModelsList}
					renderModelCard={renderModelCard}
					searchQuery={searchQuery}
				/>

				<div className="sticky bottom-0 border-t bg-muted/30 px-3 py-2 text-center">
					<span className="text-[10px] text-muted-foreground">
						{availableModels.length} models available • {favoriteModels.length}{" "}
						favorites
					</span>
				</div>
			</PromptInputModelSelectContent>
		</PromptInputModelSelect>
	);
}

export const SettingsModelSelector = memo(PureSettingsModelSelector);
