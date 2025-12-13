"use client";

import { Trigger } from "@radix-ui/react-select";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	BrainIcon,
	CheckCircleIcon,
	ChevronDownIcon,
	EyeIcon,
	ZapIcon,
} from "lucide-react";
import {
	memo,
	startTransition,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import {
	PromptInputModelSelect,
	PromptInputModelSelectContent,
} from "@/components/elements/prompt-input";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import { useModelPreferences } from "@/hooks/use-model-preferences";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import { cn } from "@/lib/utils";
import { getProviderGradient, ProviderIcon } from "../provider-icon";
import type { SortOption, TabType } from "./constants";
import { FavoriteToggle } from "./favorite-toggle";
import { ModelList } from "./model-list";
import { ModelSearchBar } from "./model-search-bar";
import { ModelTabs } from "./model-tabs";

function getPricePerMillion(price: string | number): number {
	const parsedPrice = typeof price === "string" ? parseFloat(price) : price;
	return parsedPrice < 0.01 ? parsedPrice * 1_000_000 : parsedPrice;
}

function formatPrice(value: string | number): string {
	const price = getPricePerMillion(value);
	return price < 0.01 ? price.toFixed(4) : price.toFixed(2);
}

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

	const fallbackModel = availableModels[0];
	const selectedModel =
		availableModels.find((model) => model.id === optimisticModelId) ??
		fallbackModel;

	const getModelItemValue = useCallback(
		(modelId: string, prefix: string) => `${prefix}__${modelId}`,
		[],
	);
	const parseModelItemValue = useCallback((value: string) => {
		const [prefix, ...rest] = value.split("__");
		return { prefix, modelId: rest.join("__") };
	}, []);

	const currentSelectValue = useMemo(() => {
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
	]);

	const handleSelectModel = useCallback(
		(value: string) => {
			const { modelId } = parseModelItemValue(value);
			const model = availableModels.find((m) => m.id === modelId);
			if (!model) return;

			setOptimisticModelId(model.id);
			onModelChange?.(model.id);

			startTransition(() => {
				saveChatModelAsCookie(model.id);
				recordRecentModel(model.id);
			});
		},
		[availableModels, onModelChange, parseModelItemValue, recordRecentModel],
	);

	const handleToggleFavorite = useCallback(
		(event: React.MouseEvent | React.PointerEvent, modelId: string) => {
			event.preventDefault();
			event.stopPropagation();
			toggleFavorite(modelId);
		},
		[toggleFavorite],
	);

	const handleMoveFavorite = useCallback(
		(
			event: React.MouseEvent | React.PointerEvent,
			modelId: string,
			direction: "up" | "down",
		) => {
			event.preventDefault();
			event.stopPropagation();
			moveFavorite(modelId, direction);
		},
		[moveFavorite],
	);

	const renderModelCard = useCallback(
		(model: ChatModel, keyPrefix: string, showProvider = true) => {
			const isFavorite = favoriteModels.includes(model.id);
			const isSelected = model.id === optimisticModelId;

			return (
				<SelectItem
					key={`${keyPrefix}-${model.id}`}
					value={getModelItemValue(model.id, keyPrefix)}
					className={cn(
						"group relative rounded-lg p-2 transition-all duration-200",
						"hover:bg-gradient-to-r",
						`hover:${getProviderGradient(model.provider)}`,
						isSelected && "bg-primary/5 ring-1 ring-primary/20",
					)}
					data-testid={`model-card-${model.id}`}
				>
					<div className="flex items-start gap-2.5">
						{showProvider && (
							<ProviderIcon provider={model.provider} size="md" />
						)}
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-1.5">
								<span className="truncate font-medium text-sm">
									{model.name}
								</span>
								<div className="flex items-center gap-1">
									{model.supportsImages && (
										<span
											className="flex h-4 w-4 items-center justify-center rounded bg-violet-500/10 text-violet-600 dark:text-violet-400"
											title="Vision capable"
										>
											<EyeIcon className="h-2.5 w-2.5" />
										</span>
									)}
									{model.reasoning && (
										<span
											className="flex h-4 w-4 items-center justify-center rounded bg-blue-500/10 text-blue-600 dark:text-blue-400"
											title="Reasoning"
										>
											<BrainIcon className="h-2.5 w-2.5" />
										</span>
									)}
									{(model.id.toLowerCase().includes("flash") ||
										model.id.toLowerCase().includes("mini")) && (
										<span
											className="flex h-4 w-4 items-center justify-center rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
											title="Fast"
										>
											<ZapIcon className="h-2.5 w-2.5" />
										</span>
									)}
								</div>
							</div>
							<div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
								<span>{model.provider}</span>
								{model.pricing?.input && (
									<>
										<span>•</span>
										<span className="text-emerald-600 dark:text-emerald-400">
											{(() => {
												const input = formatPrice(model.pricing.input);
												const output = model.pricing.output
													? formatPrice(model.pricing.output)
													: null;
												return output ? `$${input}/$${output}` : `$${input}`;
											})()}
										</span>
									</>
								)}
							</div>
						</div>
						<div className="flex items-center gap-1">
							{keyPrefix === "fav" && (
								<div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
									<button
										type="button"
										aria-label={`Move ${model.name} up in favorites`}
										onPointerDown={(event) =>
											handleMoveFavorite(event, model.id, "up")
										}
										className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
										disabled={favoriteModels.indexOf(model.id) === 0}
									>
										<ArrowUpIcon className="h-3 w-3" />
									</button>
									<button
										type="button"
										aria-label={`Move ${model.name} down in favorites`}
										onPointerDown={(event) =>
											handleMoveFavorite(event, model.id, "down")
										}
										className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
										disabled={
											favoriteModels.indexOf(model.id) ===
											favoriteModels.length - 1
										}
									>
										<ArrowDownIcon className="h-3 w-3" />
									</button>
								</div>
							)}
							<FavoriteToggle
								isFavorite={isFavorite}
								onToggle={(event) => handleToggleFavorite(event, model.id)}
								label={
									isFavorite
										? `Remove ${model.name} from favorites`
										: `Add ${model.name} to favorites`
								}
							/>
						</div>
					</div>
					<div className="absolute right-2 top-2 text-foreground opacity-0 group-data-[state=checked]/select-item:opacity-100 dark:text-foreground">
						<CheckCircleIcon size={16} />
					</div>
				</SelectItem>
			);
		},
		[
			favoriteModels,
			getModelItemValue,
			handleMoveFavorite,
			handleToggleFavorite,
			optimisticModelId,
		],
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

export const ModelSelectorCompact = memo(PureModelSelectorCompact);
