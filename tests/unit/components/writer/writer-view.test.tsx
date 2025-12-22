import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WriterView } from "../../../../components/writer/writer-view";
import { Project } from "../../../../lib/db/schema";

// Mock child components
vi.mock("../../../../components/writer/writer-sidebar", () => ({
  WriterSidebar: () => <div data-testid="writer-sidebar">Writer Sidebar</div>
}));

vi.mock("../../../../components/book-canvas/book-canvas", () => ({
  BookCanvas: () => <div data-testid="book-canvas">Book Canvas</div>
}));

vi.mock("../../../../components/book-canvas/book-canvas-context", () => ({
  useBookCanvasActions: () => ({
    setProjectId: vi.fn(),
    setActiveSceneId: vi.fn(),
    setIsReadOnly: vi.fn(),
  }),
  useBookCanvasValue: () => ({
    activeSceneId: null
  })
}));

vi.mock("../../../../components/writer/structure-editor-dialog", () => ({
  StructureEditorDialog: () => <button>Structure Editor</button>
}));

vi.mock("../../../../components/writer/project-settings-modal", () => ({
    ProjectSettingsModal: () => <button>Settings</button>
}));

vi.mock("../../../../components/chat/floating-assistant", () => ({
  FloatingAssistant: () => <div data-testid="floating-assistant">Floating Assistant</div>
}));

vi.mock("../../../../components/editor/text-editor", () => ({
  Editor: () => <div data-testid="editor">Editor</div>
}));

vi.mock("../../../../components/writer/writer-editor", () => ({
  WriterEditor: () => <div data-testid="writer-editor">Writer Editor</div>
}));

// Mock the server action file itself to prevent it from trying to load DB in test env
vi.mock("../../../../app/actions/writer", () => ({
  getProjectStructure: vi.fn().mockResolvedValue({ structure: [], structureText: "" }),
  updateSceneContent: vi.fn(),
  createChapterSnapshot: vi.fn(),
}));

// Mock Resizeable Panels (UI lib) - often needs mocking in jsdom
vi.mock("@/components/ui/resizable", () => ({
    ResizablePanelGroup: ({ children }: any) => <div>{children}</div>,
    ResizablePanel: ({ children }: any) => <div>{children}</div>,
    ResizableHandle: () => <div>|</div>
}));

const mockProject: Project = {
  id: "proj-1",
  userId: "user-1",
  title: "Test Project",
  createdAt: new Date(),
  updatedAt: new Date(),
  visibility: "private",
  forkedFromId: null,
  description: null,
  bookCover: null
};

describe("WriterView", () => {
  it("renders the 3-pane layout", async () => {
    render(<WriterView project={mockProject} />);

    expect(screen.getByTestId("writer-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("book-canvas")).toBeInTheDocument();
    expect(await screen.findByTestId("floating-assistant")).toBeInTheDocument();
  });
});
