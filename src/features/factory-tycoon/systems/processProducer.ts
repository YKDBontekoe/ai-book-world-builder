import { nanoid } from "nanoid";
import { BUILDINGS } from "../config";
import type { BuildingEntity, Resource, SystemResult } from "../types";
import { getTargetCoordinates } from "../utils/grid";

export function processProducer(
	building: BuildingEntity,
	buildingsMap: Map<string, BuildingEntity>,
	workingInventory: Record<Exclude<Resource, "cash">, number>,
	result: SystemResult,
) {
	const config = BUILDINGS[building.type];

	// Skip non-producers or Markets (handled separately)
	if (config.type === "Market" || config.type === "Warehouse") return;
	if (!config.inputs && !config.outputs) return;

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

				if ((workingInventory[r as keyof typeof workingInventory] || 0) < neededFromGlobal) {
					hasInputs = false;
					break;
				}
			}
		}
	}

	// 2. Check Space for Outputs
	if (!outputToBelt) {
		const outputVolume = Object.entries(config.outputs || {}).reduce(
			(vol, [res, amount]) => {
				return res === "cash" || res === "science" ? vol : vol + amount;
			},
			0,
		);

		if (outputVolume > 0) {
			for (const [res, amount] of Object.entries(config.outputs || {})) {
				if (res !== "cash" && res !== "science") {
					const r = res as Resource;
					const current = building.localInventory?.[r] || 0;
					if (current + amount > 50) {
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
						const wr = r as keyof typeof workingInventory;
						workingInventory[wr] -= takeFromGlobal;
						result.inventoryDelta[r] =
							(result.inventoryDelta[r] || 0) - takeFromGlobal;
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
						if (r === "cash" || r === "science") {
							result.inventoryDelta[r] =
								(result.inventoryDelta[r] || 0) + amount;
						} else {
							if (!building.localInventory) building.localInventory = {};
							const currentAmount = building.localInventory[r] || 0;
							if (currentAmount < 50) {
								building.localInventory[r] = currentAmount + amount;
							} else {
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
