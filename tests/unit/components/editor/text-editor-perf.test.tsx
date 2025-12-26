import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Editor } from "@/components/organisms/editor/text-editor";

const { mockDestroy } = vi.hoisted(() => ({
	mockDestroy: vi.fn(),
}));

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
		dispatch() {}
		destroy() {
			mockDestroy();
		}
		focus() {}
		hasFocus() {
			return false;
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
				replaceWith: vi.fn(() => ({ setMeta: vi.fn() })),
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

vi.mock("@/lib/editor/functions", () => ({
	buildContentFromDocument: vi.fn(() => ""),
	buildDocumentFromContent: vi.fn(() => ({ content: {} })),
	createDecorations: vi.fn(() => []),
}));

vi.mock("@/lib/editor/suggestions", () => ({
	projectWithPositions: vi.fn(() => []),
	suggestionsPlugin: {},
	suggestionsPluginKey: "suggestions",
}));

vi.mock("@/components/organisms/writer/tools/editor-bubble-menu", () => ({
	EditorBubbleMenu: () => null,
}));

describe("Editor Performance", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("does NOT destroy EditorView when content changes", () => {
		const { rerender } = render(
			<Editor
				content="initial"
				onSaveContent={() => {}}
				status="idle"
				isCurrentVersion={true}
				currentVersionIndex={0}
				suggestions={[]}
			/>,
		);

		// Clear initial mount call if Strict Mode is on (mount -> unmount -> mount)
		// Or if normal mount doesn't call destroy (it shouldn't)
		mockDestroy.mockClear();

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

		// Should NOT have called destroy
		expect(mockDestroy).not.toHaveBeenCalled();
	});
});
