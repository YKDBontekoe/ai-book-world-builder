import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WriterView } from "../../../../src/components/writer/writer-view";
import { Project } from "../../../../src/lib/db/schema";

// Mock child components
vi.mock("../../../../src/components/writer/left-sidebar/scene-navigation", () => ({
  SceneNavigation: () => <div data-testid="scene-navigation">Scene Navigation</div>
}));

vi.mock("../../../../src/components/book-canvas/book-canvas", () => ({
  BookCanvas: () => <div data-testid="book-canvas">Book Canvas</div>
}));

vi.mock("../../../../src/components/book-canvas/book-canvas-context", () => ({
  useBookCanvasActions: () => ({
    setProjectId: vi.fn(),
    setActiveSceneId: vi.fn()
  }),
  useBookCanvasValue: () => ({
    activeSceneId: null
  })
}));

vi.mock("../../../../src/components/writer/structure-editor-dialog", () => ({
  StructureEditorDialog: () => <button>Structure Editor</button>
}));

vi.mock("../../../../src/components/writer/project-settings-modal", () => ({
    ProjectSettingsModal: () => <button>Settings</button>
}));

vi.mock("../../../../src/components/chat/floating-assistant", () => ({
  FloatingAssistant: () => <div data-testid="floating-assistant">Floating Assistant</div>
}));

vi.mock("../../../../src/components/editor/text-editor", () => ({
  Editor: () => <div data-testid="editor">Editor</div>
}));

// Mock the server action file itself to prevent it from trying to load DB in test env
vi.mock("../../../../src/app/actions/writer", () => ({
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

    expect(screen.getByTestId("scene-navigation")).toBeInTheDocument();
    expect(screen.getByTestId("book-canvas")).toBeInTheDocument();
    expect(await screen.findByTestId("floating-assistant")).toBeInTheDocument();
  });
});
