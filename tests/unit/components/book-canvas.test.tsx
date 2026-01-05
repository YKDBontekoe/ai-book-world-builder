// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookCanvas } from "@/components/organisms/book-canvas/book-canvas";
import {
	useBookCanvasActions,
	useBookCanvasLayout,
} from "@/components/organisms/book-canvas/book-canvas-context";

// Mock the context hook
vi.mock("@/components/organisms/book-canvas/book-canvas-context", () => ({
	useBookCanvasLayout: vi.fn(),
	useBookCanvasActions: vi.fn(),
}));

const mockedUseBookCanvasLayout = vi.mocked(useBookCanvasLayout);
const mockedUseBookCanvasActions = vi.mocked(useBookCanvasActions);

// Mock the panes to avoid complex rendering
vi.mock("@/components/organisms/book-canvas/panes/outline-pane", () => ({
	OutlinePane: () => <div>Outline</div>,
}));
vi.mock("@/components/organisms/book-canvas/panes/timeline-pane", () => ({
	TimelinePane: () => <div>Timeline</div>,
}));
vi.mock("@/components/organisms/book-canvas/panes/scene-pane", () => ({
	ScenePane: () => <div>Scenes</div>,
}));
vi.mock("@/components/organisms/book-canvas/panes/draft-pane", () => ({
	DraftPane: () => <div>Draft</div>,
}));
vi.mock("@/components/organisms/book-canvas/panes/diagnostics-pane", () => ({
	DiagnosticsPane: () => <div>Diagnostics</div>,
}));
vi.mock("@/components/organisms/book-canvas/panes/bible-pane", () => ({
	BiblePane: () => <div>Bible</div>,
}));
vi.mock("@/components/organisms/book-canvas/panes/changelog-pane", () => ({
	ChangeLogPane: () => <div>ChangeLog</div>,
}));

describe("BookCanvas", () => {
	it("renders with fixed positioning when open", () => {
		mockedUseBookCanvasLayout.mockReturnValue({
			isOpen: true,
			activePane: "outline",
			overallStatus: "idle",
			projectId: "test-project",
			generationId: null,
			isReadOnly: false,
		});
		mockedUseBookCanvasActions.mockReturnValue({
			setIsOpen: vi.fn(),
			togglePanel: vi.fn(),
			setActivePane: vi.fn(),
			setOverallStatus: vi.fn(),
			setProjectId: vi.fn(),
			setGenerationId: vi.fn(),
			triggerChatAction: vi.fn(),
			setActiveSceneId: vi.fn(),
			setIsReadOnly: vi.fn(),
		});

		const { container } = render(<BookCanvas />);
		const canvasDiv = container.firstChild as HTMLElement;

		// Check for fixed positioning class
		expect(canvasDiv.className).toContain("fixed");
		expect(canvasDiv.className).toContain("inset-0");
		// Check for desktop overrides
		expect(canvasDiv.className).toContain("md:static");
		expect(canvasDiv.className).toContain("md:flex");
	});

	it("renders collapsed state correctly", () => {
		mockedUseBookCanvasLayout.mockReturnValue({
			isOpen: false,
			activePane: "outline",
			overallStatus: "idle",
			projectId: "test-project",
			generationId: null,
			isReadOnly: false,
		});
		mockedUseBookCanvasActions.mockReturnValue({
			setIsOpen: vi.fn(),
			togglePanel: vi.fn(),
			setActivePane: vi.fn(),
			setOverallStatus: vi.fn(),
			setProjectId: vi.fn(),
			setGenerationId: vi.fn(),
			triggerChatAction: vi.fn(),
			setActiveSceneId: vi.fn(),
			setIsReadOnly: vi.fn(),
		});

		const { container } = render(<BookCanvas />);
		const collapsedDiv = container.firstChild as HTMLElement;

		expect(collapsedDiv.className).toContain("hidden");
		expect(collapsedDiv.className).toContain("md:flex");
	});
});
