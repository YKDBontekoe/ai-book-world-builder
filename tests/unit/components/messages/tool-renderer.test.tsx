import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolRenderer } from "../../../../components/messages/tool-renderer";

// Mock the child components
vi.mock("@/components/document-preview", () => ({
	DocumentPreview: ({ result }: any) => (
		<div data-testid="document-preview">{result.title}</div>
	),
}));

vi.mock("@/components/elements/tool", () => ({
	Tool: ({ children }: any) => <div>{children}</div>,
	ToolHeader: ({ type }: any) => <div>Header: {type}</div>,
	ToolContent: ({ children }: any) => <div>{children}</div>,
	ToolInput: ({ input }: any) => <div>Input: {JSON.stringify(input)}</div>,
	ToolOutput: ({ output }: any) => <div>Output: {output}</div>,
}));

vi.mock("@/components/chat/generic-tool", () => ({
	GenericTool: ({ toolName }: any) => (
		<div data-testid="generic-tool">{toolName}</div>
	),
}));

vi.mock("@/components/chat/widgets/entity-widget", () => ({
	EntityWidget: () => <div data-testid="entity-widget">EntityWidget</div>,
}));

vi.mock("@/components/chat/widgets/entity-proposal", () => ({
	EntityProposal: () => <div data-testid="entity-proposal">EntityProposal</div>,
}));

vi.mock("@/components/chat/widgets/scene-widget", () => ({
	SceneWidget: () => <div data-testid="scene-widget">SceneWidget</div>,
}));

vi.mock("@/components/chat/widgets/generation-widget", () => ({
	GenerationWidget: () => (
		<div data-testid="generation-widget">GenerationWidget</div>
	),
}));

describe("ToolRenderer", () => {
	it("renders DocumentPreview for tool-createDocument", () => {
		const part = {
			type: "tool-createDocument",
			toolCallId: "call_123",
			state: "result",
			args: {},
			toolName: "createDocument",
			output: { title: "Test Doc", content: "Content" },
		} as any;

		render(<ToolRenderer part={part} isReadonly={false} />);

		expect(screen.getByTestId("document-preview")).toHaveTextContent(
			"Test Doc",
		);
	});

	it("renders GenericTool for unknown tool", () => {
		const part = {
			type: "tool-unknownTool",
			toolCallId: "call_456",
			state: "result",
			args: {},
			toolName: "unknownTool",
			output: {},
		} as any;

		render(<ToolRenderer part={part} isReadonly={false} />);

		expect(screen.getByTestId("generic-tool")).toHaveTextContent("unknownTool");
	});

	it("returns null for non-tool parts", () => {
		// @ts-expect-error
		const { container } = render(
			<ToolRenderer part={{ type: "text", text: "hi" }} isReadonly={false} />,
		);
		expect(container).toBeEmptyDOMElement();
	});
});
