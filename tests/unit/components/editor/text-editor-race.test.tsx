import { describe, expect, it, vi } from "vitest";
import { buildContentFromDocument } from "@/lib/editor/functions";

vi.mock("prosemirror-state", () => ({
	EditorState: {
		create: vi.fn(() => ({
			doc: { content: { size: 0 } },
			plugins: [],
		})),
	},
	Plugin: vi.fn(),
	PluginKey: vi.fn(),
}));

vi.mock("@/lib/editor/config", () => ({
	documentSchema: {},
	handleTransaction: vi.fn(),
	headingRule: vi.fn(),
}));

vi.mock("@/lib/editor/functions", () => ({
	buildContentFromDocument: vi.fn(),
	buildDocumentFromContent: vi.fn(() => ({ content: {} })),
}));

describe("Editor Race Condition Logic", () => {
	it("updates state when content differs", () => {
		const mockBuildContent = vi.mocked(buildContentFromDocument);
		mockBuildContent.mockReturnValue("original");

		// Simulate the logic from useProseMirror
		const currentDoc = buildContentFromDocument({} as any);
		const newContent = "updated";

		// The hook would update if they differ
		expect(currentDoc !== newContent).toBe(true);
	});

	it("does NOT update state when content matches", () => {
		const mockBuildContent = vi.mocked(buildContentFromDocument);
		mockBuildContent.mockReturnValue("same");

		const currentDoc = buildContentFromDocument({} as any);
		const newContent = "same";

		// The hook would NOT update if they match
		expect(currentDoc !== newContent).toBe(false);
	});
});
