import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Messages } from "@/components/organisms/messages/messages";
import type { ChatMessage } from "@/lib/types";
import type { Vote } from "@/lib/db/schema";

// Mock dependencies with relative paths matching the component imports
vi.mock("@/hooks/use-messages", () => ({
  useMessages: vi.fn(() => ({
    containerRef: { current: null },
    endRef: { current: null },
    isAtBottom: true,
    scrollToBottom: vi.fn(),
    hasSentMessage: false,
  })),
}));

vi.mock("@/components/organisms/messages/message", () => ({
  PreviewMessage: ({ vote }: { vote: Vote | undefined }) => (
    <div data-testid="preview-message" data-vote-id={vote?.id}>
      Message
    </div>
  ),
  ThinkingMessage: () => <div>Thinking</div>,
}));

vi.mock("@/components/organisms/messages/greeting", () => ({
  Greeting: () => <div>Greeting</div>,
}));

vi.mock("@/components/organisms/chat/suggested-actions", () => ({
  SuggestedActions: () => <div>SuggestedActions</div>,
}));

describe("Messages", () => {
  const mockProps = {
    chatId: "chat-1",
    status: "ready" as const,
    votes: undefined,
    messages: [],
    setMessages: vi.fn(),
    regenerate: vi.fn(),
    sendMessage: vi.fn(),
    isReadonly: false,
    isArtifactVisible: false,
    selectedModelId: "gpt-4" as any,
    selectedVisibilityType: "private" as any,
  };

  it("renders messages with correct votes", () => {
    const messages: ChatMessage[] = [
      { id: "msg-1", role: "user", content: "Hello", createdAt: new Date() },
      { id: "msg-2", role: "assistant", content: "Hi", createdAt: new Date() },
    ];
    const votes: Vote[] = [
      { id: "vote-1", messageId: "msg-2", isUpvoted: true, chatId: "chat-1", createdAt: new Date(), updatedAt: new Date() },
    ];

    render(<Messages {...mockProps} messages={messages} votes={votes} />);

    const messageElements = screen.getAllByTestId("preview-message");
    expect(messageElements).toHaveLength(2);

    // msg-1 has no vote
    expect(messageElements[0]).not.toHaveAttribute("data-vote-id");

    // msg-2 has vote-1
    expect(messageElements[1]).toHaveAttribute("data-vote-id", "vote-1");
  });

  it("handles undefined votes gracefully", () => {
    const messages: ChatMessage[] = [
      { id: "msg-1", role: "user", content: "Hello", createdAt: new Date() },
    ];

    render(<Messages {...mockProps} messages={messages} votes={undefined} />);

    const messageElements = screen.getAllByTestId("preview-message");
    expect(messageElements[0]).not.toHaveAttribute("data-vote-id");
  });
});
