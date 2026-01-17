import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeneratorPane } from "@/components/organisms/book-canvas/panes/generator-pane";
import * as BookCanvasContext from "@/components/organisms/book-canvas/book-canvas-context";
import * as StoryGenerationActions from "@/app/actions/story-generation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the server actions
vi.mock("@/app/actions/story-generation", () => ({
  generateBookPlan: vi.fn(),
  createBookFromPlan: vi.fn(),
}));

// Mock the context
vi.mock("@/components/organisms/book-canvas/book-canvas-context", () => ({
  useBookCanvasLayout: vi.fn(),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Setup QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("GeneratorPane", () => {
  const mockProjectId = "project-123";
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
    (BookCanvasContext.useBookCanvasLayout as any).mockReturnValue({
      projectId: mockProjectId,
    });
  });

  it("renders the initial form state", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GeneratorPane />
      </QueryClientProvider>
    );

    expect(screen.getByText("Book Generator")).toBeInTheDocument();
    expect(screen.getByLabelText(/What is your story about?/i)).toBeInTheDocument();
    expect(screen.getByText("Generate Plan")).toBeInTheDocument();
  });

  it("shows empty state when no project is selected", () => {
    (BookCanvasContext.useBookCanvasLayout as any).mockReturnValue({
      projectId: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <GeneratorPane />
      </QueryClientProvider>
    );

    expect(screen.getByText("No Project Selected")).toBeInTheDocument();
  });

  it("calls generateBookPlan when form is submitted", async () => {
    const mockPlan = {
      title: "Test Book",
      logline: "A test logline",
      synopsis: "Test synopsis",
      chapters: [
        { title: "Chapter 1", summary: "Summary 1" },
      ],
    };

    (StoryGenerationActions.generateBookPlan as any).mockResolvedValue({
      success: true,
      plan: mockPlan,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <GeneratorPane />
      </QueryClientProvider>
    );

    // Fill in the prompt
    const textarea = screen.getByLabelText(/What is your story about?/i);
    fireEvent.change(textarea, { target: { value: "A test story" } });

    // Click generate
    const generateBtn = screen.getByText("Generate Plan");
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(StoryGenerationActions.generateBookPlan).toHaveBeenCalledWith(
        "A test story",
        expect.objectContaining({ pov: "Third Person" }),
        undefined
      );
    });

    // Verify the plan is displayed
    await waitFor(() => {
      expect(screen.getByText("Test Book")).toBeInTheDocument();
      expect(screen.getByText("A test logline")).toBeInTheDocument();
      expect(screen.getByText("Chapter 1: Chapter 1")).toBeInTheDocument();
    });
  });

  it("calls createBookFromPlan when applying the plan", async () => {
    const mockPlan = {
      title: "Test Book",
      logline: "A test logline",
      synopsis: "Test synopsis",
      chapters: [
        { title: "Chapter 1", summary: "Summary 1" },
      ],
    };

    (StoryGenerationActions.generateBookPlan as any).mockResolvedValue({
      success: true,
      plan: mockPlan,
    });

    (StoryGenerationActions.createBookFromPlan as any).mockResolvedValue({
      success: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <GeneratorPane />
      </QueryClientProvider>
    );

    // Fill and generate first
    fireEvent.change(screen.getByLabelText(/What is your story about?/i), {
      target: { value: "A test story" },
    });
    fireEvent.click(screen.getByText("Generate Plan"));

    // Wait for plan to appear
    await waitFor(() => {
      expect(screen.getByText("Create Book")).toBeInTheDocument();
    });

    // Click create
    fireEvent.click(screen.getByText("Create Book"));

    await waitFor(() => {
      expect(StoryGenerationActions.createBookFromPlan).toHaveBeenCalledWith(
        mockProjectId,
        mockPlan,
        expect.objectContaining({ pov: "Third Person" })
      );
    });
  });
});
