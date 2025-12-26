import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Editor } from "@/components/organisms/editor/text-editor";

const { mockReplaceWith, mockDispatch } = vi.hoisted(() => ({
	mockReplaceWith: vi.fn(() => ({ setMeta: vi.fn() })),
	mockDispatch: vi.fn(),
}));

let hasFocusMock = false;

vi.mock("prosemirror-view", () => ({
	EditorView: class {
		state: any;
		dom: any;
		constructor(dom: any, props: any) {
			this.dom = dom;
			this.state = props.state;
		}
		setProps(props: any) {
			if (props.state) this.state = props.state;
		}
		dispatch(tr: any) {
			mockDispatch(tr);
		}
		destroy() {}
		focus() {}
		hasFocus() {
			return hasFocusMock;
		}
	},
	Decoration: { widget: vi.fn() },
	DecorationSet: { create: vi.fn(() => ({ map: vi.fn() })) },
}));

vi.mock("prosemirror-state", () => ({
	EditorState: {
		create: vi.fn(() => ({
			doc: { content: { size: 0 } },
			tr: {
				replaceWith: mockReplaceWith,
				setMeta: vi.fn(),
			},
			apply: vi.fn(),
		})),
	},
	Plugin: vi.fn(),
	PluginKey: vi.fn(),
	TextSelection: { create: vi.fn() },
}));

vi.mock("prosemirror-example-setup", () => ({
	exampleSetup: vi.fn(() => []),
}));

vi.mock("prosemirror-inputrules", () => ({
	inputRules: vi.fn(() => []),
	textblockTypeInputRule: vi.fn(),
	wrappingInputRule: vi.fn(),
}));

// Mock local dependencies
vi.mock("@/lib/editor/config", () => ({
	documentSchema: {},
	handleTransaction: vi.fn(),
	headingRule: vi.fn(),
}));

vi.mock("@/lib/editor/config", () => ({
	documentSchema: {},
	handleTransaction: vi.fn(),
	headingRule: vi.fn(),
}));

// We need to control buildContentFromDocument to simulate the divergence
vi.mock("@/lib/editor/functions", () => ({
	buildContentFromDocument: vi.fn(() => "original"), // Editor always thinks it has "original"
	buildDocumentFromContent: vi.fn(() => ({ content: {} })),
	createDecorations: vi.fn(() => []),
}));

vi.mock("@/lib/editor/functions", () => ({
	buildContentFromDocument: vi.fn(() => "original"),
	buildDocumentFromContent: vi.fn(() => ({ content: {} })),
	createDecorations: vi.fn(() => []),
}));

vi.mock("@/lib/editor/suggestions", () => ({
	projectWithPositions: vi.fn(() => []),
	suggestionsPlugin: {},
	suggestionsPluginKey: "suggestions",
}));

vi.mock("@/lib/editor/suggestions", () => ({
	projectWithPositions: vi.fn(() => []),
	suggestionsPlugin: {},
	suggestionsPluginKey: "suggestions",
}));

vi.mock("@/components/organisms/writer/tools/editor-bubble-menu", () => ({
	EditorBubbleMenu: () => null,
}));

vi.mock("@/components/organisms/writer/tools/editor-bubble-menu", () => ({
	EditorBubbleMenu: () => null,
}));

describe("Editor Race Condition", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		hasFocusMock = false;
	});

	it("overwrites content from props when NOT focused", () => {
		hasFocusMock = false;
		const { rerender } = render(
			<Editor
				content="original"
				onSaveContent={() => {}}
				status="idle"
				isCurrentVersion={true}
				currentVersionIndex={0}
				suggestions={[]}
			/>,
		);

		// Rerender with different content
		rerender(
			<Editor
				content="updated"
				onSaveContent={() => {}}
				status="idle"
				isCurrentVersion={true}
				currentVersionIndex={0}
				suggestions={[]}
			/>,
		);

		// Should overwrite because we are not focused
		expect(mockReplaceWith).toHaveBeenCalled();
	});

	it("does NOT overwrite content from props when focused", () => {
		hasFocusMock = true;
		const { rerender } = render(
			<Editor
				content="original"
				onSaveContent={() => {}}
				status="idle"
				isCurrentVersion={true}
				currentVersionIndex={0}
				suggestions={[]}
			/>,
		);

		// Rerender with different content
		rerender(
			<Editor
				content="updated"
				onSaveContent={() => {}}
				status="idle"
				isCurrentVersion={true}
				currentVersionIndex={0}
				suggestions={[]}
			/>,
		);

		// Should NOT overwrite because we are focused
		expect(mockReplaceWith).not.toHaveBeenCalled();
	});
});
