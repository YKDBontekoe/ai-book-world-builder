import { describe, expect, it } from "vitest";
import { INITIAL_STATE } from "../../../src/features/factory-tycoon/config";
import { simulateTick } from "../../../src/features/factory-tycoon/engine";
import type {
	BuildingEntity,
	Direction,
	GameState,
} from "../../../src/features/factory-tycoon/types";

describe("Factory Tycoon Production System", () => {
	it("Handles invalid direction gracefully without crashing", () => {
		// Mine produces 'ore'. It checks target coords for belt.
		const mine: BuildingEntity = {
			id: "1",
			type: "Mine",
			x: 0,
			y: 0,
			status: "IDLE",
			direction: "INVALID" as unknown as Direction,
		};

		const state: GameState = {
			...INITIAL_STATE,
			buildings: [mine],
			inventory: { ...INITIAL_STATE.inventory },
		};

		// Should not throw
		const nextState = simulateTick(state);

		// It should still run (output locally)
		expect(nextState.buildings[0].status).toBe("RUNNING");

		// Check local inventory has ore
		expect(nextState.buildings[0].localInventory?.ore).toBe(1);
	});
});
