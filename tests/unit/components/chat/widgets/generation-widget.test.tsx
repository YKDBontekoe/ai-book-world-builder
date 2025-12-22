import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Use relative import for the component under test to ensure it loads
import { GenerationWidget } from "@/components/organisms/chat/widgets/generation-widget";

// Define the mock function using vi.hoisted
const { mockUseDataStream } = vi.hoisted(() => ({
	mockUseDataStream: vi.fn(),
}));

// Mock dependencies using relative paths from the TEST FILE.
// Test: tests/unit/components/chat/widgets/generation-widget.test.tsx
// Target: components/chat/data-stream-provider.tsx
vi.mock("@/components/organisms/chat/data-stream-provider", () => ({
	useDataStream: () => ({
		dataStream: mockUseDataStream(),
	}),
}));

// Mock InteractiveWidget
// Target: components/chat/widgets/interactive-widget.tsx
vi.mock("@/components/organisms/chat/widgets/interactive-widget", () => ({
	InteractiveWidget: ({ children, headerTitle, isError, headerEnd }: any) => (
		<div
			data-testid="interactive-widget"
			data-title={headerTitle}
			data-error={isError ? "true" : "false"}
		>
			<div data-testid="widget-header-end">{headerEnd}</div>
			<div data-testid="widget-content">{children}</div>
		</div>
	),
}));

// Mock Button
vi.mock("@/components/atoms/button", () => ({
	Button: ({ children, onClick, className }: any) => (
		<button onClick={onClick} className={className} data-testid="mock-button">
			{children}
		</button>
	),
}));

describe("GenerationWidget", () => {
	beforeEach(() => {
		mockUseDataStream.mockReturnValue([]);
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it("renders loading state for Orchestrator", () => {
		mockUseDataStream.mockReturnValue([
			{ type: "tool-log", tool: "orchestrateBook", message: "Thinking..." },
		]);

		render(
			<GenerationWidget
				toolName="orchestrateBook"
				state="call"
				input={{ userRequest: "Plan a book" }}
			/>,
		);

		expect(screen.getByTestId("interactive-widget")).toHaveAttribute(
			"data-title",
			"Orchestrator",
		);
		expect(screen.getByText("Thinking...")).toBeInTheDocument();
		expect(screen.getByText('"Plan a book"')).toBeInTheDocument();
	});

	it("renders result state for Orchestrator", () => {
		const output = {
			decision: { actionTitle: "Create Chapter 1" },
			projectStats: { characters: 5 },
			readinessScore: 80,
		};

		render(
			<GenerationWidget
				toolName="orchestrateBook"
				state="result"
				input={{}}
				output={output}
			/>,
		);

		expect(screen.getByTestId("interactive-widget")).toHaveAttribute(
			"data-title",
			"Orchestrator",
		);
		expect(screen.getByText("Create Chapter 1")).toBeInTheDocument();
		expect(screen.getByText("80%")).toBeInTheDocument();
	});

	it("renders loading state for Writer", () => {
		render(
			<GenerationWidget
				toolName="draftScene"
				state="call"
				input={{ instructions: "Write a scary scene" }}
			/>,
		);

		expect(screen.getByTestId("interactive-widget")).toHaveAttribute(
			"data-title",
			"Writer",
		);
		expect(screen.getByText(/Drafting scene content/i)).toBeInTheDocument();
		// Use a function matcher or looser regex to match text split across elements
		expect(
			screen.getByText((content) => content.includes("Write a scary scene")),
		).toBeInTheDocument();
	});

	it("renders result state for Writer", () => {
		render(
			<GenerationWidget
				toolName="draftScene"
				state="result"
				input={{}}
				output={{ preview: "Once upon a time...", wordCount: 100 }}
			/>,
		);

		expect(screen.getByTestId("interactive-widget")).toHaveAttribute(
			"data-title",
			"Writer",
		);
		expect(screen.getByText("Once upon a time...")).toBeInTheDocument();
		expect(screen.getByText("Words: 100")).toBeInTheDocument();
	});

	it("renders error state", () => {
		render(
			<GenerationWidget
				toolName="orchestrateBook"
				state="result"
				input={{}}
				output={{ error: "Something went wrong" }}
			/>,
		);

		const widget = screen.getByTestId("interactive-widget");
		expect(widget).toHaveAttribute("data-error", "true");
		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
	});

	it("auto-collapses after completion", async () => {
		render(
			<GenerationWidget
				toolName="draftScene"
				state="result"
				input={{}}
				output={{ preview: "Done" }}
			/>,
		);

		// Initially expanded
		expect(screen.getByText("Done")).toBeVisible();

		// Fast-forward time
		act(() => {
			vi.advanceTimersByTime(2000);
		});

		// Should be collapsed
		expect(screen.queryByText("Done")).not.toBeInTheDocument();
	});

	it("renders fallback for unknown tool", () => {
		render(<GenerationWidget toolName="unknownTool" state="call" input={{}} />);

		expect(screen.getByText(/unknownTool: call/i)).toBeInTheDocument();
	});
});
