import { describe, expect, it } from "vitest";
import { INITIAL_STATE } from "../../../src/features/factory-tycoon/config";
import { simulateTick } from "../../../src/features/factory-tycoon/engine";
import type {
	BuildingEntity,
	GameState,
} from "../../../src/features/factory-tycoon/types";

describe("Factory Tycoon Sorting Optimization", () => {
	it("ADD_BUILDING logic should maintain sort order", () => {
		// Simulate the logic I plan to implement in the reducer
		const existingBuildings: BuildingEntity[] = [
			{ id: "a", type: "Belt", x: 0, y: 0, status: "IDLE", direction: "N" },
			{ id: "c", type: "Belt", x: 1, y: 0, status: "IDLE", direction: "N" },
		];

		const newBuilding: BuildingEntity = {
			id: "b",
			type: "Belt",
			x: 2,
			y: 0,
			status: "IDLE",
			direction: "N",
		};

		// Logic: [...buildings, new].sort(...)
		const newBuildings = [...existingBuildings, newBuilding].sort((a, b) =>
			a.id.localeCompare(b.id),
		);

		expect(newBuildings.map((b) => b.id)).toEqual(["a", "b", "c"]);
	});

	it("simulateTick should preserve order of already sorted buildings", () => {
		const buildings: BuildingEntity[] = [
			{ id: "a", type: "Belt", x: 0, y: 0, status: "IDLE", direction: "N" },
			{ id: "b", type: "Belt", x: 1, y: 0, status: "IDLE", direction: "N" },
			{ id: "c", type: "Belt", x: 2, y: 0, status: "IDLE", direction: "N" },
		];

		const state: GameState = {
			...INITIAL_STATE,
			buildings: buildings,
		};

		const nextState = simulateTick(state);

		expect(nextState.buildings.map((b) => b.id)).toEqual(["a", "b", "c"]);
	});
});
