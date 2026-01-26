import { BELT_ITEM_SPACING, BELT_SPEED, BUILDINGS } from "../../config";
import type { BuildingEntity } from "../../types";
import {
	getLeftDir,
	getRightDir,
	getTargetCoordinates,
} from "../../utils/grid";

export function processSplitter(
	splitter: BuildingEntity,
	map: Map<string, BuildingEntity>,
) {
	if (!splitter.beltItems) return;

	const leftDir = getLeftDir(splitter.direction);
	const rightDir = getRightDir(splitter.direction);

	const out1Coords = getTargetCoordinates(splitter.x, splitter.y, leftDir);
	const out2Coords = getTargetCoordinates(splitter.x, splitter.y, rightDir);

	const out1 = map.get(`${out1Coords.x},${out1Coords.y}`);
	const out2 = map.get(`${out2Coords.x},${out2Coords.y}`);

	for (let i = splitter.beltItems.length - 1; i >= 0; i--) {
		const item = splitter.beltItems[i];

		// Move item to middle
		if (item.position < 0.5) {
			item.position += BELT_SPEED;
			continue;
		}

		// Ready to split
		// Try Output 1

		// Simple toggle simulation: Check 1, then 2.
		// To prevent bias, maybe randomize order?
		const tryOrder = Math.random() > 0.5 ? [out1, out2] : [out2, out1];

		for (const target of tryOrder) {
			if (target && target.type === "Belt") {
				if (!target.beltItems) target.beltItems = [];
				const lastItem =
					target.beltItems.length > 0
						? target.beltItems[target.beltItems.length - 1]
						: null;
				if (!lastItem || lastItem.position > BELT_ITEM_SPACING) {
					item.position = 0;
					target.beltItems.push(item);
					splitter.beltItems.splice(i, 1);
					break;
				}
			}
			// Logic for feeding machines from splitter directly?
			else if (target) {
				const config = BUILDINGS[target.type];
				if (config.inputs?.[item.resource]) {
					if (!target.localInventory) target.localInventory = {};
					target.localInventory[item.resource] =
						(target.localInventory[item.resource] || 0) + 1;
					splitter.beltItems.splice(i, 1);
					break;
				}
			}
		}
	}
}
