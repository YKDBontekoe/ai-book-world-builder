import { nanoid } from "nanoid";
import { BUILDINGS } from "../config";
import type {
	BeltItem,
	BuildingEntity,
	Direction,
	GameState,
	Resource,
} from "../types";

const BELT_SPEED = 0.2; // Items move 20% of tile per tick

function getTargetCoordinates(
	x: number,
	y: number,
	dir: Direction,
): { x: number; y: number } {
	switch (dir) {
		case "N":
			return { x, y: y - 1 };
		case "S":
			return { x, y: y + 1 };
		case "E":
			return { x: x + 1, y };
		case "W":
			return { x: x - 1, y };
		default: {
            const _exhaustive: never = dir;
            console.warn(`Invalid direction encountered: ${dir}`);
			return { x, y };
        }
	}
}

export function runTransportSystem(state: GameState): GameState {
	// We need to mutate buildings (items move)
	// We'll create a new array of buildings
	const buildingsMap = new Map<string, BuildingEntity>();
	state.buildings.forEach((b) => {
		buildingsMap.set(`${b.x},${b.y}`, b);
	});

	const newBuildings = state.buildings.map((b) => {
		// Deep clone items
		if (b.type === "Belt" || b.type === "Splitter") {
			return {
				...b,
				beltItems: b.beltItems ? b.beltItems.map((i) => ({ ...i })) : [],
			};
		}
		// Clone localInventory
		if (b.localInventory) {
			return {
				...b,
				localInventory: { ...b.localInventory },
			};
		}
        // Clone holdingItem
        if (b.type === "Inserter" && b.holdingItem) {
            return {
                ...b,
                holdingItem: { ...b.holdingItem },
            };
        }

		return { ...b };
	});

	// Re-map for quick access to the *mutable* copies
	const mutableMap = new Map<string, BuildingEntity>();
	newBuildings.forEach((b) => {
		mutableMap.set(`${b.x},${b.y}`, b);
	});

	// Process Belts and Inserters
	for (const b of newBuildings) {
		if (b.type === "Belt") {
			processBelt(b, mutableMap);
		} else if (b.type === "Splitter") {
			processSplitter(b, mutableMap);
		} else if (b.type === "Inserter") {
			processInserter(b, mutableMap);
		}
	}

	return {
		...state,
		buildings: newBuildings,
	};
}

function processInserter(
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
        // Deterministic selection: Sort keys alphabetically and pick first available
        const resources = Object.keys(source.localInventory).sort() as Resource[];

        for (const res of resources) {
            if ((source.localInventory[res] || 0) > 0) {
                pickedItem = { id: nanoid(), resource: res, position: 0 };
                source.localInventory[res] = (source.localInventory[res] || 0) - 1;
                if (source.localInventory[res] === 0) delete source.localInventory[res];
                break;
            }
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

function getOppositeDir(dir: Direction): Direction {
	const map: Record<Direction, Direction> = { N: "S", S: "N", E: "W", W: "E" };
	return map[dir];
}

function processBelt(belt: BuildingEntity, map: Map<string, BuildingEntity>) {
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
				if (targetB.type === "Belt") {
					// Move to next belt
					if (!targetB.beltItems) targetB.beltItems = [];
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

function processSplitter(
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
		// Use persisted toggle state for determinism
        if (splitter.splitterToggle === undefined) splitter.splitterToggle = false;

		const tryOrder = splitter.splitterToggle ? [out1, out2] : [out2, out1];

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
                    // Flip toggle ONLY on successful transfer
                    splitter.splitterToggle = !splitter.splitterToggle;
					break;
				}
			}
			else if (target) {
				const config = BUILDINGS[target.type];
				if (config.inputs?.[item.resource]) {
					if (!target.localInventory) target.localInventory = {};
					target.localInventory[item.resource] =
						(target.localInventory[item.resource] || 0) + 1;
					splitter.beltItems.splice(i, 1);
                    splitter.splitterToggle = !splitter.splitterToggle;
					break;
				}
			}
		}
	}
}

function getLeftDir(dir: Direction): Direction {
	const map: Record<Direction, Direction> = { N: "W", W: "S", S: "E", E: "N" };
	return map[dir];
}

function getRightDir(dir: Direction): Direction {
	const map: Record<Direction, Direction> = { N: "E", E: "S", S: "W", W: "N" };
	return map[dir];
}
