import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WriterView } from "@/components/organisms/writer/writer-view";
import type { Project } from "@/lib/db/schema";

// Mock child components
vi.mock("@/components/organisms/writer/writer-sidebar", () => ({
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
	}),
	useBookCanvasValue: () => ({
		activeSceneId: null,
	}),
}));

vi.mock("@/components/organisms/writer/structure-editor-dialog", () => ({
	StructureEditorDialog: () => <button>Structure Editor</button>,
}));

vi.mock("@/components/organisms/writer/project-settings-modal", () => ({
	ProjectSettingsModal: () => <button>Settings</button>,
}));

vi.mock("@/components/organisms/chat/floating-assistant", () => ({
	FloatingAssistant: () => (
		<div data-testid="floating-assistant">Floating Assistant</div>
	),
}));

vi.mock("@/components/organisms/editor/text-editor", () => ({
	Editor: () => <div data-testid="editor">Editor</div>,
}));

vi.mock("@/components/organisms/writer/writer-editor", () => ({
	WriterEditor: () => <div data-testid="writer-editor">Writer Editor</div>,
}));

// Mock the server action file itself to prevent it from trying to load DB in test env
vi.mock("@/app/actions/writer", () => ({
	getProjectStructure: vi
		.fn()
		.mockResolvedValue({ structure: [], structureText: "" }),
	updateSceneContent: vi.fn(),
	createChapterSnapshot: vi.fn(),
}));

// Mock Resizeable Panels (UI lib) - often needs mocking in jsdom
vi.mock("@/components/atoms/resizable", () => ({
	ResizablePanelGroup: ({ children }: any) => <div>{children}</div>,
	ResizablePanel: ({ children }: any) => <div>{children}</div>,
	ResizableHandle: () => <div>|</div>,
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
		render(<WriterView project={mockProject} />);

		expect(screen.getByTestId("writer-sidebar")).toBeInTheDocument();
		expect(screen.getByTestId("book-canvas")).toBeInTheDocument();
		expect(await screen.findByTestId("floating-assistant")).toBeInTheDocument();
	});
});
