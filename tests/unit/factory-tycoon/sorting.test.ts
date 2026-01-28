import { describe, expect, it, vi } from "vitest";
import { INITIAL_STATE } from "../../../src/features/factory-tycoon/config";
import { simulateTick } from "../../../src/features/factory-tycoon/engine";
import { gameReducer } from "../../../src/features/factory-tycoon/store";
import type {
	BuildingEntity,
	GameState,
} from "../../../src/features/factory-tycoon/types";

vi.mock("nanoid", () => ({
	nanoid: () => "b",
}));

describe("Factory Tycoon Sorting Optimization", () => {
	it("ADD_BUILDING logic should maintain sort order", () => {
		const existingBuildings: BuildingEntity[] = [
			{ id: "a", type: "Belt", x: 0, y: 0, status: "IDLE", direction: "N" },
			{ id: "c", type: "Belt", x: 1, y: 0, status: "IDLE", direction: "N" },
		];

		const state: GameState = {
			...INITIAL_STATE,
			buildings: existingBuildings,
			cash: 1000,
		};

		const newState = gameReducer(state, {
			type: "ADD_BUILDING",
			buildingType: "Belt",
			x: 2,
			y: 0,
			direction: "N",
		});

		expect(newState.buildings.map((b) => b.id)).toEqual(["a", "b", "c"]);
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
