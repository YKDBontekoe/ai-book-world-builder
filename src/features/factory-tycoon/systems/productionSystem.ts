import { BuildingEntity, Resource, SystemResult } from "../types";
import { processProducer } from "./processProducer";

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
	const _workingSpace = remainingSpace; // Unused in original code?

	for (const building of buildings) {
		processProducer(building, buildingsMap, workingInventory, result);
	}

	return result;
};
