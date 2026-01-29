import { BUILDINGS } from "../config";
import type { GameState, Resource } from "../types";

export type InteractionResult = {
	resource: Resource;
	amount: number;
} | null;

export function getInteractionResult(
	state: GameState,
	x: number,
	y: number,
): InteractionResult {
	const building = state.buildings.find((b) => b.x === x && b.y === y);
	if (!building) return null;

	const config = BUILDINGS[building.type];

	// 1. Belt Pickup (Single Item)
	if (
		building.type === "Belt" &&
		building.beltItems &&
		building.beltItems.length > 0
	) {
		const item = building.beltItems[0];
		if (item.resource !== "cash" && item.resource !== "science") {
			return { resource: item.resource, amount: 1 };
		}
	}

	// 2. Machine Output Collection (All Items)
	if (building.localInventory && config.outputs) {
		const outputRes = Object.keys(config.outputs)[0] as Resource;
		const amount = building.localInventory[outputRes] || 0;

		if (amount > 0) {
			if (outputRes !== "cash" && outputRes !== "science") {
				return { resource: outputRes, amount };
			}
		}
	}

	return null;
}

export function processInteraction(
	state: GameState,
	x: number,
	y: number,
): GameState {
	const buildingIndex = state.buildings.findIndex(
		(b) => b.x === x && b.y === y,
	);
	if (buildingIndex === -1) return state;

	const building = state.buildings[buildingIndex];
	const interaction = getInteractionResult(state, x, y);

	if (!interaction) return state;

	const { resource, amount } = interaction;

	// Apply Inventory Change
	const newInventory = { ...state.inventory };
	// Explicit cast to keyof inventory as Resource is slightly broader (includes cash/science conceptually but filtered out)
	const invKey = resource as keyof GameState["inventory"];
	newInventory[invKey] = (newInventory[invKey] || 0) + amount;

	// Apply Building Change (Remove Item)
	const newBuildings = [...state.buildings];

	if (building.type === "Belt") {
		newBuildings[buildingIndex] = {
			...building,
			beltItems: building.beltItems ? building.beltItems.slice(1) : [],
		};
	} else {
		// Machine
		newBuildings[buildingIndex] = {
			...building,
			localInventory: {
				...building.localInventory,
				[resource]: 0,
			},
		};
	}

	return {
		...state,
		inventory: newInventory,
		buildings: newBuildings,
	};
}
