import {
	startTransition,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { saveChatModelAsCookie } from "../app/(chat)/actions";
import type { SortOption, TabType } from "../components/chat/multimodal-input/constants";
import type { ChatModel, ChatModelId } from "../lib/ai/models";
import { useModelPreferences } from "./use-model-preferences";

function getPricePerMillion(price: string | number): number {
	const parsedPrice = typeof price === "string" ? parseFloat(price) : price;
	return parsedPrice < 0.01 ? parsedPrice * 1_000_000 : parsedPrice;
}

export function useModelSelection({
	availableModels,
	selectedModelId,
	onModelChange,
}: {
	availableModels: ChatModel[];
	selectedModelId: ChatModelId;
	onModelChange?: (modelId: ChatModelId) => void;
}) {
	const [optimisticModelId, setOptimisticModelId] =
		useState<ChatModelId>(selectedModelId);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState<TabType>("all");
	const [sortOption, setSortOption] = useState<SortOption>("relevance");

	const {
		favoriteModels,
		recentModels,
		toggleFavorite,
		moveFavorite,
		recordRecentModel,
		error,
	} = useModelPreferences();

	useEffect(() => {
		setOptimisticModelId(selectedModelId);
	}, [selectedModelId]);

	const filteredModels = useMemo(() => {
		const matchesTab = (model: ChatModel) => {
			switch (activeTab) {
				case "favorites":
					return favoriteModels.includes(model.id);
				case "fast":
					return (
						model.id.toLowerCase().includes("flash") ||
						model.id.toLowerCase().includes("mini") ||
						model.id.toLowerCase().includes("haiku") ||
						model.id.toLowerCase().includes("turbo")
					);
				case "vision":
					return model.supportsImages;
				case "reasoning":
					return Boolean(model.reasoning);
				case "free":
					return !model.pricing || !model.pricing.input;
				case "budget":
					return model.pricing?.input
						? getPricePerMillion(model.pricing.input) > 0 &&
								getPricePerMillion(model.pricing.input) <= 5
						: false;
				case "premium":
					return model.pricing?.input
						? getPricePerMillion(model.pricing.input) > 5
						: false;
				default:
					return true;
			}
		};

		const matchesSearch = (model: ChatModel) => {
			if (!searchQuery) return true;
			const query = searchQuery.toLowerCase();
			return (
				model.name.toLowerCase().includes(query) ||
				model.provider.toLowerCase().includes(query) ||
				model.id.toLowerCase().includes(query) ||
				model.description?.toLowerCase().includes(query)
			);
		};

		const filtered = availableModels.filter(
			(model) => matchesTab(model) && matchesSearch(model),
		);

		if (sortOption === "relevance") {
			return filtered;
		}

		return [...filtered].sort((a, b) => {
			switch (sortOption) {
				case "price-asc": {
					const priceA = a.pricing?.input
						? getPricePerMillion(a.pricing.input)
						: 0;
					const priceB = b.pricing?.input
						? getPricePerMillion(b.pricing.input)
						: 0;
					return priceA - priceB;
				}
				case "price-desc": {
					const priceA = a.pricing?.input
						? getPricePerMillion(a.pricing.input)
						: 0;
					const priceB = b.pricing?.input
						? getPricePerMillion(b.pricing.input)
						: 0;
					return priceB - priceA;
				}
				case "name-asc":
					return a.name.localeCompare(b.name);
				default:
					return 0;
			}
		});
	}, [activeTab, favoriteModels, searchQuery, availableModels, sortOption]);

	const groupedByProvider = useMemo(() => {
		return filteredModels.reduce(
			(acc, model) => {
				const provider = model.provider.toLowerCase();
				if (!acc[provider]) {
					acc[provider] = [];
				}
				acc[provider].push(model);
				return acc;
			},
			{} as Record<string, ChatModel[]>,
		);
	}, [filteredModels]);

	const selectModel = useCallback(
		(modelId: string) => {
			const model = availableModels.find((m) => m.id === modelId);
			if (!model) return;

			setOptimisticModelId(model.id);
			onModelChange?.(model.id);

			startTransition(() => {
				saveChatModelAsCookie(model.id);
				recordRecentModel(model.id);
			});
		},
		[availableModels, onModelChange, recordRecentModel],
	);

	return {
		optimisticModelId,
		searchQuery,
		setSearchQuery,
		activeTab,
		setActiveTab,
		sortOption,
		setSortOption,
		filteredModels,
		groupedByProvider,
		favoriteModels,
		recentModels,
		toggleFavorite,
		moveFavorite,
		selectModel,
		error,
	};
}
