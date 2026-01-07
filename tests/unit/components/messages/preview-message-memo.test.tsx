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

		// Rerender with NEW object reference AND NEW parts reference but SAME content
		const newMessage = {
			...defaultProps.message,
			parts: [...defaultProps.message.parts], // New array reference
		};
		rerender(<PreviewMessage {...defaultProps} message={newMessage} />);

		// Expect fast-deep-equal to be called for parts (since ref changed)
		expect(equal).toHaveBeenCalledWith(
			defaultProps.message.parts,
			newMessage.parts,
		);
	});

	it("OPTIMIZED: Should NOT check parts deep equality when parts references are same", () => {
		const { rerender } = render(<PreviewMessage {...defaultProps} />);
		vi.clearAllMocks();

		// Rerender with NEW message object but SAME parts reference
		// This simulates typical React state updates where some props change but deeply nested stable objects don't
		const newMessage = { ...defaultProps.message };
		rerender(<PreviewMessage {...defaultProps} message={newMessage} />);

		// Should NOT be called for parts because references match
		// It WILL be called for 'vote' which is undefined/undefined
		expect(equal).not.toHaveBeenCalledWith(
			defaultProps.message.parts,
			newMessage.parts,
		);
	});

	it("BUG FIX: Should check isLast property", () => {
		const { rerender } = render(<PreviewMessage {...defaultProps} />);
		vi.clearAllMocks();

		// Rerender with changed isLast
		rerender(<PreviewMessage {...defaultProps} isLast={true} />);

		// Because isLast check fails early, equal should NOT be called at all
		expect(equal).not.toHaveBeenCalled();
	});

	it("OPTIMIZED: Should check content equality early", () => {
		const { rerender } = render(<PreviewMessage {...defaultProps} />);
		vi.clearAllMocks();

		// Rerender with changed content
		const newMessage = { ...defaultProps.message, content: "New Content" };
		rerender(<PreviewMessage {...defaultProps} message={newMessage} />);

		// Content check is strict equality, so it returns false early.
		// equal() for parts should NOT be called because content changed first.
		expect(equal).not.toHaveBeenCalledWith(
			defaultProps.message.parts,
			newMessage.parts,
		);
	});
});
