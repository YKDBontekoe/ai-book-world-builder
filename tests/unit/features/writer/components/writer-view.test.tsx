import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { WriterView } from "@/features/writer/components/writer-view";
import type { Project } from "@/lib/db/schema";

vi.mock("usehooks-ts", async (importOriginal) => {
	const actual = await importOriginal<typeof import("usehooks-ts")>();

	return {
		...actual,
		useMediaQuery: vi.fn(),
	};
});

// Mock child components
vi.mock("@/features/writer/components/writer-sidebar", () => ({
	WriterSidebar: () => <div data-testid="writer-sidebar">Writer Sidebar</div>,
}));

vi.mock("@/components/organisms/book-canvas/book-canvas", () => ({
	BookCanvas: () => <div data-testid="book-canvas">Book Canvas</div>,
}));

vi.mock("@/components/organisms/book-canvas/book-canvas-context", () => ({
	useBookCanvasActions: () => ({
		setProjectId: vi.fn(),
		setActiveSceneId: vi.fn(),
		setIsReadOnly: vi.fn(),
		setIsOpen: vi.fn(),
	}),
	useBookCanvasValue: () => ({
		activeSceneId: null,
	}),
	useBookCanvasSelection: () => ({
		activeSceneId: null,
		chatAction: null,
	}),
}));

vi.mock("@/features/writer/components/structure-editor-dialog", () => ({
	StructureEditorDialog: () => <button type="button">Structure Editor</button>,
}));

vi.mock("@/features/writer/components/project-settings-modal", () => ({
	ProjectSettingsModal: () => <button type="button">Settings</button>,
}));

vi.mock("@/components/organisms/chat/floating-assistant", () => ({
	FloatingAssistant: () => (
		<div data-testid="floating-assistant">Floating Assistant</div>
	),
}));

vi.mock("@/components/organisms/editor/text-editor", () => ({
	Editor: () => <div data-testid="editor">Editor</div>,
}));

vi.mock("@/components/atoms/sheet", () => ({
	Sheet: ({ children }: { children: ReactNode }) => (
		<div data-testid="sheet">{children}</div>
	),
	SheetContent: ({ children }: { children: ReactNode }) => (
		<div data-testid="sheet-content">{children}</div>
	),
	SheetHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	SheetTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	SheetDescription: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock("@/features/writer/components/writer-editor", () => ({
	WriterEditor: () => <div data-testid="writer-editor">Writer Editor</div>,
}));

// Mock the hook that caused the crash
vi.mock("@/hooks/use-project-entities", () => ({
	useProjectEntities: () => ({ data: [] }),
}));

// Mock the server action file itself to prevent it from trying to load DB in test env
vi.mock("@/features/writer/actions", () => ({
	getProjectStructure: vi
		.fn()
		.mockResolvedValue({ structure: [], structureText: "" }),
	updateSceneContent: vi.fn(),
	createChapterSnapshot: vi.fn(),
}));

// Mock Resizeable Panels (UI lib) - often needs mocking in jsdom
vi.mock("@/components/atoms/resizable", () => ({
	ResizablePanelGroup: ({ children }: { children: ReactNode }) => (
		<div data-testid="resizable-panel-group">{children}</div>
	),
	ResizablePanel: ({ children }: { children: ReactNode }) => (
		<div data-testid="resizable-panel">{children}</div>
	),
	ResizableHandle: () => <div data-testid="resizable-handle">|</div>,
}));

const mockProject: Project = {
	id: "proj-1",
	userId: "user-1",
	name: "Test Project",
	createdAt: new Date(),
	visibility: "private",
	forkedFromId: null,
	description: null,
	folders: [],
	lastViewedSceneId: null,
};

describe("WriterView", () => {
	it("renders the 3-pane layout", async () => {
		const { useMediaQuery } = await import("usehooks-ts");
		vi.mocked(useMediaQuery).mockReturnValue(false);

		render(<WriterView project={mockProject} />);

		expect(screen.getByTestId("writer-sidebar")).toBeInTheDocument();
		expect(screen.getByTestId("book-canvas")).toBeInTheDocument();
		expect(await screen.findByTestId("floating-assistant")).toBeInTheDocument();
	});

	it("renders mobile overlays without resizable panels", async () => {
		const { useMediaQuery } = await import("usehooks-ts");
		vi.mocked(useMediaQuery).mockReturnValue(true);

		render(<WriterView project={mockProject} />);

		expect(
			screen.queryByTestId("resizable-panel-group"),
		).not.toBeInTheDocument();
		expect(screen.getByTestId("writer-editor")).toBeInTheDocument();
	});
});
