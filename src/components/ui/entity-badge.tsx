import { cva, type VariantProps } from "class-variance-authority";
import {
	BookOpenIcon,
	BuildingIcon,
	CalendarIcon,
	MapPinIcon,
	PackageIcon,
	UsersIcon,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const entityBadgeVariants = cva(
	"inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
	{
		variants: {
			type: {
				character:
					"bg-[var(--entity-character-bg)] text-[var(--entity-character)]",
				location:
					"bg-[var(--entity-location-bg)] text-[var(--entity-location)]",
				item: "bg-[var(--entity-item-bg)] text-[var(--entity-item)]",
				event: "bg-[var(--entity-event-bg)] text-[var(--entity-event)]",
				organization:
					"bg-[var(--entity-organization-bg)] text-[var(--entity-organization)]",
				default: "bg-muted text-muted-foreground",
			},
		},
		defaultVariants: {
			type: "default",
		},
	},
);

const entityIcons = {
	character: UsersIcon,
	location: MapPinIcon,
	item: PackageIcon,
	event: CalendarIcon,
	organization: BuildingIcon,
	default: BookOpenIcon,
} as const;

const entityLabels = {
	character: "Character",
	location: "Location",
	item: "Item",
	event: "Event",
	organization: "Organization",
	default: "Entity",
} as const;

export type EntityType =
	| "character"
	| "location"
	| "item"
	| "event"
	| "organization"
	| "default";

export interface EntityBadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof entityBadgeVariants> {
	/** Entity type determines color and icon */
	type?: EntityType;
	/** Whether to show the icon */
	showIcon?: boolean;
}

/**
 * A badge component for entity types with consistent colors and icons.
 * Used to display entity types (character, location, item, event, organization).
 */
const EntityBadge = React.forwardRef<HTMLSpanElement, EntityBadgeProps>(
	(
		{ className, type = "default", showIcon = true, children, ...props },
		ref,
	) => {
		const Icon = entityIcons[type];
		const defaultLabel = entityLabels[type];

		return (
			<span
				ref={ref}
				className={cn(entityBadgeVariants({ type }), className)}
				{...props}
			>
				{showIcon && <Icon className="h-3 w-3" aria-hidden="true" />}
				{children ?? defaultLabel}
			</span>
		);
	},
);
EntityBadge.displayName = "EntityBadge";

export { EntityBadge, entityBadgeVariants };
