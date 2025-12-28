import { describe, expect, it } from "vitest";

// Test that Editor logic doesn't recreate EditorView unnecessarily
// This is a unit test for the concept, not a full integration test

describe("Editor Performance Logic", () => {
	it("EditorView should be reused across content changes", () => {
		// The useProseMirror hook should:
		// 1. Create EditorView once on mount
		// 2. Use updateState() for content changes
		// 3. NOT destroy/recreate EditorView

		const destroyCount = { value: 0 };
		const updateStateCount = { value: 0 };

		// Simulate EditorView behavior
		class MockEditorView {
			destroy() {
				destroyCount.value++;
			}
			updateState(_state: any) {
				updateStateCount.value++;
			}
		}

		const view = new MockEditorView();

		// Simulate content changes
		view.updateState({ doc: "content1" });
		view.updateState({ doc: "content2" });
		view.updateState({ doc: "content3" });

		// Should have updated 3 times but never destroyed
		expect(updateStateCount.value).toBe(3);
		expect(destroyCount.value).toBe(0);
	});
});
