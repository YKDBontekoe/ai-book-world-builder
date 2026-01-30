import { BELT_SPEED } from "../../config";
import type { BuildingEntity } from "../../types";
import { getTargetCoordinates } from "../../utils/grid";
import { tryPushItemToTarget } from "./utils";

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
		const maxPos = nextItem ? nextItem.position - 0.3 : 1.0; // 0.3 spacing

		if (item.position < maxPos) {
			item.position = Math.min(item.position + BELT_SPEED, maxPos);
		}

		// Try to move to next tile
		if (item.position >= 1.0) {
			const targetCoords = getTargetCoordinates(belt.x, belt.y, belt.direction);
			const targetB = map.get(`${targetCoords.x},${targetCoords.y}`);

			if (targetB) {
				if (tryPushItemToTarget(targetB, item, false)) {
					// Remove from belt
					belt.beltItems.splice(i, 1);
				}
			}
		}
	}
}
