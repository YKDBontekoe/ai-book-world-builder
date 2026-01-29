import { BUILDINGS, BELT_SPEED } from '../../config';
import { BuildingEntity } from '../../types';
import { getTargetCoordinates, getLeftDir, getRightDir } from '../../utils/grid';

export function processSplitter(
	splitter: BuildingEntity,
	map: Map<string, BuildingEntity>,
) {
	// Splitter logic:
	// Takes items from input (handled by incoming belts pushing to it).
	// Moves items to 2 outputs (Left and Right relative to direction).
	// We need state to toggle left/right.
	// For MVP: Random or toggle based on tick?
	// We don't have persistent state in BuildingEntity for "lastOutputSide".
	// We can use random for now.

	if (!splitter.beltItems) return;

	const leftDir = getLeftDir(splitter.direction);
	const rightDir = getRightDir(splitter.direction); // Actually Splitter usually has Forward-Left and Forward-Right?
	// Or just "Front" and "Side"?
	// Factorio Splitter: 1x2 or 2x1. Takes 2 inputs, 2 outputs.
	// User asked for "Splitter".
	// Let's implement a 1x1 Splitter that takes input from *any* side (except output sides) and outputs to Left and Right.
	// Outputs: Left and Right relative to facing? Or Forward and Right?
	// Let's say: Outputs Forward and Right (T-junction). Or Left and Right (Y-junction).
	// Let's do Y-junction: Outputs Left and Right. Inputs Back.

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
				if (!lastItem || lastItem.position > 0.3) {
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
