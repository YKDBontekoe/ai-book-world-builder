import { render, screen } from "@testing-library/react";
import { Profiler } from "react";
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
		let renderCount = 0;
		const onRender = () => {
			renderCount++;
		};

		const { rerender } = render(
			<Profiler id="TextPart" onRender={onRender}>
				<TextPart {...defaultProps} />
			</Profiler>,
		);

		const initialRenderCount = renderCount;

		// Rerender with new message reference but identical text/role
		rerender(
			<Profiler id="TextPart" onRender={onRender}>
				<TextPart {...defaultProps} message={{ ...mockMessage }} />
			</Profiler>,
		);

		expect(renderCount).toBe(initialRenderCount); // Should not re-render
		expect(screen.getByTestId("message-bubble")).toBeDefined();
	});

	it("re-renders when text changes in view mode", () => {
		let renderCount = 0;
		const onRender = () => {
			renderCount++;
		};

		const { rerender } = render(
			<Profiler id="TextPart" onRender={onRender}>
				<TextPart {...defaultProps} />
			</Profiler>,
		);

		const initialRenderCount = renderCount;

		rerender(
			<Profiler id="TextPart" onRender={onRender}>
				<TextPart {...defaultProps} text="Different text" />
			</Profiler>,
		);

		expect(renderCount).toBeGreaterThan(initialRenderCount); // Should re-render
	});
});
