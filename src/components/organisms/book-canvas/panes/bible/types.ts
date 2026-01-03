import {
	BookOpenIcon,
	BuildingIcon,
	CalendarIcon,
	MapPinIcon,
	PackageIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import type { ElementType } from "react";

export type EntityType = "character" | "location" | "event" | "lore" | "item";

export interface Entity {
	id: string;
	name: string;
	type: EntityType;
	description?: string;
	tags?: string[];
	relationships?: EntityRelationship[];
}

export interface EntityRelationship {
	targetId: string;
	type: string;
	description?: string;
}

export const ENTITY_ICONS: Record<string, React.ElementType> = {
	character: UserIcon,
	location: MapPinIcon,
	event: CalendarIcon,
	lore: BookOpenIcon,
	item: PackageIcon,
	organization: BuildingIcon,
};

export type SerializedEntity = {
	id: string;
	name: string;
	kind: string;
	summary: string | null;
	createdAt: string;
	updatedAt: string;
	startDate: string | null;
	endDate: string | null;
	projectId: string;
};

export type EntityGroup = {
	type: string;
	label: string;
	icon: ElementType;
	color: string;
	entities: SerializedEntity[];
};

export const entityTypeConfig: Record<
	string,
	{ label: string; icon: ElementType; color: string }
> = {
	character: {
		label: "Characters",
		icon: UsersIcon,
		color: "text-[var(--entity-character)]",
	},
	location: {
		label: "Locations",
		icon: MapPinIcon,
		color: "text-[var(--entity-location)]",
	},
	item: {
		label: "Items",
		icon: PackageIcon,
		color: "text-[var(--entity-item)]",
	},
	event: {
		label: "Events",
		icon: CalendarIcon,
		color: "text-[var(--entity-event)]",
	},
	organization: {
		label: "Organizations",
		icon: BuildingIcon,
		color: "text-[var(--entity-organization)]",
	},
};
