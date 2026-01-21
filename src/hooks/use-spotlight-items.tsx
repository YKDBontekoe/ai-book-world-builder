import { useEffect, useMemo, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { useWriterContext } from "@/features/writer/components/writer-context";
import { useWriterControl } from "@/features/writer/components/writer-control-context";
import { useWriterLayoutContext } from "@/features/writer/components/writer-layout-context";
import { useProjectEntities } from "@/hooks/use-project-entities";
import {
	ActionSpotlightSource,
	EntitySpotlightSource,
	SceneSpotlightSource,
} from "@/lib/spotlight/sources";
import type {
	Category,
	SpotlightContext,
	SpotlightItem,
} from "@/lib/spotlight/types";

// Re-export types for backward compatibility if needed, or consumers should update imports
export type { Category, SpotlightItem };

const SOURCES = [
	new ActionSpotlightSource(),
	new EntitySpotlightSource(),
	new SceneSpotlightSource(),
];

export interface UseSpotlightItemsReturn {
	query: string;
	setQuery: (query: string) => void;
	activeCategory: Category;
	setActiveCategory: (category: Category) => void;
	selectedIndex: number;
	setSelectedIndex: (index: number | ((prev: number) => number)) => void;
	filteredItems: SpotlightItem[];
	isSpotlightOpen: boolean;
	toggleSpotlight: () => void;
}

export function useSpotlightItems(): UseSpotlightItemsReturn {
	const { isSpotlightOpen, toggleSpotlight, setChatOpen } = useWriterControl();
	const { project, structure, setActiveSceneId } = useWriterContext();
	const { toggleZenMode, toggleTypewriterMode } = useWriterLayoutContext();
	const { data: entities } = useProjectEntities(project.id);

	const [query, setQuery] = useState("");
	const [debouncedQuery] = useDebounceValue(query, 150);
	const [activeCategory, setActiveCategory] = useState<Category>("all");
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Reset state on open
	useEffect(() => {
		if (isSpotlightOpen) {
			setQuery("");
			setSelectedIndex(0);
			setActiveCategory("all");
		}
	}, [isSpotlightOpen]);

	// Reset selection when list changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: Reset index on filter change
	useEffect(() => {
		setSelectedIndex(0);
	}, [activeCategory, debouncedQuery]);

	// Build Context
	const context: SpotlightContext = useMemo(
		() => ({
			project,
			structure,
			entities: entities || [],
			actions: {
				setChatOpen,
				toggleSpotlight,
				toggleZenMode,
				toggleTypewriterMode,
				setActiveSceneId,
			},
		}),
		[
			project,
			structure,
			entities,
			setChatOpen,
			toggleSpotlight,
			toggleZenMode,
			toggleTypewriterMode,
			setActiveSceneId,
		],
	);

	// Build Items using Strategies
	const items = useMemo<SpotlightItem[]>(() => {
		return SOURCES.flatMap((source) => source.getItems(context));
	}, [context]);

	// Filter
	const filteredItems = useMemo(() => {
		let result = items;

		if (activeCategory !== "all") {
			result = result.filter((i) => i.category === activeCategory);
		}

		if (debouncedQuery.trim()) {
			const q = debouncedQuery.toLowerCase();
			result = result.filter(
				(i) =>
					i.label.toLowerCase().includes(q) ||
					i.subLabel?.toLowerCase().includes(q) ||
					i.keywords?.some((k) => k.toLowerCase().includes(q)),
			);
		}

		return result.slice(0, 50); // Limit results
	}, [items, activeCategory, debouncedQuery]);

	return {
		query,
		setQuery,
		activeCategory,
		setActiveCategory,
		selectedIndex,
		setSelectedIndex,
		filteredItems,
		isSpotlightOpen,
		toggleSpotlight,
	};
}
