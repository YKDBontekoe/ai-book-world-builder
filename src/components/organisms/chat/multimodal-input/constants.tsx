import {
	ArrowDownAZ,
	ArrowDownNarrowWide,
	ArrowUpNarrowWide,
	BrainIcon,
	CpuIcon,
	EyeIcon,
	ListFilter,
	type LucideIcon,
	SparklesIcon,
	StarIcon,
	ZapIcon,
} from "lucide-react";
import type { ReactNode } from "react";

export type TabType =
	| "all"
	| "favorites"
	| "fast"
	| "vision"
	| "reasoning"
	| "free"
	| "budget"
	| "premium";

export type SortOption = "relevance" | "price-asc" | "price-desc" | "name-asc";

export type TabDefinition = { id: TabType; label: string; icon: ReactNode };

export const MODEL_TABS: TabDefinition[] = [
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

export const PRICE_TABS: TabDefinition[] = [
	{ id: "free", label: "Free", icon: <SparklesIcon className="h-3 w-3" /> },
	{ id: "budget", label: "Budget", icon: <CpuIcon className="h-3 w-3" /> },
	{ id: "premium", label: "Premium", icon: <StarIcon className="h-3 w-3" /> },
];

export const SORT_OPTION_METADATA: Record<
	SortOption,
	{ label: string; icon: LucideIcon }
> = {
	relevance: { label: "Relevance", icon: ListFilter },
	"price-asc": { label: "Price: Low to High", icon: ArrowDownNarrowWide },
	"price-desc": { label: "Price: High to Low", icon: ArrowUpNarrowWide },
	"name-asc": { label: "Name: A-Z", icon: ArrowDownAZ },
};

export const SORT_SEQUENCE: Record<SortOption, SortOption> = {
	relevance: "price-asc",
	"price-asc": "price-desc",
	"price-desc": "name-asc",
	"name-asc": "relevance",
};
