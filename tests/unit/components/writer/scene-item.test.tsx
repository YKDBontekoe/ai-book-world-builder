import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SceneItem } from "@/components/organisms/writer/left-sidebar/scene-item";
import * as sceneOps from "@/app/actions/scene-ops";
import * as writerOps from "@/app/actions/writer";

// Mock server actions
vi.mock("@/app/actions/scene-ops", () => ({
  updateSceneTitle: vi.fn(),
  duplicateScene: vi.fn(),
  deleteScene: vi.fn(),
}));

vi.mock("@/app/actions/writer", () => ({
  generateScene: vi.fn(),
}));

// Mock Sonner toast
vi.mock("sonner", () => ({
  toast: {
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("SceneItem", () => {
  const mockOnSelect = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockScene = {
    id: "s1",
    title: "Test Scene",
    sequence: 1,
    content: "Some content",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders scene title", () => {
    render(
      <SceneItem
        scene={mockScene}
        chapterId="c1"
        isActive={false}
        onSelect={mockOnSelect}
        onUpdate={mockOnUpdate}
      />
    );
    expect(screen.getByText("Test Scene")).toBeInTheDocument();
  });

  it("handles selection", () => {
    render(
      <SceneItem
        scene={mockScene}
        chapterId="c1"
        isActive={false}
        onSelect={mockOnSelect}
        onUpdate={mockOnUpdate}
      />
    );
    fireEvent.click(screen.getByText("Test Scene"));
    expect(mockOnSelect).toHaveBeenCalled();
  });

  it("shows empty indicator when content is missing", () => {
    const emptyScene = { ...mockScene, content: "" };
    render(
      <SceneItem
        scene={emptyScene}
        chapterId="c1"
        isActive={false}
        onSelect={mockOnSelect}
        onUpdate={mockOnUpdate}
      />
    );
    const indicator = screen.getByTitle("Empty Scene");
    expect(indicator).toBeInTheDocument();
  });
});
