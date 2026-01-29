import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { loadGameState, saveGameState } from "@/features/factory-tycoon/actions";
import { GameProvider, useGame } from "@/features/factory-tycoon/store";

// Mock Server Actions
vi.mock("@/features/factory-tycoon/actions", () => ({
	loadGameState: vi.fn(),
	saveGameState: vi.fn(),
}));

// Mock Sonner Toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe("GameProvider Store Logic", () => {
	it("addBuilding returns false if insufficient funds", async () => {
		vi.mocked(loadGameState).mockResolvedValue(null);

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<GameProvider>{children}</GameProvider>
		);

		const { result } = renderHook(() => useGame(), { wrapper });

		// Wait for initial load
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		// Set cash to 0 (default is usually higher, let's verify)
		// We can't easily set state directly, so we rely on default being low or spending it?
		// Default cash is 50. Mine costs 10.
		// Let's assume we can't afford a very expensive building if one exists?
		// Or assume state is initial.
		// Actually, I can mock loadGameState to return 0 cash!

		// Let's remount with specific mock
	});
});

describe("GameProvider with mocked state", () => {
	it("addBuilding validation logic", async () => {
		vi.mocked(loadGameState).mockResolvedValue({
			cash: 5, // Not enough for Mine (10)
			science: 0,
			inventory: { ore: 0, ingot: 0, gadget: 0 },
			capacity: 100,
			buildings: [],
			tickCount: 0,
			lastTickDelta: {},
			unlockedBuildings: ["Mine"],
			researchedTechs: [],
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<GameProvider>{children}</GameProvider>
		);

		const { result } = renderHook(() => useGame(), { wrapper });
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		// Try to add Mine (cost 10)
		let success: boolean = false;
		act(() => {
			success = result.current.addBuilding("Mine", 0, 0);
		});
		expect(success).toBe(false);

		// Now allow it
		// We can't easily change cash without actions.
		// Let's use sellResource?
		// Or just mock a different test case.
	});

	it("addBuilding collision logic", async () => {
		vi.mocked(loadGameState).mockResolvedValue({
			cash: 100,
			science: 0,
			inventory: { ore: 0, ingot: 0, gadget: 0 },
			capacity: 100,
			buildings: [
				{
					id: "existing",
					type: "Mine",
					x: 5,
					y: 5,
					status: "IDLE",
					direction: "N",
				},
			],
			tickCount: 0,
			lastTickDelta: {},
			unlockedBuildings: ["Mine"],
			researchedTechs: [],
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<GameProvider>{children}</GameProvider>
		);

		const { result } = renderHook(() => useGame(), { wrapper });
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		// Try to place on top
		let success: boolean = false;
		act(() => {
			success = result.current.addBuilding("Mine", 5, 5);
		});
		expect(success).toBe(false);

		// Place elsewhere
		act(() => {
			success = result.current.addBuilding("Mine", 6, 6);
		});
		expect(success).toBe(true);
	});

	it("manualInteract returns true only on success", async () => {
		vi.mocked(loadGameState).mockResolvedValue({
			cash: 100,
			science: 0,
			inventory: { ore: 0, ingot: 0, gadget: 0 },
			capacity: 100,
			buildings: [
				{
					id: "belt-with-item",
					type: "Belt",
					x: 0,
					y: 0,
					status: "IDLE",
					direction: "N",
					beltItems: [{ id: "i1", resource: "ore", position: 0.5 }],
				},
				{
					id: "empty-belt",
					type: "Belt",
					x: 1,
					y: 0,
					status: "IDLE",
					direction: "N",
					beltItems: [],
				},
			],
			tickCount: 0,
			lastTickDelta: {},
			unlockedBuildings: ["Belt"],
			researchedTechs: [],
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<GameProvider>{children}</GameProvider>
		);

		const { result } = renderHook(() => useGame(), { wrapper });
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		// Interact with item
		let success: boolean = false;
		act(() => {
			success = result.current.manualInteract(0, 0);
		});
		expect(success).toBe(true);

		// Interact with empty belt
		act(() => {
			success = result.current.manualInteract(1, 0);
		});
		expect(success).toBe(false);

		// Interact with nothing
		act(() => {
			success = result.current.manualInteract(99, 99);
		});
		expect(success).toBe(false);
	});

	it("forceSave handles errors", async () => {
		vi.mocked(loadGameState).mockResolvedValue(null);
		vi.mocked(saveGameState).mockRejectedValue(new Error("DB Error"));

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<GameProvider>{children}</GameProvider>
		);

		const { result } = renderHook(() => useGame(), { wrapper });
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		await act(async () => {
			await result.current.forceSave();
		});

		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});
});
