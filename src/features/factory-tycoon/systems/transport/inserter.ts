import { nanoid } from "nanoid";
import { BUILDINGS } from "../../config";
import type { BeltItem, BuildingEntity, Resource } from "../../types";
import { getOppositeDir, getTargetCoordinates } from "../../utils/grid";

export function processInserter(
	inserter: BuildingEntity,
	map: Map<string, BuildingEntity>,
) {
	// Inserter Logic:
	// Source: Behind (Opposite of direction)
	// Target: Front (Direction)

	// 1. If currently holding an item, move it
	if (inserter.holdingItem) {
		inserter.holdingItem.position += 0.5; // Takes 2 ticks to swing

		if (inserter.holdingItem.position >= 1.0) {
			const targetDir = inserter.direction;
			const targetCoords = getTargetCoordinates(
				inserter.x,
				inserter.y,
				targetDir,
			);
			const target = map.get(`${targetCoords.x},${targetCoords.y}`);

			if (target) {
				let placed = false;
				if (target.type === "Belt" || target.type === "Splitter") {
					if (!target.beltItems) target.beltItems = [];
					const lastItem =
						target.beltItems.length > 0
							? target.beltItems[target.beltItems.length - 1]
							: null;
					if (!lastItem || lastItem.position > 0.3) {
						inserter.holdingItem.position = 0;
						target.beltItems.push(inserter.holdingItem);
						inserter.holdingItem = undefined;
						placed = true;
					}
				} else {
					const config = BUILDINGS[target.type];
					const accepts =
						target.type === "Warehouse" ||
						config.inputs?.[inserter.holdingItem.resource];
					if (accepts) {
						if (!target.localInventory) target.localInventory = {};
						target.localInventory[inserter.holdingItem.resource] =
							(target.localInventory[inserter.holdingItem.resource] || 0) + 1;
						inserter.holdingItem = undefined;
						placed = true;
					}
				}

				if (placed) {
					inserter.status = "RUNNING";
					return;
				}
			}
			// Blocked if cannot place
			inserter.status = "BLOCKED";
			return;
		}
		inserter.status = "RUNNING";
		return;
	}

	// 2. Try to pick up an item
	const sourceDir = getOppositeDir(inserter.direction);
	const sourceCoords = getTargetCoordinates(inserter.x, inserter.y, sourceDir);
	const source = map.get(`${sourceCoords.x},${sourceCoords.y}`);

	if (!source) {
		inserter.status = "IDLE";
		return;
	}

	let pickedItem: BeltItem | null = null;
	if (source.type === "Belt" || source.type === "Splitter") {
		if (source.beltItems && source.beltItems.length > 0) {
			const itemIndex = source.beltItems.findIndex((i) => i.position > 0.5);
			if (itemIndex >= 0) {
				pickedItem = source.beltItems[itemIndex];
				source.beltItems.splice(itemIndex, 1);
			}
		}
	} else if (source.localInventory) {
		const res = Object.keys(source.localInventory)[0] as Resource;
		if (res && (source.localInventory[res] || 0) > 0) {
			pickedItem = { id: nanoid(), resource: res, position: 0 };
			source.localInventory[res] = (source.localInventory[res] || 0) - 1;
			if (source.localInventory[res] === 0) delete source.localInventory[res];
		}
	}

	if (pickedItem) {
		pickedItem.position = 0;
		inserter.holdingItem = pickedItem;
		inserter.status = "RUNNING";
	} else {
		inserter.status = "STARVED";
	}
}
