import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReasoningPart } from "@/components/organisms/messages/parts/reasoning-part";

// Mock MessageReasoning
vi.mock("@/components/organisms/messages/message-reasoning", () => ({
	MessageReasoning: ({ reasoning }: { reasoning: string }) => (
		<div data-testid="message-reasoning">{reasoning}</div>
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
});
