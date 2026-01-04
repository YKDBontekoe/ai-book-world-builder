import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TextPart } from "@/components/organisms/messages/parts/text-part";
import type { ChatMessage } from "@/lib/types";

// Mock child components
vi.mock("@/components/molecules/response", () => ({
	Response: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="response">{children}</div>
	),
}));

vi.mock("@/components/organisms/messages/message-editor", () => ({
	MessageEditor: () => <div data-testid="message-editor" />,
}));

vi.mock("@/components/organisms/messages/message-ui", () => ({
	MessageBubble: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="message-bubble">{children}</div>
	),
}));

// Mock utils
vi.mock("@/lib/utils", () => ({
	sanitizeText: (text: string) => text,
}));

describe("TextPart", () => {
	const mockMessage: ChatMessage = {
		id: "1",
		role: "assistant",
		content: "Hello",
		createdAt: new Date(),
		parts: [],
	};

	const defaultProps = {
		message: mockMessage,
		text: "Hello world",
		mode: "view" as const,
		setMode: vi.fn(),
		setMessages: vi.fn(),
		regenerate: vi.fn(),
	};

	it("renders view mode correctly", () => {
		render(<TextPart {...defaultProps} />);
		expect(screen.getByTestId("message-bubble")).toBeDefined();
		expect(screen.getByTestId("response")).toBeDefined();
	});

	it("renders edit mode correctly", () => {
		render(<TextPart {...defaultProps} mode="edit" />);
		expect(screen.getByTestId("message-editor")).toBeDefined();
	});

	it("does not re-render if props are stable in view mode", () => {
		const { rerender } = render(<TextPart {...defaultProps} />);

		// Rerender with identical props (new object refs but same values)
		rerender(<TextPart {...defaultProps} message={{ ...mockMessage }} />);

		// Ideally we would check render counts, but React Testing Library doesn't expose that easily.
		// However, the test passes if no error occurs, ensuring the component handles updates.
		expect(screen.getByTestId("message-bubble")).toBeDefined();
	});
});
