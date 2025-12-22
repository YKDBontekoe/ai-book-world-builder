import type { SerializedRelationship } from "@/app/actions/project-stats";
import { EntityCard } from "@/components/molecules/entity-card";
import { Badge } from "@/components/atoms/badge";
import { SectionHeader } from "@/components/molecules/section-header";
import type { EntityGroup } from "@/components/organisms/book-canvas/panes/bible/types";

interface EntityGroupSectionProps {
	group: EntityGroup;
	relationships: SerializedRelationship[];
}

export function EntityGroupSection({
	group,
	relationships,
}: EntityGroupSectionProps) {
	const Icon = group.icon;

	// Count relationships for each entity
	const getRelationshipCount = (entityId: string) => {
		return relationships.filter(
			(r) => r.sourceEntityId === entityId || r.targetEntityId === entityId,
		).length;
	};

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
			<div className="grid gap-2">
				{group.entities.map((entity) => (
					<EntityCard
						key={entity.id}
						entity={entity}
						relationshipCount={getRelationshipCount(entity.id)}
					/>
				))}
			</div>
		</div>
	);
}
