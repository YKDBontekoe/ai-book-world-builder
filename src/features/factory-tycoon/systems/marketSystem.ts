import { BUILDINGS } from "../config";
import type { SystemResult } from "./productionSystem";

export const runMarketSystem = (
	buildings: BuildingEntity[],
	currentInventory: Record<Exclude<Resource, "cash" | "science">, number>,
): SystemResult => {
	const result: SystemResult = {
		inventoryDelta: { ore: 0, ingot: 0, gadget: 0, science: 0 },
		cashDelta: 0,
		consumedCapacity: 0,
	};

	const workingInventory = { ...currentInventory };

	for (const building of buildings) {
		if (building.type !== "Market") continue;

		const config = BUILDINGS.Market;
		let hasInputs = true;

		// Markets only consume, they don't produce items, so no space check needed usually.
		// Inputs check
		if (config.inputs) {
			for (const [res, amount] of Object.entries(config.inputs)) {
				if (res !== "cash") {
					const r = res as keyof typeof workingInventory;
					if ((workingInventory[r] || 0) < amount) {
						hasInputs = false;
						break;
					}
				}
			}
		}

		if (!hasInputs) {
			building.status = "STARVED";
		} else {
			building.status = "RUNNING";
		}

		if (building.status === "RUNNING") {
			// Consume Gadgets
			if (config.inputs) {
				for (const [res, amount] of Object.entries(config.inputs)) {
					if (res !== "cash") {
						const r = res as keyof typeof workingInventory;
						workingInventory[r] -= amount;
						result.inventoryDelta[r] = (result.inventoryDelta[r] || 0) - amount;
						// Consuming frees space effectively, but we track delta
						result.consumedCapacity -= amount;
					}
				}
			}

			// Produce Cash
			if (config.outputs?.cash) {
				result.cashDelta += config.outputs.cash;
			}
		}
	}

	return result;
};
