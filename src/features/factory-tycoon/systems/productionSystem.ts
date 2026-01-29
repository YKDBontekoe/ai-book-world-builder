import { nanoid } from "nanoid";
import { BUILDINGS, STACK_SIZE } from "../config";
import type {
	BuildingConfig,
	BuildingEntity,
	Resource,
} from "../types";
import { getTargetCoordinates } from "../utils/grid";

export type SystemResult = {
	inventoryDelta: Partial<Record<Resource, number>>;
	cashDelta: number;
	consumedCapacity: number; // Volume added/removed
};

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

	for (const building of buildings) {
		const config = BUILDINGS[building.type];

		// Skip non-producers or Markets (handled separately)
		if (config.type === "Market" || config.type === "Warehouse") continue;
		if (!config.inputs && !config.outputs) continue;

        const targetBelt = getOutputTarget(building, config, buildingsMap);
        const outputToBelt = !!targetBelt;

        const hasInputs = checkInputAvailability(building, config, workingInventory);
        const hasSpace = checkOutputCapacity(building, config, outputToBelt);

		// Update Status
		if (!hasInputs) {
			building.status = "STARVED";
		} else if (!hasSpace) {
			building.status = "BLOCKED";
		} else {
			building.status = "RUNNING";
		}

		// Execute
		if (building.status === "RUNNING") {
            processConsumption(building, config, workingInventory, result);
            processProduction(building, config, targetBelt, result);
		}
	}

	return result;
};

// --- Helper Functions ---

function getOutputTarget(
    building: BuildingEntity,
    config: BuildingConfig,
    buildingsMap: Map<string, BuildingEntity>
): BuildingEntity | undefined {
    const outputRes = Object.keys(config.outputs || {}).find(
        (k) => k !== "cash",
    ) as Resource;

    if (outputRes) {
        const targetCoords = getTargetCoordinates(
            building.x,
            building.y,
            building.direction,
        );
        const target = buildingsMap.get(`${targetCoords.x},${targetCoords.y}`);
        if (
            target &&
            (target.type === "Belt" || target.type === "Splitter")
        ) {
            return target;
        }
    }
    return undefined;
}

function checkInputAvailability(
    building: BuildingEntity,
    config: BuildingConfig,
    workingInventory: Record<string, number>
): boolean {
    if (!config.inputs) return true;

    for (const [res, amount] of Object.entries(config.inputs)) {
        if (res !== "cash") {
            const r = res as Resource;
            const localAmount = building.localInventory?.[r] || 0;
            const neededFromGlobal = Math.max(0, amount - localAmount);

            if ((workingInventory[r] || 0) < neededFromGlobal) {
                return false;
            }
        }
    }
    return true;
}

function checkOutputCapacity(
    building: BuildingEntity,
    config: BuildingConfig,
    outputToBelt: boolean
): boolean {
    if (outputToBelt) return true; // Assume belt takes it (or pile up logic)

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
                if (current + amount > STACK_SIZE) {
                    return false;
                }
            }
        }
    }
    return true;
}

function processConsumption(
    building: BuildingEntity,
    config: BuildingConfig,
    workingInventory: Record<string, number>,
    result: SystemResult
) {
    if (!config.inputs) return;

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
            }
        }
    }
}

function processProduction(
    building: BuildingEntity,
    config: BuildingConfig,
    targetBelt: BuildingEntity | undefined,
    result: SystemResult
) {
    if (!config.outputs) return;

    for (const [res, amount] of Object.entries(config.outputs)) {
        if (res !== "cash") {
            const r = res as Resource;
            if (targetBelt) {
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
                // Produce to Local Inventory or Global (Virtual)
                if (r === "cash" || r === "science") {
                    result.inventoryDelta[r] =
                        (result.inventoryDelta[r] || 0) + amount;
                } else {
                    if (!building.localInventory) building.localInventory = {};

                    const currentAmount = building.localInventory[r] || 0;
                     building.localInventory[r] = currentAmount + amount;
                }
            }
        } else {
            result.cashDelta += amount;
        }
    }
}
