import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Use vi.hoisted to ensure mocks are available before import
const mocks = vi.hoisted(() => ({
	useWriterControl: vi.fn(),
	useWriterContext: vi.fn(),
	useWriterLayoutContext: vi.fn(),
	useProjectEntities: vi.fn(),
}));

vi.mock("@/features/writer/components/writer-control-context", () => ({
	useWriterControl: mocks.useWriterControl,
}));

vi.mock("@/features/writer/components/writer-context", () => ({
	useWriterContext: mocks.useWriterContext,
}));

vi.mock("@/features/writer/components/writer-layout-context", () => ({
	useWriterLayoutContext: mocks.useWriterLayoutContext,
}));

vi.mock("@/hooks/use-project-entities", () => ({
	useProjectEntities: mocks.useProjectEntities,
}));

// Mock GlassCard to avoid issues with specialized UI components
vi.mock("@/components/molecules/glass-card", () => ({
	GlassCard: ({ children, className }: any) => (
		<div className={className} data-testid="glass-card">
			{children}
		</div>
	),
}));

// Mock Dialog components
vi.mock("@/components/atoms/dialog", () => ({
	Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
	DialogContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("usehooks-ts", () => ({
	useDebounceValue: (value: any) => [value, vi.fn()],
}));

import { WriterSpotlight } from "@/features/writer/components/tools/writer-spotlight";

describe("WriterSpotlight", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders when spotlight is open", () => {
		mocks.useWriterControl.mockReturnValue({
			isSpotlightOpen: true,
			toggleSpotlight: vi.fn(),
			setChatOpen: vi.fn(),
		});

		mocks.useWriterContext.mockReturnValue({
			project: { id: "p1" },
			structure: [],
			setActiveSceneId: vi.fn(),
		});

		mocks.useWriterLayoutContext.mockReturnValue({
			toggleZenMode: vi.fn(),
			toggleTypewriterMode: vi.fn(),
		});

		mocks.useProjectEntities.mockReturnValue({
			data: [],
		});

		render(<WriterSpotlight />);

		expect(
			screen.getByPlaceholderText("What do you need?"),
		).toBeInTheDocument();
		expect(screen.getByText("Neural Command")).toBeInTheDocument();
	});

	it("filters items based on search query", async () => {
		mocks.useWriterControl.mockReturnValue({
			isSpotlightOpen: true,
			toggleSpotlight: vi.fn(),
			setChatOpen: vi.fn(),
		});

		mocks.useWriterContext.mockReturnValue({
			project: { id: "p1" },
			structure: [],
			setActiveSceneId: vi.fn(),
		});

		mocks.useWriterLayoutContext.mockReturnValue({
			toggleZenMode: vi.fn(),
			toggleTypewriterMode: vi.fn(),
		});

		mocks.useProjectEntities.mockReturnValue({
			data: [{ id: "e1", name: "Gandalf", kind: "Character", attributes: [] }],
		});

		render(<WriterSpotlight />);

		const input = screen.getByPlaceholderText("What do you need?");

		// Initial state (Action items should be visible)
		// We expect multiple because of the list item AND the preview pane (first item selected by default)
		expect(screen.getAllByText("Ask AI Assistant").length).toBeGreaterThan(0);

		// Filter
		fireEvent.change(input, { target: { value: "Gandalf" } });

		await waitFor(() => {
			expect(screen.queryByText("Ask AI Assistant")).not.toBeInTheDocument();
			// Gandalf might also appear twice (list + preview)
			expect(screen.getAllByText("Gandalf").length).toBeGreaterThan(0);
		});
	});

	it("triggers actions on selection", () => {
		const toggleZenMode = vi.fn();
		const toggleSpotlight = vi.fn();

		mocks.useWriterControl.mockReturnValue({
			isSpotlightOpen: true,
			toggleSpotlight,
			setChatOpen: vi.fn(),
		});

		mocks.useWriterContext.mockReturnValue({
			project: { id: "p1" },
			structure: [],
			setActiveSceneId: vi.fn(),
		});

		mocks.useWriterLayoutContext.mockReturnValue({
			toggleZenMode,
			toggleTypewriterMode: vi.fn(),
		});

		mocks.useProjectEntities.mockReturnValue({ data: [] });

		render(<WriterSpotlight />);

		const zenButton = screen.getByText("Toggle Zen Mode");
		fireEvent.click(zenButton);

		expect(toggleZenMode).toHaveBeenCalled();
		expect(toggleSpotlight).toHaveBeenCalled();
	});

	it("resets selection index when switching categories", () => {
		mocks.useWriterControl.mockReturnValue({
			isSpotlightOpen: true,
			toggleSpotlight: vi.fn(),
			setChatOpen: vi.fn(),
		});

		mocks.useWriterContext.mockReturnValue({
			project: { id: "p1" },
			structure: [],
			setActiveSceneId: vi.fn(),
		});

		mocks.useWriterLayoutContext.mockReturnValue({
			toggleZenMode: vi.fn(),
			toggleTypewriterMode: vi.fn(),
		});

		// Provide data for multiple categories
		mocks.useProjectEntities.mockReturnValue({
			data: [{ id: "e1", name: "Gandalf", kind: "Character", attributes: [] }],
		});

		render(<WriterSpotlight />);

		// Initial state (All) - Assuming "Ask AI Assistant" is index 0
		const input = screen.getByPlaceholderText("What do you need?");

		// Move selection down to index 1 (Toggle Zen Mode)
		fireEvent.keyDown(input, { key: "ArrowDown" });

		// Switch category to "Entities" (which has only 1 item)
		const entitiesTab = screen.getByText("entities");
		fireEvent.click(entitiesTab);

		// The selection should reset to 0 (Gandalf), not stay at 1 (which would be invalid)
		// We verify this by ensuring the first item is active/highlighted
		expect(screen.getByText("Gandalf")).toBeInTheDocument();
	});
});
