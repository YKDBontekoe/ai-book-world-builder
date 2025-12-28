import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PowerDock } from "@/components/organisms/writer/power-dock";
const { mockExecute } = vi.hoisted(() => {
	return {
		mockExecute: vi
			.fn()
			.mockResolvedValue({ success: true, result: "Generated text" }),
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

import type { HistoryItem } from "@/components/organisms/writer/power-dock";

vi.mock("usehooks-ts", () => ({
  useLocalStorage: <T,>(key: string, initialValue: T) => {
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

vi.mock("usehooks-ts", () => {
	let store: any[] = [];
	return {
		useLocalStorage: vi.fn(() => [
			store,
			(value: any) => {
				if (typeof value === "function") {
					store = value(store);
				} else {
					store = value;
				}
			},
		]),
	};
});

// Mock tool strategies
vi.mock("@/components/organisms/writer/tools/tool-strategies", () => ({
	toolStrategies: {
		write: { execute: mockExecute },
		rewrite: { execute: mockExecute },
		expand: { execute: mockExecute },
		critique: { execute: mockExecute },
		consistency: { execute: mockExecute },
		lore: { execute: mockExecute },
	},
}));

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

vi.mock("@/components/atoms/dropdown-menu", () => ({
	DropdownMenu: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dropdown-menu">{children}</div>
	),
	DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dropdown-trigger">{children}</div>
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
			onKeyDown={() => {}}
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

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", async () => {
	const actual = await vi.importActual("framer-motion");
	return {
		...actual,
		AnimatePresence: ({ children }: { children: React.ReactNode }) => (
			<>{children}</>
		),
		motion: {
			div: (props: React.ComponentProps<"div">) => <div {...props} />,
		},
	};
});

describe("PowerDock", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders main controls initially", () => {
		render(<PowerDock />);
		expect(screen.getByLabelText("Undo")).toBeInTheDocument();
		expect(screen.getByLabelText("Redo")).toBeInTheDocument();
		expect(screen.getByLabelText("Spotlight")).toBeInTheDocument();
		expect(screen.getByLabelText("AI Tools")).toBeInTheDocument();
		expect(screen.getByLabelText("Assistant")).toBeInTheDocument();
	});

	it("calls undo/redo when clicked", () => {
		render(<PowerDock />);
		fireEvent.click(screen.getByLabelText("Undo"));
		expect(mockEditorActions.undo).toHaveBeenCalled();

		fireEvent.click(screen.getByLabelText("Redo"));
		expect(mockEditorActions.redo).toHaveBeenCalled();
	});

	it("expands AI tools tray when AI Tools button is clicked", async () => {
		render(<PowerDock />);
		fireEvent.click(screen.getByLabelText("AI Tools"));

		// Check for tool icons (e.g., Batch Write, Rewrite)
		await waitFor(() => {
			expect(screen.getByLabelText("Batch Write")).toBeInTheDocument();
			expect(screen.getByLabelText("Rewrite")).toBeInTheDocument();
		});
	});

	it("switches to input mode when a tool is selected", async () => {
		render(<PowerDock />);
		fireEvent.click(screen.getByLabelText("AI Tools"));
		await waitFor(() => screen.getByLabelText("Rewrite"));

		fireEvent.click(screen.getByLabelText("Rewrite"));

		await waitFor(() => {
			expect(
				screen.getByPlaceholderText(
					"Instructions (e.g., 'Change to 1st person')",
				),
			).toBeInTheDocument();
		});
	});

});
