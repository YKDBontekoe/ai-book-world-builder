import { BUILDINGS } from "../../config";
import type { BeltItem, BuildingEntity } from "../../types";

/**
 * Attempts to push an item into a target building (Belt, Splitter, or Machine).
 * Returns true if successful (item added to target).
 * Does NOT remove item from source.
 */
export function tryPushItemToTarget(
	target: BuildingEntity,
	item: BeltItem,
	allowWarehouse = false,
): boolean {
	if (target.type === "Belt" || target.type === "Splitter") {
		// Move to next belt/splitter
		if (!target.beltItems) target.beltItems = [];
		const lastItem =
			target.beltItems.length > 0
				? target.beltItems[target.beltItems.length - 1]
				: null;

		// Check entry space (must be empty or > 0.3 away)
		if (!lastItem || lastItem.position > 0.3) {
			item.position = 0;
			target.beltItems.push(item);
			return true;
		}
		return false;
	}

	// Machine / Warehouse Logic
	const config = BUILDINGS[target.type];
	const accepts =
		(allowWarehouse && target.type === "Warehouse") ||
		config.inputs?.[item.resource];

	if (accepts) {
		if (!target.localInventory) target.localInventory = {};
		target.localInventory[item.resource] =
			(target.localInventory[item.resource] || 0) + 1;
		return true;
	}

	return false;
}
