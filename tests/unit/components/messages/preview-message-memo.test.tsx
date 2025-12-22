import { render } from "@testing-library/react";
import equal from "fast-deep-equal";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PreviewMessage } from "@/components/organisms/messages/message";

// Mock fast-deep-equal
vi.mock("fast-deep-equal", () => ({
	default: vi.fn((a, b) => JSON.stringify(a) === JSON.stringify(b)),
}));

// Mock child components
vi.mock("@/components/molecules/response", () => ({
	Response: ({ children }: { children: any }) => <div>{children}</div>,
}));
vi.mock("@/components/organisms/messages/message-actions", () => ({
	MessageActions: () => <div data-testid="message-actions" />,
}));
vi.mock("@/components/organisms/messages/message-streaming-sources", () => ({
	MessageStreamingSources: () => <div />,
}));
vi.mock("@/components/organisms/messages/message-usage", () => ({
	MessageUsage: () => <div />,
}));
vi.mock("@/components/organisms/messages/message-ui", () => ({
	MessageAttachments: () => <div />,
	MessageBubble: ({ children }: { children: any }) => <div>{children}</div>,
}));
vi.mock("@/components/organisms/messages/parts/parts-renderer", () => ({
	PartsRenderer: () => <div />,
}));

describe("PreviewMessage Memoization", () => {
	const defaultProps = {
		chatId: "chat-1",
		message: {
			id: "msg-1",
			role: "user" as const,
			content: "Hello",
			createdAt: new Date(),
			parts: [{ type: "text" as const, text: "Hello" }],
		},
		vote: undefined,
		isLoading: false,
		isLast: false,
		setMessages: vi.fn(),
		regenerate: vi.fn(),
		isReadonly: false,
		requiresScrollPadding: false,
	};

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should check deep equality when references are different but content is same", () => {
		const { rerender } = render(<PreviewMessage {...defaultProps} />);
		vi.clearAllMocks();

		// Rerender with NEW object reference but SAME content
		const newMessage = { ...defaultProps.message };
		rerender(<PreviewMessage {...defaultProps} message={newMessage} />);

		// Expect fast-deep-equal to be called for parts (since ref changed)
		expect(equal).toHaveBeenCalledWith(
			defaultProps.message.parts,
			newMessage.parts,
		);
	});

	it("OPTIMIZED: Should NOT check parts deep equality when message references are same", () => {
		const { rerender } = render(<PreviewMessage {...defaultProps} />);
		vi.clearAllMocks();

		// Rerender with SAME object reference
		rerender(<PreviewMessage {...defaultProps} />);

		// Should be called for vote check (maybe), but definitely NOT for parts
		expect(equal).not.toHaveBeenCalledWith(
			defaultProps.message.parts,
			defaultProps.message.parts,
		);
	});

	it("BUG FIX: Should check isLast property", () => {
		// We can't verify re-render directly easily without spy, but we can verify that
		// the memo function handles isLast diffs.
		// Given we are testing the component, we trust the code change.
		// But we can verify `equal` is NOT called if we change isLast,
		// because `prev.isLast !== next.isLast` returns false immediately.

		const { rerender } = render(<PreviewMessage {...defaultProps} />);
		vi.clearAllMocks();

		// Rerender with changed isLast
		rerender(<PreviewMessage {...defaultProps} isLast={true} />);

		// Because isLast check fails early, equal should NOT be called at all
		expect(equal).not.toHaveBeenCalled();
	});
});
