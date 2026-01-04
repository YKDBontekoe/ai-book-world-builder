import { render, screen } from "@testing-library/react";
import { Profiler } from "react";
import { describe, expect, it, vi } from "vitest";

import { ReasoningPart } from "@/components/organisms/messages/parts/reasoning-part";

// Mock MessageReasoning
vi.mock("@/components/organisms/messages/message-reasoning", () => ({
	MessageReasoning: ({
		reasoning,
		isLoading,
	}: { reasoning: string; isLoading: boolean }) => (
		<div data-testid="message-reasoning" data-loading={isLoading}>
			{reasoning}
		</div>
	),
}));

describe("ReasoningPart", () => {
	it("renders reasoning content", () => {
		render(<ReasoningPart isLoading={false} reasoning="Thinking..." />);
		expect(screen.getByTestId("message-reasoning")).toHaveTextContent(
			"Thinking...",
		);
	});

	it("returns null if reasoning is empty", () => {
		const { container } = render(
			<ReasoningPart isLoading={false} reasoning="" />,
		);
		expect(container).toBeEmptyDOMElement();
	});

	it("renders loading state correctly", () => {
		render(<ReasoningPart isLoading={true} reasoning="Thinking..." />);
		const element = screen.getByTestId("message-reasoning");
		expect(element).toHaveAttribute("data-loading", "true");
	});

	it("does not re-render if props are stable", () => {
		let renderCount = 0;
		const onRender = () => {
			renderCount++;
		};

		const props = { isLoading: false, reasoning: "Thinking..." };
		const { rerender } = render(
			<Profiler id="ReasoningPart" onRender={onRender}>
				<ReasoningPart {...props} />
			</Profiler>,
		);

		const initialRenderCount = renderCount;

		// Rerender with identical props
		rerender(
			<Profiler id="ReasoningPart" onRender={onRender}>
				<ReasoningPart {...props} />
			</Profiler>,
		);

		expect(renderCount).toBe(initialRenderCount);
	});

	it("re-renders when reasoning changes", () => {
		let renderCount = 0;
		const onRender = () => {
			renderCount++;
		};

		const { rerender } = render(
			<Profiler id="ReasoningPart" onRender={onRender}>
				<ReasoningPart isLoading={false} reasoning="Initial" />
			</Profiler>,
		);

		const initialRenderCount = renderCount;

		rerender(
			<Profiler id="ReasoningPart" onRender={onRender}>
				<ReasoningPart isLoading={false} reasoning="Updated" />
			</Profiler>,
		);

		expect(renderCount).toBeGreaterThan(initialRenderCount);
		expect(screen.getByTestId("message-reasoning")).toHaveTextContent(
			"Updated",
		);
	});

	it("handles very long reasoning content", () => {
		const longText = "a".repeat(1000);
		render(<ReasoningPart isLoading={false} reasoning={longText} />);
		expect(screen.getByTestId("message-reasoning")).toHaveTextContent(longText);
	});
});
