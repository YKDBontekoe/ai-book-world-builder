"use client";

import { Trigger } from "@radix-ui/react-select";
import {
	ArrowDownAZ,
	ArrowDownIcon,
	ArrowDownNarrowWide,
	ArrowUpIcon,
	ArrowUpNarrowWide,
	BrainIcon,
	ChevronDownIcon,
	ClockIcon,
	CpuIcon,
	EyeIcon,
	ListFilter,
	SearchIcon,
	SparklesIcon,
	StarIcon,
	ZapIcon,
} from "lucide-react";
import {
	memo,
	startTransition,
	useCallback,
	useEffect,
	useMemo,
	useState,
	useTransition,
} from "react";
import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import {
	getModelPreferences,
	toggleFavoriteModelAction,
	trackRecentModel,
	updateFavoriteModelsAction,
} from "@/app/actions/model-preferences";
import {
	PromptInputModelSelect,
	PromptInputModelSelectContent,
} from "@/components/elements/prompt-input";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import { cn } from "@/lib/utils";
import { getProviderGradient, ProviderIcon } from "../provider-icon";

type TabType =
	| "all"
	| "favorites"
	| "fast"
	| "vision"
	| "reasoning"
	| "free"
	| "budget"
	| "premium";
type SortOption = "relevance" | "price-asc" | "price-desc" | "name-asc";

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
	const [favoriteModels, setFavoriteModels] = useState<string[]>([]);
	const [recentModels, setRecentModels] = useState<string[]>([]);
	const [, startActionTransition] = useTransition();

	useEffect(() => {
		setOptimisticModelId(selectedModelId);
	}, [selectedModelId]);

	// Load user preferences on mount
	useEffect(() => {
		getModelPreferences().then((prefs) => {
			setFavoriteModels(prefs.favoriteModels);
			setRecentModels(prefs.recentModels);
		});
	}, []);

	const handleToggleFavorite = useCallback(
		(e: React.MouseEvent | React.PointerEvent, modelId: string) => {
			e.preventDefault();
			e.stopPropagation();

			// Optimistic update
			const isFavorite = favoriteModels.includes(modelId);
			setFavoriteModels((prev) =>
				isFavorite ? prev.filter((id) => id !== modelId) : [...prev, modelId],
			);

			startActionTransition(async () => {
				try {
					const result = await toggleFavoriteModelAction(modelId);
					setFavoriteModels(result.favoriteModels);
				} catch {
					// Revert on error
					setFavoriteModels((prev) =>
						isFavorite
							? [...prev, modelId]
							: prev.filter((id) => id !== modelId),
					);
				}
			});
		},
		[favoriteModels],
	);

	const handleMoveFavorite = useCallback(
		(
			e: React.MouseEvent | React.PointerEvent,
			modelId: string,
			direction: "up" | "down",
		) => {
			e.preventDefault();
			e.stopPropagation();

			const currentIndex = favoriteModels.indexOf(modelId);
			if (currentIndex === -1) return;

			const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
			if (newIndex < 0 || newIndex >= favoriteModels.length) return;

			const newFavorites = [...favoriteModels];
			[newFavorites[currentIndex], newFavorites[newIndex]] = [
				newFavorites[newIndex],
				newFavorites[currentIndex],
			];

			setFavoriteModels(newFavorites);

			startActionTransition(async () => {
				await updateFavoriteModelsAction(newFavorites);
			});
		},
		[favoriteModels],
	);

	// Helper to get price per million tokens
	const getPricePerMillion = useCallback((price: string | number): number => {
		const p = typeof price === "string" ? parseFloat(price) : price;
		return p < 0.01 ? p * 1_000_000 : p;
	}, []);

	// Filter, sort, and categorize models
	const { groupedByProvider } = useMemo(() => {
		let models = availableModels;

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			models = models.filter(
				(m) =>
					m.name.toLowerCase().includes(query) ||
					m.provider.toLowerCase().includes(query) ||
					m.id.toLowerCase().includes(query) ||
					m.description?.toLowerCase().includes(query),
			);
		}

		// Apply tab filter
		switch (activeTab) {
			case "favorites":
				models = models.filter((m) => favoriteModels.includes(m.id));
				break;
			case "fast":
				models = models.filter(
					(m) =>
						m.id.toLowerCase().includes("flash") ||
						m.id.toLowerCase().includes("mini") ||
						m.id.toLowerCase().includes("haiku") ||
						m.id.toLowerCase().includes("turbo"),
				);
				break;
			case "vision":
				models = models.filter((m) => m.supportsImages);
				break;
			case "reasoning":
				models = models.filter((m) => m.reasoning);
				break;
			case "free":
				models = models.filter((m) => !m.pricing || !m.pricing.input);
				break;
			case "budget":
				models = models.filter((m) => {
					if (!m.pricing?.input) return false;
					const price = getPricePerMillion(m.pricing.input);
					return price > 0 && price <= 5; // $0-$5 per million
				});
				break;
			case "premium":
				models = models.filter((m) => {
					if (!m.pricing?.input) return false;
					const price = getPricePerMillion(m.pricing.input);
					return price > 5; // $5+ per million
				});
				break;
		}

		// Apply sorting
		if (sortOption !== "relevance") {
			models = [...models].sort((a, b) => {
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
		}

		// Group by provider
		const grouped = models.reduce(
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

		return { groupedByProvider: grouped };
	}, [
		availableModels,
		searchQuery,
		activeTab,
		favoriteModels,
		getPricePerMillion,
		sortOption,
	]);

	// Get recent models that exist in available models
	const recentModelsList = useMemo(() => {
		return recentModels
			.map((id) => availableModels.find((m) => m.id === id))
			.filter((m): m is ChatModel => m !== undefined)
			.slice(0, 3);
	}, [recentModels, availableModels]);

	// Get favorite models
	const favoriteModelsList = useMemo(() => {
		return favoriteModels
			.map((id) => availableModels.find((m) => m.id === id))
			.filter((m): m is ChatModel => m !== undefined);
	}, [favoriteModels, availableModels]);

	const fallbackModel = availableModels[0];
	const selectedModel =
		availableModels.find((m) => m.id === optimisticModelId) ?? fallbackModel;

	const getModelItemValue = useCallback(
		(modelId: string, prefix: string) => `${prefix}__${modelId}`,
		[],
	);

	const parseModelItemValue = useCallback((value: string) => {
		const [prefix, ...rest] = value.split("__");
		return { prefix, modelId: rest.join("__") };
	}, []);

	// Determine the value to show in the Select trigger
	const currentSelectValue = useMemo(() => {
		if (activeTab === "all") {
			// Prioritize Favorites > Recent > All
			if (favoriteModels.includes(optimisticModelId)) {
				return getModelItemValue(optimisticModelId, "fav");
			}
			if (recentModels.includes(optimisticModelId)) {
				return getModelItemValue(optimisticModelId, "recent");
			}
			// Find provider for "All"
			const model = availableModels.find((m) => m.id === optimisticModelId);
			if (model) {
				return getModelItemValue(optimisticModelId, `all-${model.provider}`);
			}
		}
		// For other tabs (filtered lists), we might not need specific prefixes if items aren't duplicated,
		// but to be safe and consistent, we should probably use a generic prefix or the tab name.
		// However, "favorites" tab only has favorites.
		// Let's stick to the generated key prefix logic for value too.
		return getModelItemValue(optimisticModelId, "fav"); // Fallback, likely won't match if switched tabs
	}, [
		activeTab,
		favoriteModels,
		recentModels,
		optimisticModelId,
		availableModels,
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
				trackRecentModel(model.id);
			});

			// Update recent locally
			setRecentModels((prev) => {
				const filtered = prev.filter((id) => id !== model.id);
				return [model.id, ...filtered].slice(0, 5);
			});
		},
		[availableModels, onModelChange, parseModelItemValue],
	);

	const renderModelCard = (
		model: ChatModel,
		keyPrefix: string,
		showProvider = true,
	) => {
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
			>
				<div className="flex items-start gap-2.5">
					{showProvider && <ProviderIcon provider={model.provider} size="md" />}
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-1.5">
							<span className="truncate font-medium text-sm">{model.name}</span>
							{/* Capability badges */}
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
											const formatPrice = (p: string | number) => {
												const price = typeof p === "string" ? parseFloat(p) : p;
												const perMillion =
													price < 0.01 ? price * 1_000_000 : price;
												return perMillion < 0.01
													? perMillion.toFixed(4)
													: perMillion.toFixed(2);
											};
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
					{/* Favorite button */}
					<div className="flex items-center gap-1">
						{keyPrefix === "fav" && (
							<div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
								<button
									type="button"
									onPointerDown={(e) => handleMoveFavorite(e, model.id, "up")}
									className="rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30"
									disabled={favoriteModels.indexOf(model.id) === 0}
								>
									<ArrowUpIcon className="h-3 w-3" />
								</button>
								<button
									type="button"
									onPointerDown={(e) => handleMoveFavorite(e, model.id, "down")}
									className="rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30"
									disabled={
										favoriteModels.indexOf(model.id) ===
										favoriteModels.length - 1
									}
								>
									<ArrowDownIcon className="h-3 w-3" />
								</button>
							</div>
						)}
						<button
							type="button"
							onPointerDown={(e) => handleToggleFavorite(e, model.id)}
							className={cn(
								"flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all",
								"opacity-0 group-hover:opacity-100",
								isFavorite && "opacity-100",
								isFavorite
									? "bg-yellow-500/20 text-yellow-500"
									: "hover:bg-muted text-muted-foreground hover:text-foreground",
							)}
						>
							<StarIcon
								className={cn("h-3.5 w-3.5", isFavorite && "fill-current")}
							/>
						</button>
					</div>
				</div>
			</SelectItem>
		);
	};

	const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
		{ id: "all", label: "All", icon: <CpuIcon className="h-3 w-3" /> },
		{
			id: "favorites",
			label: "Favorites",
			icon: <StarIcon className="h-3 w-3" />,
		},
		{ id: "fast", label: "Fast", icon: <ZapIcon className="h-3 w-3" /> },
		{ id: "vision", label: "Vision", icon: <EyeIcon className="h-3 w-3" /> },
		{
			id: "reasoning",
			label: "Reasoning",
			icon: <BrainIcon className="h-3 w-3" />,
		},
	];

	const priceTabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
		{ id: "free", label: "Free", icon: <SparklesIcon className="h-3 w-3" /> },
		{ id: "budget", label: "Budget", icon: <CpuIcon className="h-3 w-3" /> },
		{ id: "premium", label: "Premium", icon: <StarIcon className="h-3 w-3" /> },
	];

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
					"w-[400px] overflow-hidden rounded-xl border-0 p-0",
					"bg-background/80 shadow-xl backdrop-blur-xl",
					"dark:bg-background/90",
				)}
			>
				{/* Search header */}
				<div className="sticky top-0 z-20 border-b bg-background/95 p-3 pb-2 backdrop-blur-sm">
					<div className="relative mb-2 flex items-center gap-2">
						<div className="relative flex-1">
							<SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
							<input
								className={cn(
									"w-full rounded-lg border bg-muted/50 py-2 pl-8 pr-3 text-sm outline-none",
									"placeholder:text-muted-foreground",
									"focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
								)}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search models..."
								type="text"
								value={searchQuery}
							/>
						</div>
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								const nextSort: Record<SortOption, SortOption> = {
									relevance: "price-asc",
									"price-asc": "price-desc",
									"price-desc": "name-asc",
									"name-asc": "relevance",
								};
								setSortOption(nextSort[sortOption]);
							}}
							className={cn(
								"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
								sortOption !== "relevance" &&
									"border-primary/50 bg-primary/10 text-primary",
							)}
							title={`Sort by: ${
								{
									relevance: "Relevance",
									"price-asc": "Price: Low to High",
									"price-desc": "Price: High to Low",
									"name-asc": "Name: A-Z",
								}[sortOption]
							}`}
						>
							{
								{
									relevance: <ListFilter className="h-4 w-4" />,
									"price-asc": <ArrowDownNarrowWide className="h-4 w-4" />,
									"price-desc": <ArrowUpNarrowWide className="h-4 w-4" />,
									"name-asc": <ArrowDownAZ className="h-4 w-4" />,
								}[sortOption]
							}
						</button>
					</div>
					{/* Tabs - Two rows */}
					<div className="space-y-1.5">
						<div className="flex flex-wrap gap-1">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									type="button"
									onClick={(e) => {
										e.preventDefault();
										setActiveTab(tab.id);
									}}
									className={cn(
										"flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all",
										activeTab === tab.id
											? "bg-primary text-primary-foreground"
											: "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
									)}
								>
									{tab.icon}
									{tab.label}
								</button>
							))}
						</div>
						<div className="flex gap-1">
							{priceTabs.map((tab) => (
								<button
									key={tab.id}
									type="button"
									onClick={(e) => {
										e.preventDefault();
										setActiveTab(tab.id);
									}}
									className={cn(
										"flex flex-1 items-center justify-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all",
										activeTab === tab.id
											? "bg-emerald-500 text-white dark:bg-emerald-600"
											: "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
									)}
								>
									{tab.icon}
									{tab.label}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="max-h-[400px] overflow-y-auto p-2">
					{/* Favorites section */}
					{activeTab === "all" &&
						favoriteModelsList.length > 0 &&
						!searchQuery && (
							<div className="mb-3">
								<div className="mb-1.5 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
									<StarIcon className="h-3 w-3 text-yellow-500" />
									Favorites
								</div>
								<div className="space-y-0.5">
									{favoriteModelsList.map((model) =>
										renderModelCard(model, "fav"),
									)}
								</div>
							</div>
						)}

					{/* Recent section */}
					{activeTab === "all" &&
						recentModelsList.length > 0 &&
						!searchQuery && (
							<div className="mb-3">
								<div className="mb-1.5 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
									<ClockIcon className="h-3 w-3" />
									Recent
								</div>
								<div className="space-y-0.5">
									{recentModelsList.map((model) =>
										renderModelCard(model, "recent"),
									)}
								</div>
							</div>
						)}

					{/* Grouped models */}
					{Object.keys(groupedByProvider).length > 0 ? (
						<div className="space-y-3">
							{Object.entries(groupedByProvider)
								.sort(([a], [b]) => a.localeCompare(b))
								.map(([provider, models]) => (
									<div key={provider}>
										<div className="mb-1.5 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
											<ProviderIcon provider={provider} size="sm" />
											{provider}
											<span className="ml-auto text-[9px] font-normal">
												{models.length}
											</span>
										</div>
										<div className="space-y-0.5">
											{models.map((model) =>
												renderModelCard(model, `all-${provider}`, false),
											)}
										</div>
									</div>
								))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<SparklesIcon className="mb-2 h-8 w-8 text-muted-foreground/50" />
							<p className="text-muted-foreground text-sm">No models found</p>
							<p className="text-muted-foreground/70 text-xs">
								Try adjusting your search or filters
							</p>
						</div>
					)}
				</div>

				{/* Footer */}
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
