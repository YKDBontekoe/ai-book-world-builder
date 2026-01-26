import { BELT_ITEM_SPACING, BELT_SPEED, BUILDINGS } from "../../config";
import type { BuildingEntity } from "../../types";
import { getTargetCoordinates } from "../../utils/grid";

export function processBelt(
	belt: BuildingEntity,
	map: Map<string, BuildingEntity>,
) {
	if (!belt.beltItems) return;

	// Move items forward
	// We iterate backwards to allow items to move into empty spaces ahead
	for (let i = belt.beltItems.length - 1; i >= 0; i--) {
		const item = belt.beltItems[i];

		// Check if blocked by item ahead
		const nextItem =
			i < belt.beltItems.length - 1 ? belt.beltItems[i + 1] : null;
		const maxPos = nextItem ? nextItem.position - BELT_ITEM_SPACING : 1.0;

		if (item.position < maxPos) {
			item.position = Math.min(item.position + BELT_SPEED, maxPos);
		}

		// Try to move to next tile
		if (item.position >= 1.0) {
			const targetCoords = getTargetCoordinates(belt.x, belt.y, belt.direction);
			const targetB = map.get(`${targetCoords.x},${targetCoords.y}`);

			if (targetB) {
				if (targetB.type === "Belt") {
					// Move to next belt
					if (!targetB.beltItems) targetB.beltItems = [];

					const lastItem =
						targetB.beltItems.length > 0
							? targetB.beltItems[targetB.beltItems.length - 1]
							: null;

					if (!lastItem || lastItem.position > BELT_ITEM_SPACING) {
						// Move it!
						item.position = 0;
						targetB.beltItems.push(item);
						belt.beltItems.splice(i, 1);
					}
				} else if (targetB.type === "Splitter") {
					if (!targetB.beltItems) targetB.beltItems = [];

					const lastItem =
						targetB.beltItems.length > 0
							? targetB.beltItems[targetB.beltItems.length - 1]
							: null;
					if (!lastItem || lastItem.position > BELT_ITEM_SPACING) {
						item.position = 0;
						targetB.beltItems.push(item);
						belt.beltItems.splice(i, 1);
					}
				} else {
					// It's a machine (Smelter, etc.)
					// Check if it accepts this resource
					const config = BUILDINGS[targetB.type];
					if (config.inputs?.[item.resource]) {
						// Put in local inventory
						if (!targetB.localInventory) targetB.localInventory = {};
						targetB.localInventory[item.resource] =
							(targetB.localInventory[item.resource] || 0) + 1;

						// Remove from belt
						belt.beltItems.splice(i, 1);
					}
				}
			}
		}
	}
}
