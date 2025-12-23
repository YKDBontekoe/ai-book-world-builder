import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FloatingAssistant } from "@/components/organisms/chat/floating-assistant";

// Mock DB to prevent connection attempts
vi.mock("@/lib/db/drizzle", () => ({
  db: {
    query: {},
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock dependencies
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "project-123" }),
}));

vi.mock("usehooks-ts", () => ({
  useLocalStorage: () => ["chat-123", vi.fn()],
}));

// Mock DataStreamProvider
vi.mock("@/components/organisms/chat/data-stream-provider", () => ({
  DataStreamProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSetDataStream: () => ({ setDataStream: vi.fn() }),
}));

// Mock DataStreamHandler (separate import)
vi.mock("@/components/organisms/messages/data-stream-handler", () => ({
  DataStreamHandler: () => null,
}));

// Mock FloatingChat
vi.mock("@/components/organisms/chat/floating-chat", () => ({
  FloatingChat: () => <div data-testid="floating-chat-mock">Mock Chat</div>,
}));

// Mock Models
vi.mock("@/lib/ai/models", () => ({
  chatModels: [],
  DEFAULT_CHAT_MODEL: "model-1",
  ChatModelId: "string",
  ChatModel: "object",
}));

// Mock GlassCard
vi.mock("@/components/molecules/glass-card", () => ({
  GlassCard: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div className={`glass-card ${className}`}>{children}</div>
  ),
}));

// Mock Framer Motion
vi.mock("framer-motion", () => {
  const motion = (Component: any) => (props: any) => <Component {...props} />;
  // Add common HTML elements used as motion.div, motion.button
  (motion as any).div = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  (motion as any).button = ({ children, ...props }: any) => <button {...props}>{children}</button>;
  return {
    motion,
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe("FloatingAssistant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the trigger button initially", () => {
    render(<FloatingAssistant />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("opens the chat window when clicked", () => {
    render(<FloatingAssistant />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("Assistant")).toBeInTheDocument();
    expect(screen.getByTestId("floating-chat-mock")).toBeInTheDocument();
  });

  it("toggles between floating and sidebar modes", () => {
    render(<FloatingAssistant />);
    fireEvent.click(screen.getByRole("button"));

    const toggleBtn = screen.getByTitle("Dock to Side");
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByTitle("Float")).toBeInTheDocument();
  });

  it("closes when close button is clicked", () => {
    render(<FloatingAssistant />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Assistant")).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    // Trigger is gone. Header buttons: 1. Toggle, 2. Close.
    fireEvent.click(buttons[1]);

    expect(screen.queryByText("Assistant")).not.toBeInTheDocument();
  });

  it("opens via keyboard shortcut (Cmd+J)", () => {
    render(<FloatingAssistant />);
    fireEvent.keyDown(window, { key: "j", metaKey: true });
    expect(screen.getByText("Assistant")).toBeInTheDocument();
  });
});
