import { render, screen } from "@testing-library/react";
import { Profiler } from "react";
import { describe, expect, it, vi } from "vitest";

import { ToolPart } from "@/components/organisms/messages/parts/tool-part";
import type { ToolInvocation } from "@/lib/types";

// Mock ToolRenderer
vi.mock("@/components/organisms/messages/tool-renderer", () => ({
	ToolRenderer: () => <div data-testid="tool-renderer" />,
}));

describe("ToolPart", () => {
	const defaultPart: ToolInvocation = {
		state: "result",
		toolCallId: "123",
		toolName: "test-tool",
		args: { foo: "bar" },
		result: "success",
	};

	const defaultProps = {
		part: defaultPart,
		isReadonly: false,
	};

	it("renders tool renderer", () => {
		render(<ToolPart {...defaultProps} />);
		expect(screen.getByTestId("tool-renderer")).toBeDefined();
	});

	it("does not re-render if props are strictly equal", () => {
		let renderCount = 0;
		const onRender = () => {
			renderCount++;
		};

		const { rerender } = render(
			<Profiler id="ToolPart" onRender={onRender}>
				<ToolPart {...defaultProps} />
			</Profiler>,
		);

		const initialRenderCount = renderCount;

		rerender(
			<Profiler id="ToolPart" onRender={onRender}>
				<ToolPart {...defaultProps} />
			</Profiler>,
		);

		expect(renderCount).toBe(initialRenderCount);
	});

	it("does not re-render if part is deeply equal but new reference", () => {
		let renderCount = 0;
		const onRender = () => {
			renderCount++;
		};

		const { rerender } = render(
			<Profiler id="ToolPart" onRender={onRender}>
				<ToolPart {...defaultProps} />
			</Profiler>,
		);

		const initialRenderCount = renderCount;

		// Create a new object with identical content
		const newPart = { ...defaultPart, args: { ...defaultPart.args } };

		rerender(
			<Profiler id="ToolPart" onRender={onRender}>
				<ToolPart {...defaultProps} part={newPart} />
			</Profiler>,
		);

		expect(renderCount).toBe(initialRenderCount);
	});

	it("re-renders when part content changes", () => {
		let renderCount = 0;
		const onRender = () => {
			renderCount++;
		};

		const { rerender } = render(
			<Profiler id="ToolPart" onRender={onRender}>
				<ToolPart {...defaultProps} />
			</Profiler>,
		);

		const initialRenderCount = renderCount;

		// Change args content
		const changedPart = {
			...defaultPart,
			args: { foo: "baz" },
		};

		rerender(
			<Profiler id="ToolPart" onRender={onRender}>
				<ToolPart {...defaultProps} part={changedPart} />
			</Profiler>,
		);

		expect(renderCount).toBeGreaterThan(initialRenderCount);
	});

	it("re-renders when isReadonly toggles", () => {
		let renderCount = 0;
		const onRender = () => {
			renderCount++;
		};

		const { rerender } = render(
			<Profiler id="ToolPart" onRender={onRender}>
				<ToolPart {...defaultProps} />
			</Profiler>,
		);

		const initialRenderCount = renderCount;

		rerender(
			<Profiler id="ToolPart" onRender={onRender}>
				<ToolPart {...defaultProps} isReadonly={true} />
			</Profiler>,
		);

		expect(renderCount).toBeGreaterThan(initialRenderCount);
	});
});
