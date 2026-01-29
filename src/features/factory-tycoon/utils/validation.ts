import { BUILDINGS } from "../config";
import type { BuildingType, GameState } from "../types";

export function canAddBuilding(
	state: GameState,
	type: BuildingType,
	x: number,
	y: number,
): boolean {
	const config = BUILDINGS[type];
	// Check cost
	if (state.cash < config.cost) return false;

	// Check collision
	if (state.buildings.some((b) => b.x === x && b.y === y)) return false;

	return true;
}
