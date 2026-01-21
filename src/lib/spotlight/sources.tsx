import { BookOpen, FileText, MessageSquare, Target, User } from "lucide-react";
import type {
	SpotlightContext,
	SpotlightItem,
	SpotlightSource,
} from "@/lib/spotlight/types";

// Helper Icon
const MapPinIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
		aria-hidden="true"
		focusable="false"
	>
		<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
		<circle cx="12" cy="10" r="3" />
	</svg>
);

export class ActionSpotlightSource implements SpotlightSource {
	getItems(context: SpotlightContext): SpotlightItem[] {
		const { actions } = context;
		return [
			{
				id: "act-chat",
				label: "Ask AI Assistant",
				subLabel: "Open chat with current context",
				icon: MessageSquare,
				type: "actions",
				category: "actions",
				onSelect: () => {
					actions.setChatOpen(true);
					actions.toggleSpotlight();
				},
			},
			{
				id: "act-zen",
				label: "Toggle Zen Mode",
				subLabel: "Focus on writing",
				icon: Target,
				type: "actions",
				category: "actions",
				onSelect: () => {
					actions.toggleZenMode();
					actions.toggleSpotlight();
				},
			},
			{
				id: "act-typewriter",
				label: "Toggle Typewriter Mode",
				subLabel: "Keep cursor centered",
				icon: FileText,
				type: "actions",
				category: "actions",
				onSelect: () => {
					actions.toggleTypewriterMode();
					actions.toggleSpotlight();
				},
			},
		];
	}
}

export class EntitySpotlightSource implements SpotlightSource {
	getItems(context: SpotlightContext): SpotlightItem[] {
		const { entities, actions } = context;
		if (!entities) return [];

		return entities.map((entity) => {
			const entityType = entity.kind || "Unknown";
			const attributes = entity.attributes || [];
			return {
				id: `ent-${entity.id}`,
				label: entity.name,
				subLabel: `${entityType} • ${attributes.length} attributes`,
				icon: entityType === "Character" ? User : MapPinIcon,
				type: "entities",
				category: "entities",
				keywords: [entityType, ...attributes.map((a: any) => a.value)],
				onSelect: () => {
					actions.setChatOpen(true);
					actions.toggleSpotlight();
				},
			};
		});
	}
}

export class SceneSpotlightSource implements SpotlightSource {
	getItems(context: SpotlightContext): SpotlightItem[] {
		const { structure, actions } = context;
		if (!structure) return [];

		const items: SpotlightItem[] = [];
		for (const chapter of structure) {
			const chapterLabel = `Chapter ${chapter.title || "Untitled"}`;

			for (const scene of chapter.scenes) {
				items.push({
					id: `scn-${scene.id}`,
					label: scene.title || "Untitled Scene",
					subLabel: chapterLabel,
					icon: BookOpen,
					type: "scenes",
					category: "scenes",
					onSelect: () => {
						actions.setActiveSceneId(scene.id);
						actions.toggleSpotlight();
					},
				});
			}
		}
		return items;
	}
}
