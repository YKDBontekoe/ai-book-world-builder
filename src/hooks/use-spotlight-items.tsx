import { BookOpen, FileText, MessageSquare, Target, User } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useWriterControl } from "@/components/organisms/writer/writer-control-context";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { useProjectEntities } from "@/hooks/use-project-entities";

export type Category = "all" | "actions" | "entities" | "scenes";

export interface SpotlightItem {
	id: string;
	label: string;
	subLabel?: string;
	icon: React.ElementType;
	type: Category | "action";
	category: Category;
	keywords?: string[];
	onSelect: () => void;
}

export function useSpotlightItems() {
	const { isSpotlightOpen, toggleSpotlight, setChatOpen } = useWriterControl();
	const { project, structure, setActiveSceneId } = useWriterContext();
	const { toggleZenMode, toggleTypewriterMode } = useWriterLayoutContext();
	const { data: entities } = useProjectEntities(project.id);

	const [query, setQuery] = useState("");
	const [debouncedQuery] = useDebounceValue(query, 150);
	const [activeCategory, setActiveCategory] = useState<Category>("all");
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Helper for icons - Memoized to be stable for useMemo deps
	const MapPinIcon = useCallback(
		({ className }: { className?: string }) => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={className}
			>
				<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
				<circle cx="12" cy="10" r="3" />
			</svg>
		),
		[],
	);

	// Reset state on open
	useEffect(() => {
		if (isSpotlightOpen) {
			setQuery("");
			setSelectedIndex(0);
			setActiveCategory("all");
		}
	}, [isSpotlightOpen]);

	// Reset selection when list changes
	useEffect(() => {
		setSelectedIndex(0);
	}, [activeCategory, debouncedQuery]);

	// Build Items
	const items = useMemo<SpotlightItem[]>(() => {
		const list: SpotlightItem[] = [];

		// 1. Actions
		list.push(
			{
				id: "act-chat",
				label: "Ask AI Assistant",
				subLabel: "Open chat with current context",
				icon: MessageSquare,
				type: "action",
				category: "actions",
				onSelect: () => {
					setChatOpen(true);
					toggleSpotlight();
				},
			},
			{
				id: "act-zen",
				label: "Toggle Zen Mode",
				subLabel: "Focus on writing",
				icon: Target,
				type: "action",
				category: "actions",
				onSelect: () => {
					toggleZenMode();
					toggleSpotlight();
				},
			},
			{
				id: "act-typewriter",
				label: "Toggle Typewriter Mode",
				subLabel: "Keep cursor centered",
				icon: FileText,
				type: "action",
				category: "actions",
				onSelect: () => {
					toggleTypewriterMode();
					toggleSpotlight();
				},
			},
		);

		// 2. Entities
		if (entities) {
			for (const entity of entities) {
				const entityType = entity.kind || "Unknown";
				const attributes = entity.attributes || [];
				list.push({
					id: `ent-${entity.id}`,
					label: entity.name,
					subLabel: `${entityType} • ${attributes.length} attributes`,
					icon: entityType === "Character" ? User : MapPinIcon,
					type: "entities",
					category: "entities",
					keywords: [entityType, ...attributes.map((a) => a.value)],
					onSelect: () => {
						setChatOpen(true);
						toggleSpotlight();
					},
				});
			}
		}

		// 3. Scenes
		if (structure) {
			for (const chapter of structure) {
				const chapterLabel = `Chapter ${chapter.title || "Untitled"}`;

				for (const scene of chapter.scenes) {
					list.push({
						id: `scn-${scene.id}`,
						label: scene.title || "Untitled Scene",
						subLabel: chapterLabel,
						icon: BookOpen,
						type: "scenes",
						category: "scenes",
						onSelect: () => {
							setActiveSceneId(scene.id);
							toggleSpotlight();
						},
					});
				}
			}
		}

		return list;
	}, [
		entities,
		structure,
		setChatOpen,
		toggleSpotlight,
		toggleZenMode,
		toggleTypewriterMode,
		setActiveSceneId,
		MapPinIcon,
	]);

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
