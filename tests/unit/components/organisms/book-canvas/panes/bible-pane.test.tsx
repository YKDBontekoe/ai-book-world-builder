import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BiblePane } from "@/components/organisms/book-canvas/panes/bible-pane";
import * as BookCanvasContext from "@/components/organisms/book-canvas/book-canvas-context";
import * as QueryOptions from "@/lib/query-options";
import { useQuery } from "@tanstack/react-query";

// Mock dependencies
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("@/app/actions/entities", () => ({
  getEntities: vi.fn(),
}));

vi.mock("@/app/actions/project-stats", () => ({
  getRelationships: vi.fn(),
}));

// Mock child components that might cause issues or noise
vi.mock("@/components/organisms/book-canvas/panes/bible/source-materials-section", () => ({
  SourceMaterialsSection: () => <div data-testid="source-materials">Source Materials</div>,
}));

vi.mock("@/components/organisms/book-canvas/panes/bible/entity-group-section", () => ({
  EntityGroupSection: ({ group }: any) => (
    <div data-testid={`group-${group.type}`}>
      {group.label} ({group.entities.length})
    </div>
  ),
}));

describe("BiblePane", () => {
  const mockProjectId = "project-123";

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock BookCanvas context
    vi.spyOn(BookCanvasContext, "useBookCanvasLayout").mockReturnValue({
      projectId: mockProjectId,
    } as any);

    // Default useQuery mock to return loading state initially
    (useQuery as any).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
  });

  it("renders loading state initially", () => {
    render(<BiblePane />);
    expect(screen.getByText("Loading entities...")).toBeInTheDocument();
  });

  it("renders empty state when no entities found", async () => {
    (useQuery as any).mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<BiblePane />);

    // Should show "Build Your World" title from empty state
    expect(screen.getByText("Build Your World")).toBeInTheDocument();
  });

  it("renders entities grouped by type", async () => {
    const mockEntities = [
      { id: "1", name: "Hero", kind: "character", createdAt: "2023-01-01" },
      { id: "2", name: "Village", kind: "location", createdAt: "2023-01-01" },
    ];

    (useQuery as any).mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === "entities") {
        return { data: mockEntities, isLoading: false };
      }
      return { data: [], isLoading: false }; // relationships
    });

    render(<BiblePane />);

    expect(screen.getByTestId("group-character")).toHaveTextContent("Characters (1)");
    expect(screen.getByTestId("group-location")).toHaveTextContent("Locations (1)");
  });

  it("filters entities by search query", async () => {
    const mockEntities = [
      { id: "1", name: "Gandalf", kind: "character", createdAt: "2023-01-01" },
      { id: "2", name: "Frodo", kind: "character", createdAt: "2023-01-01" },
    ];

    (useQuery as any).mockImplementation(({ queryKey }: any) => {
        if (queryKey[0] === "entities") {
          return { data: mockEntities, isLoading: false };
        }
        return { data: [], isLoading: false }; // relationships
      });

      render(<BiblePane />);

      const searchInput = screen.getByPlaceholderText("Search entities...");
      fireEvent.change(searchInput, { target: { value: "Frodo" } });

      // Should show only Frodo
      expect(screen.getByTestId("group-character")).toHaveTextContent("Characters (1)");
  });
});
