import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WriterSidebar } from "@/components/organisms/writer/writer-sidebar";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { createNewChapter } from "@/app/actions/writer";

// Mock dependencies
vi.mock("@/components/organisms/writer/writer-context");
vi.mock("@/components/organisms/writer/writer-layout-context");
vi.mock("@/app/actions/writer");
vi.mock("@/components/organisms/writer/chapter-actions", () => ({
  ChapterActions: () => <button data-testid="chapter-actions">Actions</button>,
}));
vi.mock("@/components/organisms/writer/structure-editor-dialog", () => ({
  StructureEditorDialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/organisms/writer/left-sidebar/scene-item", () => ({
  SceneItem: ({ scene }: { scene: any }) => <div data-testid="scene-item">{scene.title}</div>,
}));
vi.mock("@/components/organisms/writer/sidebar-skeleton", () => ({
    SidebarSkeleton: () => <div data-testid="sidebar-skeleton">Loading...</div>
}));

describe("WriterSidebar", () => {
  const mockToggleSidebar = vi.fn();
  const mockFetchStructure = vi.fn();
  const mockSetActiveSceneId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useWriterLayoutContext as any).mockReturnValue({
      toggleSidebar: mockToggleSidebar,
    });

    (useWriterContext as any).mockReturnValue({
      project: { id: "p1", name: "Project 1" },
      structure: [
        {
          id: "c1",
          title: "Chapter 1",
          scenes: [
            { id: "s1", title: "Scene 1" },
            { id: "s2", title: "Scene 2" },
          ],
        },
      ],
      structureText: "Chapter 1...",
      activeSceneId: "s1",
      setActiveSceneId: mockSetActiveSceneId,
      loading: false,
      fetchStructure: mockFetchStructure,
      isReadOnly: false,
    });
  });

  it("renders structure correctly", () => {
    render(<WriterSidebar />);
    expect(screen.getByText("Book Structure")).toBeInTheDocument();
    expect(screen.getByText("Chapter 1")).toBeInTheDocument();
  });

  it("handles loading state", () => {
    (useWriterContext as any).mockReturnValue({
        loading: true,
        project: { id: "p1" },
        fetchStructure: mockFetchStructure
    });
    render(<WriterSidebar />);
    expect(screen.getByTestId("sidebar-skeleton")).toBeInTheDocument();
  });

  it("renders empty state when no structure", () => {
    (useWriterContext as any).mockReturnValue({
        structure: [],
        project: { id: "p1" },
        fetchStructure: mockFetchStructure,
        loading: false,
        isReadOnly: false
    });
    render(<WriterSidebar />);
    expect(screen.getByText("No chapters")).toBeInTheDocument();
  });
});
