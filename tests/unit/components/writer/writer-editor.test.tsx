import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { WriterEditor } from "../../../../components/writer/writer-editor";
import * as writerActions from "../../../../app/actions/writer";
import * as writerContext from "../../../../components/writer/writer-context";

// Mock child components
vi.mock("../../../../components/editor/text-editor", () => ({
  Editor: () => <div data-testid="text-editor">Editor Content</div>,
}));

vi.mock("../../../../components/ui/empty-state", () => ({
  EmptyState: ({ title, description, action }: any) => (
    <div data-testid="empty-state">
      <h1>{title}</h1>
      <p>{description}</p>
      {action}
    </div>
  ),
}));

vi.mock("../../../../components/writer/writer-header", () => ({
    WriterHeader: () => <div data-testid="writer-header">Header</div>
}));

// Mock Server Actions
vi.mock("../../../../app/actions/writer", () => ({
  initializeProject: vi.fn(),
}));

// Mock Icons
vi.mock("lucide-react", () => ({
  Loader2: () => <span>Loading...</span>,
  Save: () => <span>Save</span>,
  History: () => <span>History</span>,
  Sparkles: () => <span>Sparkles</span>,
  MousePointerClick: () => <span>MousePointerClick</span>,
}));

// Mock Context
const mockUseWriterContext = vi.fn();
vi.mock("../../../../components/writer/writer-context", async (importOriginal) => {
    const actual = await importOriginal<typeof writerContext>();
    return {
        ...actual,
        useWriterContext: () => mockUseWriterContext(),
    };
});

describe("WriterEditor", () => {
  const defaultContext = {
    project: { id: "project-123" },
    activeScene: undefined,
    activeSceneId: null,
    sceneContent: "",
    handleContentChange: vi.fn(),
    handleSnapshot: vi.fn(),
    isSnapshotting: false,
    isSaving: false,
    lastSaved: false,
    structure: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWriterContext.mockReturnValue(defaultContext);

    Object.defineProperty(window, "location", {
      writable: true,
      value: { reload: vi.fn() },
    });
  });

  it("renders Empty State when no scene selected and hasScenes is false", () => {
    mockUseWriterContext.mockReturnValue({
        ...defaultContext,
        structure: []
    });
    render(<WriterEditor />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("Start Your Story")).toBeInTheDocument();
    expect(screen.getByText("Start Writing")).toBeInTheDocument();
    expect(screen.queryByTestId("text-editor")).not.toBeInTheDocument();
  });

  it("renders 'Select a scene' empty state when no scene selected but hasScenes is true", () => {
    mockUseWriterContext.mockReturnValue({
        ...defaultContext,
        structure: [{ scenes: [{ id: 's1' }] }] // hasScenes = true
    });
    render(<WriterEditor />);

    // We updated the component to use EmptyState for this case too
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No Scene Selected")).toBeInTheDocument();
    expect(screen.getByText("Select a scene from the sidebar to continue writing.")).toBeInTheDocument();
  });

  it("renders Editor when scene is selected", () => {
    mockUseWriterContext.mockReturnValue({
        ...defaultContext,
        activeSceneId: "scene-1",
        activeScene: { id: "scene-1", title: "Scene 1" },
        structure: [{ scenes: [{ id: 'scene-1' }] }]
    });
    render(<WriterEditor />);

    expect(screen.getByTestId("text-editor")).toBeInTheDocument();
    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
  });

  it("calls initializeProject when Start Writing is clicked", async () => {
    const mockInitialize = vi.mocked(writerActions.initializeProject).mockResolvedValue({
      success: true,
      sceneId: "new-scene-1"
    });

    mockUseWriterContext.mockReturnValue({
        ...defaultContext,
        structure: []
    });
    render(<WriterEditor />);

    const startButton = screen.getByText("Start Writing");
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalledWith("project-123");
    });

    expect(window.location.reload).toHaveBeenCalled();
  });

  it("handles initialization failure gracefully", async () => {
    const mockInitialize = vi.mocked(writerActions.initializeProject).mockResolvedValue({
      success: false
    });

    mockUseWriterContext.mockReturnValue({
        ...defaultContext,
        structure: []
    });
    render(<WriterEditor />);

    const startButton = screen.getByText("Start Writing");
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalledWith("project-123");
    });

    expect(window.location.reload).not.toHaveBeenCalled();
  });
});
