import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GenerationView } from "../../../components/generation/generation-view";
import { Project } from "../../../lib/db/schema";

// Mock actions
vi.mock("../../../app/(chat)/projects/[id]/generate/actions", () => ({
  startGeneration: vi.fn(),
}));

// Mock dashboard
vi.mock("../../../components/generation/generation-dashboard", () => ({
  GenerationDashboard: () => <div data-testid="dashboard">Dashboard</div>,
}));

// Mock settings form
vi.mock("../../../components/generation/generation-settings-form", () => ({
  GenerationSettingsForm: () => <div data-testid="settings-form">Settings Form</div>,
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Loader2: () => <span>Loading</span>,
  Play: () => <span>Play</span>,
  Sparkles: () => <span>Sparkles</span>,
  ArrowLeft: () => <span>ArrowLeft</span>,
}));

describe("GenerationView", () => {
  const mockProject: Project = {
    id: "p1",
    name: "Test Project",
    userId: "u1",
    createdAt: new Date(),
    updatedAt: new Date(),
    visibility: "private",
    folders: [],
  } as unknown as Project;

  it("renders settings form initially", () => {
    render(<GenerationView project={mockProject} />);
    expect(screen.getByText("New Generation")).toBeDefined();
    expect(screen.getByTestId("settings-form")).toBeDefined();
    expect(screen.getByText("Ready to Write")).toBeDefined();
  });

  it("renders dashboard if generationId exists", () => {
    render(<GenerationView project={mockProject} existingGenerationId="gen1" />);
    expect(screen.getByTestId("dashboard")).toBeDefined();
    expect(screen.queryByText("New Generation")).toBeNull();
  });
});
