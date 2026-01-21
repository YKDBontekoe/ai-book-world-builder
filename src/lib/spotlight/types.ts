import type React from "react";
import type {
	Entity,
	EntityAttribute,
	Relationship,
} from "@/lib/db/schema/entities";
import type { Project } from "@/lib/db/schema/projects";
import type { ChapterWithScenes } from "@/lib/types";

export type Category = "all" | "actions" | "entities" | "scenes";

export interface SpotlightItem {
	id: string;
	label: string;
	subLabel?: string;
	icon: React.ComponentType<{ className?: string }>;
	type: Category;
	category: Category;
	keywords?: string[];
	onSelect: () => void;
}

export type EntityWithDetails = Entity & {
	attributes: EntityAttribute[];
	relationships: Relationship[];
};

export interface SpotlightContext {
	project: Project;
	structure: ChapterWithScenes[] | null;
	entities: EntityWithDetails[];
	actions: {
		setChatOpen: (open: boolean) => void;
		toggleSpotlight: () => void;
		toggleZenMode: () => void;
		toggleTypewriterMode: () => void;
		setActiveSceneId: (id: string) => void;
	};
}

export interface SpotlightSource {
	getItems(context: SpotlightContext): SpotlightItem[];
}
