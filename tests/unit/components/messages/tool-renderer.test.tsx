import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolRenderer } from "@/components/organisms/messages/tool-renderer";

vi.mock("next/dynamic", async () => {
	const React = await import("react");
	return {
		default: (loader: () => Promise<any>, options: any) => {
			const DynamicComponent = (props: any) => {
				const [Component, setComponent] = React.useState<any>(null);

				React.useEffect(() => {
					let mounted = true;
					loader().then((component) => {
						if (mounted) {
							setComponent(() => component);
						}
					});
					return () => {
						mounted = false;
					};
				}, []);

				if (!Component) {
					return options?.loading ? <options.loading /> : null;
				}
				return <Component {...props} />;
			};
			return DynamicComponent;
		},
	};
});

// Mock the child components
vi.mock("@/components/atoms/skeleton", () => ({
	Skeleton: () => <div data-testid="skeleton">Skeleton</div>,
}));

vi.mock("@/components/organisms/document/document-preview", () => ({
	DocumentPreview: ({ result }: any) => (
		<div data-testid="document-preview">{result.title}</div>
	),
}));

vi.mock("@/components/molecules/tool", () => ({
	Tool: ({ children }: any) => <div>{children}</div>,
	ToolHeader: ({ type }: any) => <div>Header: {type}</div>,
	ToolContent: ({ children }: any) => <div>{children}</div>,
	ToolInput: ({ input }: any) => <div>Input: {JSON.stringify(input)}</div>,
	ToolOutput: ({ output }: any) => <div>Output: {output}</div>,
}));

vi.mock("@/components/organisms/chat/generic-tool", () => ({
	GenericTool: ({ toolName }: any) => (
		<div data-testid="generic-tool">{toolName}</div>
	),
}));

vi.mock("@/components/organisms/chat/widgets/entity-widget", () => ({
	EntityWidget: () => <div data-testid="entity-widget">EntityWidget</div>,
}));

vi.mock("@/components/organisms/chat/widgets/entity-proposal", () => ({
	EntityProposal: () => <div data-testid="entity-proposal">EntityProposal</div>,
}));

vi.mock("@/components/organisms/chat/widgets/scene-widget", () => ({
	SceneWidget: () => <div data-testid="scene-widget">SceneWidget</div>,
}));

vi.mock("@/components/organisms/chat/widgets/generation-widget", () => ({
	GenerationWidget: () => (
		<div data-testid="generation-widget">GenerationWidget</div>
	),
}));

describe("ToolRenderer", () => {
	it("renders DocumentPreview for tool-createDocument", async () => {
		const part = {
			type: "tool-createDocument",
			toolCallId: "call_123",
			state: "result",
			args: {},
			toolName: "createDocument",
			output: { title: "Test Doc", content: "Content" },
		} as any;

		render(<ToolRenderer part={part} isReadonly={false} />);

		expect(
			await screen.findByTestId("document-preview", {}, { timeout: 3000 }),
		).toHaveTextContent("Test Doc");
	});

	it("renders GenericTool for unknown tool", async () => {
		const part = {
			type: "tool-unknownTool",
			toolCallId: "call_456",
			state: "result",
			args: {},
			toolName: "unknownTool",
			output: {},
		} as any;

		render(<ToolRenderer part={part} isReadonly={false} />);

		expect(
			await screen.findByTestId("generic-tool", {}, { timeout: 3000 }),
		).toHaveTextContent("unknownTool");
	});

	it("returns null for non-tool parts", () => {
		const { container } = render(
			<ToolRenderer part={{ type: "text", text: "hi" }} isReadonly={false} />,
		);
		expect(container).toBeEmptyDOMElement();
	});
});
