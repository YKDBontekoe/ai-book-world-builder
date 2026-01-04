import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ToolPart } from "@/components/organisms/messages/parts/tool-part";

// Mock ToolRenderer
vi.mock("@/components/organisms/messages/tool-renderer", () => ({
	ToolRenderer: () => <div data-testid="tool-renderer" />,
}));

describe("ToolPart", () => {
	const defaultProps = {
		part: { type: "tool-test", toolCallId: "123", args: { foo: "bar" } },
		isReadonly: false,
	};

	it("renders tool renderer", () => {
		render(<ToolPart {...defaultProps} />);
		expect(screen.getByTestId("tool-renderer")).toBeDefined();
	});

	it("handles updates correctly", () => {
		const { rerender } = render(<ToolPart {...defaultProps} />);
		rerender(<ToolPart {...defaultProps} isReadonly={true} />);
		expect(screen.getByTestId("tool-renderer")).toBeDefined();
	});
});
