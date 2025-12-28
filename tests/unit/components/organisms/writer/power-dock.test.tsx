import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PowerDock } from "@/components/organisms/writer/power-dock";


// Hoist mock functions
const { mockExecute } = vi.hoisted(() => ({
	mockExecute: vi.fn(),
}));

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
	useLocalStorage: <T,>(_key: string, initialValue: T) => {
		const [state, setState] = React.useState(initialValue);
		return [state, setState];
	},
}));

import React from "react";

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
			tabIndex={0}
			onClick={onClick}
			onKeyDown={() => {}}
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
		// Navigate to tool
		fireEvent.click(screen.getByLabelText("AI Tools"));
		fireEvent.click(screen.getByLabelText("Batch Write"));

		// Type input
		const input = screen.getByPlaceholderText(
			"Instructions (e.g., 'Make it tense')",
		);
		fireEvent.change(input, { target: { value: "Test command" } });

		// Execute
		fireEvent.keyDown(input, { key: "Enter" });

		await waitFor(() => {
			expect(mockExecute).toHaveBeenCalledWith(
				expect.anything(),
				"Test command",
			);
		});

		// Check if "Test command" appears in the history items (DropdownMenuItem)
		// We added data-testid="history-item" to the mock
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

		// Add 25 commands
		for (let i = 0; i < 25; i++) {
			fireEvent.change(input, { target: { value: `Command ${i}` } });
			fireEvent.keyDown(input, { key: "Enter" });
			await waitFor(() => expect(mockExecute).toHaveBeenCalled());
		}

		const historyItems = screen.getAllByTestId("history-item");
		expect(historyItems).toHaveLength(20);
	});

	it("deduplicates identical recent commands", async () => {
		render(<PowerDock />);
		fireEvent.click(screen.getByLabelText("AI Tools"));
		fireEvent.click(screen.getByLabelText("Batch Write"));

		const input = screen.getByPlaceholderText(
			"Instructions (e.g., 'Make it tense')",
		);

		// Add same command twice
		fireEvent.change(input, { target: { value: "Same command" } });
		fireEvent.keyDown(input, { key: "Enter" });
		await waitFor(() => expect(mockExecute).toHaveBeenCalled());

		fireEvent.change(input, { target: { value: "Same command" } });
		fireEvent.keyDown(input, { key: "Enter" });
		await waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(2));

		const historyItems = screen.getAllByTestId("history-item");
		expect(historyItems).toHaveLength(1);
	});

	it("clears history for a tool", async () => {
		render(<PowerDock />);
		fireEvent.click(screen.getByLabelText("AI Tools"));
		fireEvent.click(screen.getByLabelText("Batch Write"));

		const input = screen.getByPlaceholderText(
			"Instructions (e.g., 'Make it tense')",
		);
		fireEvent.change(input, { target: { value: "A command to clear" } });
		fireEvent.keyDown(input, { key: "Enter" });

		await waitFor(() => {
			expect(mockExecute).toHaveBeenCalledWith(
				expect.anything(),
				"A command to clear",
			);
		});

		expect(screen.getAllByTestId("history-item")).toHaveLength(1);

		fireEvent.click(screen.getByLabelText("Clear history for this tool"));

		// Dropdown closes, so we need to re-open to check
		fireEvent.click(screen.getByLabelText("Command history"));
		expect(screen.getByText("No recent history")).toBeInTheDocument();
	});

	it("maintains separate history for each tool", async () => {
		render(<PowerDock />);

		// Add command for "Batch Write"
		fireEvent.click(screen.getByLabelText("AI Tools"));
		fireEvent.click(screen.getByLabelText("Batch Write"));
		const writeInput = screen.getByPlaceholderText(
			"Instructions (e.g., 'Make it tense')",
		);
		fireEvent.change(writeInput, { target: { value: "Write command" } });
		fireEvent.keyDown(writeInput, { key: "Enter" });
		await waitFor(() =>
			expect(mockExecute).toHaveBeenCalledWith(
				expect.anything(),
				"Write command",
			),
		);

		// Close and switch to "Rewrite"
		fireEvent.click(screen.getByLabelText("Close")); // Reset button has X icon
		fireEvent.click(screen.getByLabelText("AI Tools"));
		fireEvent.click(screen.getByLabelText("Rewrite"));

		// Check history for "Rewrite" - should be empty
		fireEvent.click(screen.getByLabelText("Command history"));
		expect(screen.getByText("No recent history")).toBeInTheDocument();

		// Add command for "Rewrite"
		const rewriteInput = screen.getByPlaceholderText(
			"Instructions (e.g., 'Change to 1st person')",
		);
		fireEvent.change(rewriteInput, { target: { value: "Rewrite command" } });
		fireEvent.keyDown(rewriteInput, { key: "Enter" });
		await waitFor(() =>
			expect(mockExecute).toHaveBeenCalledWith(
				expect.anything(),
				"Rewrite command",
			),
		);

		// Check rewrite history has 1 item
		const rewriteHistoryItems = screen.getAllByTestId("history-item");
		expect(rewriteHistoryItems).toHaveLength(1);
		expect(rewriteHistoryItems[0]).toHaveTextContent("Rewrite command");

		// Switch back to "Batch Write"
		fireEvent.click(screen.getByLabelText("Close"));
		fireEvent.click(screen.getByLabelText("AI Tools"));
		fireEvent.click(screen.getByLabelText("Batch Write"));

		// Check write history still has its item
		fireEvent.click(screen.getByLabelText("Command history"));
		const writeHistoryItems = screen.getAllByTestId("history-item");
		expect(writeHistoryItems).toHaveLength(1);
		expect(writeHistoryItems[0]).toHaveTextContent("Write command");
	});
});
