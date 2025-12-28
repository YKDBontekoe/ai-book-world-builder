import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PowerDock } from "@/components/organisms/writer/power-dock";

// Mock dependencies
const mockEditorActions = {
	undo: vi.fn(),
	redo: vi.fn(),
};

const mockToggleChat = vi.fn();
const mockToggleSpotlight = vi.fn();

vi.mock("@/components/organisms/writer/writer-control-context", () => ({
	useWriterControl: () => ({
		editorActions: mockEditorActions,
		toggleChat: mockToggleChat,
		isChatOpen: false,
		toggleSpotlight: mockToggleSpotlight,
		isSpotlightOpen: false,
	}),
}));

vi.mock("@/components/organisms/writer/writer-layout-context", () => ({
	useWriterLayoutContext: () => ({
		viewMode: "default",
	}),
}));

vi.mock("@/components/organisms/writer/writer-context", () => ({
	useWriterContext: () => ({
		project: { id: "p1" },
		structure: [],
		activeChapterId: "c1",
		activeSceneId: "s1",
	}),
}));

// Mock tool strategies
vi.mock("@/components/organisms/writer/tools/tool-strategies", () => ({
	toolStrategies: {
		write: {
			execute: vi
				.fn()
				.mockResolvedValue({ success: true, result: "Generated text" }),
		},
		rewrite: {
			execute: vi
				.fn()
				.mockResolvedValue({ success: true, result: "Rewritten text" }),
		},
	},
}));

vi.mock("@/components/atoms/tooltip", () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	TooltipContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	TooltipProvider: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", async () => {
	const actual = await vi.importActual("framer-motion");
	return {
		...actual,
		AnimatePresence: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		motion: {
			div: ({ children, className, onClick, ...props }: any) => (
				<div className={className} onClick={onClick} {...props}>
					{children}
				</div>
			),
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
			expect(screen.getByPlaceholderText(/Instructions/i)).toBeInTheDocument();
		});
	});

	// Note: Testing actual execution might be tricky with mock tool strategies,
	// but we can verify the input appears.
});
