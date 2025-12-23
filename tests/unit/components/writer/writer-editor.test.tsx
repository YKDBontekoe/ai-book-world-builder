import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { WriterEditor } from "@/components/organisms/writer/writer-editor";
import * as writerContext from "@/components/organisms/writer/writer-context";


// Mock child components
vi.mock("@/components/organisms/editor/text-editor", () => ({
  Editor: () => <div data-testid="text-editor">Editor Content</div>,
}));

vi.mock("@/components/atoms/empty-state", () => ({
  EmptyState: ({ title, description, action }: any) => (
    <div data-testid="empty-state">
      <h1>{title}</h1>
      <p>{description}</p>
      {action}
    </div>
  ),
}));

vi.mock("@/hooks/use-project-entities", () => ({
    useProjectEntities: vi.fn(() => ({ data: [] })),
}));

vi.mock("@/components/organisms/writer/writer-header", () => ({

    WriterHeader: () => <div data-testid="writer-header">Header</div>
}));

vi.mock("@/components/organisms/writer/story-wizard", () => ({
  StoryWizard: ({ onComplete }: any) => (
    <div data-testid="story-wizard">
        Story Wizard
        <button type="button" onClick={onComplete}>Complete</button>
    </div>

  )
}));

// Mock Server Actions
vi.mock("@/app/actions/writer", () => ({
  initializeProject: vi.fn(),
}));

// Mock app/actions/story-generation to prevent DB connection
vi.mock("@/app/actions/story-generation", () => ({
    planChapterScenes: vi.fn(),
    generateSceneText: vi.fn(),
}));

// Mock Icons
vi.mock("lucide-react", () => ({
  Loader2: () => <span>Loading...</span>,
  Save: () => <span>Save</span>,
  History: () => <span>History</span>,
  Sparkles: () => <span>Sparkles</span>,
  MousePointerClick: () => <span>Click</span>,
  Lock: () => <span>Lock</span>,
}));

// Mock useRouter
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock Context
const mockUseWriterContext = vi.fn();
vi.mock("@/components/organisms/writer/writer-context", async (importOriginal) => {
    const actual = await importOriginal<typeof writerContext>();
    return {
        ...actual,
        useWriterContext: () => mockUseWriterContext(),
    };
});

// Mock Layout Context
const mockUseWriterLayoutContext = vi.fn();
vi.mock("@/components/organisms/writer/writer-layout-context", async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        useWriterLayoutContext: () => mockUseWriterLayoutContext(),
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
    isReadOnly: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWriterContext.mockReturnValue(defaultContext);
    mockUseWriterLayoutContext.mockReturnValue({
        isSidebarOpen: true,
        toggleSidebar: vi.fn(),
        viewMode: "standard",
        toggleZenMode: vi.fn(),
        isTypewriterMode: false,
        toggleTypewriterMode: vi.fn(),
    });
  });


  it("renders StoryWizard when no scene selected and hasScenes is false (and not read-only)", () => {
    mockUseWriterContext.mockReturnValue({
        ...defaultContext,
        structure: []
    });
    render(<WriterEditor />);

    expect(screen.getByTestId("story-wizard")).toBeInTheDocument();
  });

  it("renders Empty State (Read Only) when no scene selected, hasScenes is false, and isReadOnly is true", () => {
    mockUseWriterContext.mockReturnValue({
        ...defaultContext,
        structure: [],
        isReadOnly: true
    });
    render(<WriterEditor />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("Empty Project")).toBeInTheDocument();
    expect(screen.queryByTestId("story-wizard")).not.toBeInTheDocument();
  });

  it("renders 'No Scene Selected' when no scene selected but hasScenes is true", () => {
    mockUseWriterContext.mockReturnValue({
        ...defaultContext,
        structure: [{ scenes: [{ id: 's1' }] }] // hasScenes = true
    });
    render(<WriterEditor />);

    // In this case, empty state is rendered but with different content
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No Scene Selected")).toBeInTheDocument();
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

  it("calls refresh when wizard completes", async () => {
    mockUseWriterContext.mockReturnValue({
        ...defaultContext,
        structure: []
    });
    render(<WriterEditor />);

    const completeButton = screen.getByText("Complete");
    fireEvent.click(completeButton);

    expect(mockRefresh).toHaveBeenCalled();
  });
});
