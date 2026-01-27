import { BUILDINGS, BELT_SPEED } from '../../config';
import { BuildingEntity } from '../../types';
import { getTargetCoordinates } from '../../utils/grid';

export function processBelt(belt: BuildingEntity, map: Map<string, BuildingEntity>): void {
	if (!belt.beltItems) return;

	// Move items forward
	// We iterate backwards to allow items to move into empty spaces ahead
	for (let i = belt.beltItems.length - 1; i >= 0; i--) {
		const item = belt.beltItems[i];

		// Check if blocked by item ahead
		// Simple collision: if there is an item with position > current + spacing?
		// For MVP, just let them overlap slightly or enforce hard spacing.
		// Let's enforce: cannot pass position 1.0 unless next tile takes it.
		// And cannot pass another item on same belt (simple queue).

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
				if (targetB.type === "Belt") {
					// Move to next belt
					if (!targetB.beltItems) targetB.beltItems = [];
					// Check entry space on next belt (needs to be < 0.3 or empty)
					// We assume next belt items are sorted by position (ascending? no, we didn't sort).
					// Let's assume index 0 is furthest back? No, usually index 0 is front?
					// Let's keep array sorted: index 0 is oldest (furthest along).
					// So we check the LAST item (newest/entry).
					const lastItem =
						targetB.beltItems.length > 0
							? targetB.beltItems[targetB.beltItems.length - 1]
							: null;

					if (!lastItem || lastItem.position > 0.3) {
						// Move it!
						item.position = 0;
						targetB.beltItems.push(item);
						belt.beltItems.splice(i, 1);
					}
				} else if (targetB.type === "Splitter") {
					if (!targetB.beltItems) targetB.beltItems = [];
					// Splitter logic handled in processSplitter?
					// Or just treat it like a belt for input?
					// Treat like belt for input.
					const lastItem =
						targetB.beltItems.length > 0
							? targetB.beltItems[targetB.beltItems.length - 1]
							: null;
					if (!lastItem || lastItem.position > 0.3) {
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
