import type {
	BuildingEntity,
	GameState,
} from "../types";
import { processBelt } from "./transport/belt";
import { processInserter } from "./transport/inserter";
import { processSplitter } from "./transport/splitter";

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
