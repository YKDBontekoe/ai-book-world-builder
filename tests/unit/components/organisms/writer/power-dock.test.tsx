import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HistoryItem } from "@/components/organisms/writer/power-dock";
import { PowerDock } from "@/components/organisms/writer/power-dock";

// Hoist mock functions
const {
	mockExecute,
	getMockLocalStorage,
	resetMockLocalStorage,
} = vi.hoisted(() => {
	let store: HistoryItem[] = [];
	return {
		mockExecute: vi.fn(),
		getMockLocalStorage: () => [
			store,
			(value: HistoryItem[] | ((prev: HistoryItem[]) => HistoryItem[])) => {
				if (typeof value === "function") {
					store = value(store);
				} else {
					store = value;
				}
			},
		],
		resetMockLocalStorage: () => {
			store = [];
		},
	};
});

// Mock dependencies
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		loading: vi.fn(),
		dismiss: vi.fn(),
	},
}));

vi.mock("usehooks-ts", () => ({
	useLocalStorage: vi.fn(() => getMockLocalStorage()),
}));

// Mock UI components
vi.mock("@/components/atoms/textarea", () => ({
	Textarea: (props: React.ComponentProps<"textarea">) => (
		<textarea {...props} />
	),
}));

vi.mock("@/components/molecules/glass-card", () => ({
	GlassCard: ({
		children,
		className,
	}: {
		children: React.ReactNode;
		className?: string;
	}) => <div className={className}>{children}</div>,
}));

vi.mock("@/components/atoms/tooltip", () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	TooltipContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	TooltipProvider: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

vi.mock("@/components/atoms/separator", () => ({
	Separator: () => <div data-testid="separator" />,
}));

vi.mock("@/components/atoms/dropdown-menu", () => ({
	DropdownMenu: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dropdown-menu">{children}</div>
	),
	DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dropdown-content">{children}</div>
	),
	DropdownMenuItem: ({
		children,
		onClick,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
	}) => (
		<div
			role="menuitem"
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					onClick?.();
				}
			}}
			tabIndex={0}
			data-testid="history-item"
		>
			{children}
		</div>
	),
	DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuSeparator: () => <div />,
}));

// Mock contexts
const mockWriterControl = {
	editorActions: {
		undo: vi.fn(),
		redo: vi.fn(),
		insertText: vi.fn(),
		getSelection: vi.fn(),
	},
	toggleChat: vi.fn(),
	isChatOpen: false,
	toggleSpotlight: vi.fn(),
	isSpotlightOpen: false,
};

const mockWriterContext = {
	project: { id: "p1" },
	structure: [],
	activeChapterId: "c1",
	activeSceneId: "s1",
};

const mockWriterLayoutContext = {
	viewMode: "standard",
};

vi.mock("@/components/organisms/writer/writer-control-context", () => ({
	useWriterControl: () => mockWriterControl,
}));

vi.mock("@/components/organisms/writer/writer-context", () => ({
	useWriterContext: () => mockWriterContext,
}));

vi.mock("@/components/organisms/writer/writer-layout-context", () => ({
	useWriterLayoutContext: () => mockWriterLayoutContext,
}));

// Mock tool strategies
vi.mock("@/components/organisms/writer/tools/tool-strategies", () => ({
	toolStrategies: {
		write: { execute: mockExecute },
		rewrite: { execute: mockExecute },
		expand: { execute: mockExecute },
		critique: { execute: mockExecute },
		consistency: { execute: mockExecute },
		lore: { execute: mockExecute },
		search: { execute: mockExecute },
	},
}));

