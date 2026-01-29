import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import type {
	loadGameState,
	saveGameState,
} from "@/features/factory-tycoon/actions";
import { INITIAL_STATE } from "@/features/factory-tycoon/config";
import { GameProvider, useGame } from "@/features/factory-tycoon/store";
import { GameState } from "@/features/factory-tycoon/types";

// Mock Sonner
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// Mock nanoid
vi.mock("nanoid", () => ({
	nanoid: () => "test-id",
}));

const TestComponent = () => {
	const {
		state,
		addBuilding,
		sellResource,
		manualInteract,
		forceSave,
		isRunning,
	} = useGame();

	return (
		<div>
			<div data-testid="cash">{state.cash}</div>
			<div data-testid="buildings-count">{state.buildings.length}</div>
			<div data-testid="is-running">{isRunning.toString()}</div>
			<button type="button" onClick={() => addBuilding("Mine", 0, 0)}>
				Add Mine
			</button>
			<button type="button" onClick={() => sellResource("ore")}>
				Sell Ore
			</button>
			<button type="button" onClick={() => manualInteract(0, 0)}>
				Interact
			</button>
			<button type="button" onClick={() => forceSave()}>
				Save
			</button>
		</div>
	);
};

describe("GameProvider Integration", () => {
	const mockLoad: Mock<typeof loadGameState> = vi.fn();
	const mockSave: Mock<typeof saveGameState> = vi.fn();

	beforeEach(() => {
		mockLoad.mockReset();
		mockSave.mockReset();
		mockLoad.mockResolvedValue({
			success: true,
			data: { ...INITIAL_STATE, cash: 500 },
		});
		mockSave.mockResolvedValue({ success: true, data: { success: true } });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should load game state on mount", async () => {
		render(
			<GameProvider loadGameAction={mockLoad} saveGameAction={mockSave}>
				<TestComponent />
			</GameProvider>,
		);

		expect(mockLoad).toHaveBeenCalled();

		await waitFor(() => {
			expect(screen.getByTestId("cash")).toHaveTextContent("500");
		});

		expect(screen.getByTestId("is-running")).toHaveTextContent("true");
	});

	it("should handle load error", async () => {
		mockLoad.mockResolvedValue({ success: false, error: "Failed" });

		render(
			<GameProvider loadGameAction={mockLoad} saveGameAction={mockSave}>
				<TestComponent />
			</GameProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("cash")).toHaveTextContent(
				INITIAL_STATE.cash.toString(),
			);
			expect(screen.getByTestId("is-running")).toHaveTextContent("true");
		});
	});

	it("should auto-save periodically", async () => {
		vi.useFakeTimers();
		render(
			<GameProvider loadGameAction={mockLoad} saveGameAction={mockSave}>
				<TestComponent />
			</GameProvider>,
		);

		// Wait for load (which is async promise).
		// We need to resolve promises while using fake timers.
		// Advancing timers usually helps resolve mocked timers, but for Promises we might need to wait.

		// However, since we mock load to resolve immediately, we just need to wait for the effect.
		// But since we are in fake timers, the component mount effect runs.
		// The loadGameAction is called. It returns a promise.
		// We need to wait for that promise to settle and state update.

		// We can use `waitFor` but we must advance timers if `waitFor` depends on them.
		// Or we can just wait for 'is-running' to be true?
		// But 'waitFor' might timeout if it uses setTimeout and we don't advance.

		// Let's manually advance a bit to let React flush?
		// Or just await act(async () => { ... })

		// To be safe, we can use real timers for load, then switch?
		// No, setInterval starts on mount.

		// Standard pattern:
		await act(async () => {
			await Promise.resolve(); // flush microtasks
		});

		// We might need to advance time for `waitFor` to check?
		// Let's try to just advance 10s directly.

		await act(async () => {
			vi.advanceTimersByTime(10000);
		});

		// But wait, we need to ensure isLoading became false first.
		// isLoading becomes false after loadGameAction resolves.

		// Let's verify load happened first.
		expect(mockLoad).toHaveBeenCalled();

		// If we can't reliably test async load + fake timers interval in one go without complex setup,
		// we can assume load works (tested above) and just check if save is called.
		// But save depends on isLoading being false.

		// Let's try to make sure we process pending promises.
		await act(async () => {
			await Promise.resolve();
			await Promise.resolve();
			await Promise.resolve();
		});

		// Now advance time
		await act(async () => {
			vi.advanceTimersByTime(11000);
		});

		expect(mockSave).toHaveBeenCalled();
	});

	it("should update state when action called", async () => {
		render(
			<GameProvider loadGameAction={mockLoad} saveGameAction={mockSave}>
				<TestComponent />
			</GameProvider>,
		);

		await waitFor(() =>
			expect(screen.getByTestId("is-running")).toHaveTextContent("true"),
		);

		const btn = screen.getByText("Add Mine");
		act(() => {
			btn.click();
		});

		expect(screen.getByTestId("cash")).toHaveTextContent("490");
		expect(screen.getByTestId("buildings-count")).toHaveTextContent("1");
	});
});
