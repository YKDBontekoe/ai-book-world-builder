import { Badge } from "@/components/atoms/badge";
import { EntityCard } from "@/components/molecules/entity-card";
import { SectionHeader } from "@/components/molecules/section-header";
import type { ViewMode } from "@/components/organisms/book-canvas/panes/bible/bible-toolbar";
import type { EntityGroup } from "@/components/organisms/book-canvas/panes/bible/types";
import { cn } from "@/lib/utils";

interface EntityGroupSectionProps {
	group: EntityGroup;
	relationshipCounts: Map<string, number>;
	viewMode: ViewMode;
}

/**
 * Renders a group of entities (e.g., "Characters" or "Locations") within the Story Bible.
 *
 * @param props - The component properties.
 * @param props.group - The group of entities to display, including metadata like label and color.
 * @param props.relationshipCounts - A map of entity IDs to their relationship counts, used to display connection metrics.
 * @param props.viewMode - The current layout mode ('list' or 'grid'), affecting the grid column count.
 */
export function EntityGroupSection({
	group,
	relationshipCounts,
	viewMode,
}: EntityGroupSectionProps): React.JSX.Element {
	const Icon = group.icon;

	return (
		<div className="space-y-4">
			<SectionHeader
				title={group.label}
				icon={Icon}
				iconClassName={group.color}
				metadata={
					<Badge variant="secondary" className="px-1.5 py-0 h-5">
						{group.entities.length}
					</Badge>
				}
				className="mb-2"
			/>
			<div
				className={cn(
					"grid gap-2",
					viewMode === "grid" ? "grid-cols-2" : "grid-cols-1",
				)}
			>
				{group.entities.map((entity) => (
					<EntityCard
						key={entity.id}
						entity={entity}
						relationshipCount={relationshipCounts.get(entity.id) || 0}
						className={cn(viewMode === "grid" && "h-full")}
					/>
				))}
			</div>
		</div>
	);
}
