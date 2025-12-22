import {
	type EntityGroup,
	type SerializedEntity,
	entityTypeConfig,
} from "@/components/book-canvas/panes/bible/types";
import { BookOpenIcon } from "lucide-react";
import { useMemo } from "react";

export function useEntityGrouping(entities: SerializedEntity[] | undefined) {
	return useMemo(() => {
		const entityGroups: EntityGroup[] = [];
		const groupedByType: Record<string, SerializedEntity[]> = {};

		if (entities) {
			for (const entity of entities) {
				const kind = entity.kind.toLowerCase();
				if (!groupedByType[kind]) {
					groupedByType[kind] = [];
				}
				groupedByType[kind].push(entity);
			}

			// Create groups in priority order
			const typeOrder = [
				"character",
				"location",
				"item",
				"event",
				"organization",
			];
			for (const type of typeOrder) {
				if (groupedByType[type] && groupedByType[type].length > 0) {
					const config = entityTypeConfig[type] || {
						label: type.charAt(0).toUpperCase() + type.slice(1) + "s",
						icon: BookOpenIcon,
						color: "text-gray-500",
					};
					entityGroups.push({
						type,
						...config,
						entities: groupedByType[type],
					});
				}
			}

			// Add any remaining types
			for (const [type, entitiesList] of Object.entries(groupedByType)) {
				if (!typeOrder.includes(type) && entitiesList.length > 0) {
					entityGroups.push({
						type,
						label: type.charAt(0).toUpperCase() + type.slice(1) + "s",
						icon: BookOpenIcon,
						color: "text-gray-500",
						entities: entitiesList,
					});
				}
			}
		}

		return entityGroups;
	}, [entities]);
}
