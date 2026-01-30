import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameCanvas } from "../../../../src/features/factory-tycoon/components/GameCanvas";

// Mock dependencies
vi.mock("@/features/factory-tycoon/store", () => ({
	useGame: vi.fn(() => ({
		state: {
			cash: 20,
			science: 0,
			inventory: {
				ore: 0,
				ingot: 0,
				gadget: 0,
			},
			capacity: 50,
			buildings: [],
			tickCount: 0,
			lastTickDelta: {
				ore: 0,
				ingot: 0,
				gadget: 0,
				science: 0,
				cash: 0,
			},
			unlockedBuildings: [
				"Mine",
				"Smelter",
				"TradingPost",
				"Warehouse",
				"Lab",
				"Belt",
				"Splitter",
				"Inserter",
			],
			researchedTechs: [],
		},
		addBuilding: vi.fn(),
		removeBuilding: vi.fn(),
		rotateBuilding: vi.fn(),
		manualInteract: vi.fn(),
	})),
}));

vi.mock("@/features/factory-tycoon/audio/SoundContext", () => ({
	useSound: vi.fn(() => ({
		playSound: vi.fn(),
	})),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: Mocking library internals
	motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
	// biome-ignore lint/suspicious/noExplicitAny: Mocking library internals
	AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
	ArrowRight: () => <div data-testid="arrow-right" />,
	Trash2: () => <div data-testid="trash-2" />,
	X: () => <div data-testid="x-icon" />,
	ArrowUpFromLine: () => <div data-testid="icon-inserter" />,
	Ban: () => <div data-testid="icon-ban" />,
	Beaker: () => <div data-testid="icon-beaker" />,
	Box: () => <div data-testid="icon-box" />,
	Factory: () => <div data-testid="icon-factory" />,
	GitFork: () => <div data-testid="icon-splitter" />,
	HandCoins: () => <div data-testid="icon-hand-coins" />,
	Hourglass: () => <div data-testid="icon-hourglass" />,
	Pickaxe: () => <div data-testid="icon-pickaxe" />,
	Store: () => <div data-testid="icon-store" />,
	Zap: () => <div data-testid="icon-zap" />,
}));

// Mock tooltip atoms
vi.mock("@/components/atoms/tooltip", () => ({
	TooltipProvider: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	TooltipContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

describe("GameCanvas", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the canvas with tiles", () => {
		render(<GameCanvas selectedBuilding={null} />);
		// Just check for some tiles
		const tiles = screen.getAllByRole("button", { name: /Tile/i });
		expect(tiles.length).toBeGreaterThan(0);
	});

	it("opens context menu on right click and shows accessible close button", () => {
		render(<GameCanvas selectedBuilding={null} />);

		// Find a tile (0,0)
		const tile = screen.getByLabelText(/Tile 0,0/i);

		// Right click (contextmenu)
		fireEvent.contextMenu(tile);

		// Check if context menu is open
		expect(screen.getByText("Options")).toBeInTheDocument();

		// Find the close button with the specific aria-label
		const closeButtons = screen.getAllByLabelText("Close context menu");
		expect(closeButtons.length).toBeGreaterThanOrEqual(1);

		// Verify specifically the button with X icon has the label
		const xIcon = screen.getByTestId("x-icon");
		const closeButton = xIcon.closest("button");
		expect(closeButton).toHaveAttribute("aria-label", "Close context menu");
	});
});
