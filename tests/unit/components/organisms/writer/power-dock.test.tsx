import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PowerDock } from "@/components/organisms/writer/power-dock";
import { ToolType } from "@/components/organisms/writer/tools/tool-strategies";

// Hoist mock functions
const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
}));

// Mock dependencies
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock("usehooks-ts", () => {
  let store: any[] = [];
  return {
    useLocalStorage: vi.fn(() => [
      store,
      (value: any) => {
        if (typeof value === "function") {
          store = value(store);
        } else {
          store = value;
        }
      },
    ]),
  };
});

// Mock UI components
vi.mock("@/components/atoms/textarea", () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

vi.mock("@/components/molecules/glass-card", () => ({
  GlassCard: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock("@/components/atoms/tooltip", () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
  TooltipProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/components/atoms/separator", () => ({
  Separator: () => <div data-testid="separator" />,
}));

vi.mock("@/components/atoms/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div role="menuitem" onClick={onClick} data-testid="history-item">
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <div />,
}));

// Mock contexts
const mockWriterControl = {
  editorActions: {
    undo: vi.fn(),
    redo: vi.fn(),
    insertText: vi.fn(),
    getSelection: vi.fn(),
  },
  toggleChat: vi.fn(),
  isChatOpen: false,
  toggleSpotlight: vi.fn(),
  isSpotlightOpen: false,
};

const mockWriterContext = {
  project: { id: "p1" },
  structure: [],
  activeChapterId: "c1",
  activeSceneId: "s1",
};

const mockWriterLayoutContext = {
  viewMode: "standard",
};

vi.mock("@/components/organisms/writer/writer-control-context", () => ({
  useWriterControl: () => mockWriterControl,
}));

vi.mock("@/components/organisms/writer/writer-context", () => ({
  useWriterContext: () => mockWriterContext,
}));

vi.mock("@/components/organisms/writer/writer-layout-context", () => ({
  useWriterLayoutContext: () => mockWriterLayoutContext,
}));

// Mock tool strategies
vi.mock("@/components/organisms/writer/tools/tool-strategies", () => ({
  toolStrategies: {
    write: { execute: mockExecute },
    rewrite: { execute: mockExecute },
    expand: { execute: mockExecute },
    critique: { execute: mockExecute },
    consistency: { execute: mockExecute },
    lore: { execute: mockExecute },
    search: { execute: mockExecute },
  },
}));

describe("PowerDock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue({ success: true, result: "Result text" });
  });

  it("renders correctly in default mode", () => {
    render(<PowerDock />);
    expect(screen.getByLabelText("Spotlight")).toBeInTheDocument();
    expect(screen.getByLabelText("AI Tools")).toBeInTheDocument();
  });

  it("switches to tools mode", () => {
    render(<PowerDock />);
    const toolsButton = screen.getByLabelText("AI Tools");
    fireEvent.click(toolsButton);
    expect(screen.getByLabelText("Batch Write")).toBeInTheDocument();
  });

  it("selects a tool and enters input mode", () => {
    render(<PowerDock />);
    fireEvent.click(screen.getByLabelText("AI Tools"));
    fireEvent.click(screen.getByLabelText("Batch Write"));
    expect(screen.getByPlaceholderText("Instructions (e.g., 'Make it tense')")).toBeInTheDocument();
  });

  it("saves command to history on success", async () => {
    render(<PowerDock />);
    // Navigate to tool
    fireEvent.click(screen.getByLabelText("AI Tools"));
    fireEvent.click(screen.getByLabelText("Batch Write"));

    // Type input
    const input = screen.getByPlaceholderText("Instructions (e.g., 'Make it tense')");
    fireEvent.change(input, { target: { value: "Test command" } });

    // Execute
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith(expect.anything(), "Test command");
    });

    // Check if "Test command" appears in the history items (DropdownMenuItem)
    // We added data-testid="history-item" to the mock
    const historyItems = screen.getAllByTestId("history-item");
    expect(historyItems).toHaveLength(1);
    expect(historyItems[0]).toHaveTextContent("Test command");
  });
});
