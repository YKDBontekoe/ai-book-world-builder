import { nanoid } from "nanoid";
import { BUILDINGS, LOCAL_INVENTORY_CAPACITY } from "../config";
import type {
	BuildingEntity,
	Direction,
	Resource,
} from "../types";

export type SystemResult = {
	inventoryDelta: Partial<Record<Resource, number>>;
	cashDelta: number;
	consumedCapacity: number; // Volume added/removed
};

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
		default:
			return { x, y };
	}
}

export const runProductionSystem = (
	buildings: BuildingEntity[],
	currentInventory: Record<Exclude<Resource, "cash">, number>,
	remainingSpace: number,
): SystemResult => {
	const result: SystemResult = {
		inventoryDelta: { ore: 0, ingot: 0, gadget: 0, science: 0 },
		cashDelta: 0,
		consumedCapacity: 0,
	};

	// Build map for spatial lookups
	const buildingsMap = new Map<string, BuildingEntity>();
	buildings.forEach((b) => {
		buildingsMap.set(`${b.x},${b.y}`, b);
	});
	// Temporary inventory for this tick's calculations
	const workingInventory = { ...currentInventory };
	// const _workingSpace = remainingSpace; // Unused

	for (const building of buildings) {
		const config = BUILDINGS[building.type];

		// Skip non-producers or Markets (handled separately)
		if (config.type === "Market" || config.type === "Warehouse") continue;
		// Check for empty objects instead of undefined
		if (Object.keys(config.inputs).length === 0 && Object.keys(config.outputs).length === 0) continue;

		let hasInputs = true;
		let hasSpace = true;
		let outputToBelt = false;
		let targetBelt: BuildingEntity | undefined;

		// 0. Pre-calculation: Check Output Destination
		// Only check for the first non-cash output
		const outputRes = Object.keys(config.outputs || {}).find(
			(k) => k !== "cash",
		) as Resource;
		if (outputRes) {
			const targetCoords = getTargetCoordinates(
				building.x,
				building.y,
				building.direction,
			);
			targetBelt = buildingsMap.get(`${targetCoords.x},${targetCoords.y}`);
			if (
				targetBelt &&
				(targetBelt.type === "Belt" || targetBelt.type === "Splitter")
			) {
				outputToBelt = true;
			}
		}

		// 1. Check Inputs (Hybrid: Local -> Global)
		if (config.inputs) {
			for (const [res, amount] of Object.entries(config.inputs)) {
				if (res !== "cash") {
					const r = res as Resource;
					const localAmount = building.localInventory?.[r] || 0;
					const neededFromGlobal = Math.max(0, amount - localAmount);

					if ((workingInventory[r] || 0) < neededFromGlobal) {
						hasInputs = false;
						break;
					}
				}
			}
		}

		// 2. Check Space for Outputs (Pre-check)
		// If outputting to belt, we assume infinite space (it will just pile up or we can check belt fullness)
		// For MVP, if outputToBelt is true, hasSpace = true.
		if (!outputToBelt) {
			const outputVolume = Object.entries(config.outputs || {}).reduce(
				(vol, [res, amount]) => {
					return res === "cash" || res === "science" ? vol : vol + amount;
				},
				0,
			);

			if (outputVolume > 0) {
				// Check local inventory space instead of global 'workingSpace'
				// We only check if the specific output resource slots are full
				for (const [res, amount] of Object.entries(config.outputs || {})) {
					if (res !== "cash" && res !== "science") {
						const r = res as Resource;
						const current = building.localInventory?.[r] || 0;
						if (current + amount > LOCAL_INVENTORY_CAPACITY) {
							hasSpace = false;
							break;
						}
					}
				}
			}
		}

		// 3. Update Status
		if (!hasInputs) {
			building.status = "STARVED";
		} else if (!hasSpace) {
			building.status = "BLOCKED";
		} else {
			building.status = "RUNNING";
		}

		// 4. Execute
		if (building.status === "RUNNING") {
			// Consume
			if (config.inputs) {
				for (const [res, amount] of Object.entries(config.inputs)) {
					if (res !== "cash") {
						const r = res as Resource;
						const localAmount = building.localInventory?.[r] || 0;
						const takeFromLocal = Math.min(localAmount, amount);
						const takeFromGlobal = amount - takeFromLocal;

						if (takeFromLocal > 0) {
							if (!building.localInventory) building.localInventory = {};
							building.localInventory[r] =
								(building.localInventory[r] || 0) - takeFromLocal;
						}

						if (takeFromGlobal > 0) {
							workingInventory[r] -= takeFromGlobal;
							result.inventoryDelta[r] =
								(result.inventoryDelta[r] || 0) - takeFromGlobal;
							// Consumption from global doesn't free space in this phase
						}
					}
				}
			}

			// Produce
			if (config.outputs) {
				for (const [res, amount] of Object.entries(config.outputs)) {
					if (res !== "cash") {
						const r = res as Resource;
						if (outputToBelt && targetBelt) {
							// Produce to Belt
							if (!targetBelt.beltItems) targetBelt.beltItems = [];
							for (let i = 0; i < amount; i++) {
								targetBelt.beltItems.push({
									id: nanoid(),
									resource: r,
									position: 0,
								});
							}
						} else {
							// Produce to Local Inventory (Buffer) instead of Global
							// This allows Inserters to pick it up.
							// Only 'cash' and 'science' go global immediately (virtual resources)
							if (r === "cash" || r === "science") {
								result.inventoryDelta[r] =
									(result.inventoryDelta[r] || 0) + amount;
								// Science doesn't consume capacity? Let's say it doesn't.
							} else {
								if (!building.localInventory) building.localInventory = {};

								// Check local capacity (already checked in step 2, but safe to clamp)
								const currentAmount = building.localInventory[r] || 0;
								if (currentAmount < LOCAL_INVENTORY_CAPACITY) {
									building.localInventory[r] = currentAmount + amount;
								} else {
									// Should not happen if step 2 works
									building.status = "BLOCKED";
								}
							}
						}
					} else {
						result.cashDelta += amount;
					}
				}
			}
		}
	}

	return result;
};