describe("PowerDock", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetMockLocalStorage();
		mockExecute.mockResolvedValue({ success: true, result: "Result text" });
	});

	it("renders correctly in default mode", () => {
		render(<PowerDock />);
		expect(screen.getByLabelText("Spotlight")).toBeInTheDocument();
		expect(screen.getByLabelText("AI Tools")).toBeInTheDocument();
	});

	it("switches to tools mode", () => {
		render(<PowerDock />);
		const toolsButton = screen.getByLabelText("AI Tools");
		fireEvent.click(toolsButton);
		expect(screen.getByLabelText("Batch Write")).toBeInTheDocument();
	});

	it("selects a tool and enters input mode", () => {
		render(<PowerDock />);
		fireEvent.click(screen.getByLabelText("AI Tools"));
		fireEvent.click(screen.getByLabelText("Batch Write"));
		expect(
			screen.getByPlaceholderText("Instructions (e.g., 'Make it tense')"),
		).toBeInTheDocument();
	});

	it("saves command to history on success", async () => {
		render(<PowerDock />);
		fireEvent.click(screen.getByLabelText("AI Tools"));
		fireEvent.click(screen.getByLabelText("Batch Write"));
		const input = screen.getByPlaceholderText(
			"Instructions (e.g., 'Make it tense')",
		);
		fireEvent.change(input, { target: { value: "Test command" } });
		fireEvent.keyDown(input, { key: "Enter" });

		await waitFor(() => {
			expect(mockExecute).toHaveBeenCalledWith(
				expect.anything(),
				"Test command",
			);
		});
		fireEvent.click(screen.getByLabelText("Command history"));
		const historyItems = screen.getAllByTestId("history-item");
		expect(historyItems).toHaveLength(1);
		expect(historyItems[0]).toHaveTextContent("Test command");
	});

	it("limits history to 20 items", async () => {
		render(<PowerDock />);
		fireEvent.click(screen.getByLabelText("AI Tools"));
		fireEvent.click(screen.getByLabelText("Batch Write"));
		const input = screen.getByPlaceholderText(
			"Instructions (e.g., 'Make it tense')",
		);

		for (let i = 0; i < 25; i++) {
			fireEvent.change(input, { target: { value: `Command ${i}` } });
			fireEvent.keyDown(input, { key: "Enter" });
			await waitFor(() =>
				expect(mockExecute).toHaveBeenCalledWith(
					expect.anything(),
					`Command ${i}`,
				),
			);
		}

		fireEvent.click(screen.getByLabelText("Command history"));
		const historyItems = screen.getAllByTestId("history-item");
		expect(historyItems).toHaveLength(20);
		expect(historyItems[0]).toHaveTextContent("Command 24");
	});

	it("deduplicates identical recent commands", async () => {
		render(<PowerDock />);
		fireEvent.click(screen.getByLabelText("AI Tools"));
		fireEvent.click(screen.getByLabelText("Batch Write"));
		const input = screen.getByPlaceholderText(
			"Instructions (e.g., 'Make it tense')",
		);
		fireEvent.change(input, { target: { value: "Same command" } });
		fireEvent.keyDown(input, { key: "Enter" });
		await waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(1));

		fireEvent.change(input, { target: { value: "Same command" } });
		fireEvent.keyDown(input, { key: "Enter" });
		await waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(2));

		fireEvent.click(screen.getByLabelText("Command history"));
		const historyItems = screen.getAllByTestId("history-item");
		expect(historyItems).toHaveLength(1);
	});

	it("clears history for a specific tool", async () => {
		render(<PowerDock />);
		fireEvent.click(screen.getByLabelText("AI Tools"));
		fireEvent.click(screen.getByLabelText("Batch Write"));
		const input = screen.getByPlaceholderText(
			"Instructions (e.g., 'Make it tense')",
		);
		fireEvent.change(input, { target: { value: "A command" } });
		fireEvent.keyDown(input, { key: "Enter" });
		await waitFor(() => expect(mockExecute).toHaveBeenCalled());

		fireEvent.click(screen.getByLabelText("Command history"));
		expect(screen.getAllByTestId("history-item")).toHaveLength(1);

		fireEvent.click(screen.getByLabelText("Clear history for this tool"));

		// Force re-render by typing in input, since mock doesn't trigger it
		fireEvent.change(input, { target: { value: " " } });

		await waitFor(() => {
			expect(screen.queryByTestId("history-item")).not.toBeInTheDocument();
		});
		expect(screen.getByText("No recent history")).toBeInTheDocument();
	});

	it("isolates history between tools", async () => {
		render(<PowerDock />);

		// Add command to "Batch Write"
		fireEvent.click(screen.getByLabelText("AI Tools"));
		fireEvent.click(screen.getByLabelText("Batch Write"));
		const input = screen.getByPlaceholderText(
			"Instructions (e.g., 'Make it tense')",
		);
		fireEvent.change(input, { target: { value: "Write command" } });
		fireEvent.keyDown(input, { key: "Enter" });
		await waitFor(() =>
			expect(mockExecute).toHaveBeenCalledWith(
				expect.anything(),
				"Write command",
			),
		);

		// Switch to "Rewrite" tool
		fireEvent.click(screen.getByLabelText("Close")); // Close current tool
		fireEvent.click(screen.getByLabelText("AI Tools"));
		fireEvent.click(screen.getByLabelText("Rewrite"));

		// Check history for "Rewrite" - should be empty
		fireEvent.click(screen.getByLabelText("Command history"));
		expect(screen.getByText("No recent history")).toBeInTheDocument();

		// Switch back to "Batch Write"
		fireEvent.click(screen.getByLabelText("Close"));
		fireEvent.click(screen.getByLabelText("AI Tools"));
		fireEvent.click(screen.getByLabelText("Batch Write"));

		// Check history for "Batch Write" - should have one item
		fireEvent.click(screen.getByLabelText("Command history"));
		const historyItems = screen.getAllByTestId("history-item");
		expect(historyItems).toHaveLength(1);
		expect(historyItems[0]).toHaveTextContent("Write command");
	});
});
