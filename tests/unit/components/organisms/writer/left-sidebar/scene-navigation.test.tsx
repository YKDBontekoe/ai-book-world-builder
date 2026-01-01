import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SceneNavigation } from "@/components/organisms/writer/left-sidebar/scene-navigation";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

// Mock dependencies
vi.mock("@/app/actions/writer", () => ({
  createNewChapter: vi.fn(),
  createSceneInChapter: vi.fn(),
  deleteScene: vi.fn(),
  generateScene: vi.fn(),
  updateSceneTitle: vi.fn(),
}));

vi.mock("@/components/organisms/writer/left-sidebar/scene-item", () => ({
  SceneItem: () => <div data-testid="scene-item">Scene Item</div>,
}));

vi.mock("@/components/molecules/empty-state", () => ({
  EmptyState: ({ title, action }: { title: string; action: React.ReactNode }) => (
    <div data-testid="empty-state">
      <h2>{title}</h2>
      {action}
    </div>
  ),
}));

describe("SceneNavigation", () => {
  const mockProject = { id: "p1" } as Project;

  it("renders empty state when there are no chapters", () => {
    render(
      <SceneNavigation
        project={mockProject}
        activeSceneId={null}
        onSceneSelect={vi.fn()}
        structure={[]}
        loading={false}
      />
    );

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No chapters yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add first chapter/i })).toBeInTheDocument();
  });

  it("renders chapters list when structure is present", () => {
    const structure: ChapterWithScenes[] = [
      {
        id: "c1",
        title: "Chapter 1",
        projectId: "p1",
        sequence: 1,
        volumeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        scenes: [],
      },
    ];

    render(
      <SceneNavigation
        project={mockProject}
        activeSceneId={null}
        onSceneSelect={vi.fn()}
        structure={structure}
        loading={false}
      />
    );

    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    expect(screen.getByText("Chapter 1")).toBeInTheDocument();
  });
});
