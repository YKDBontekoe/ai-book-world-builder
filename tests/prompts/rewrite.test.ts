import { expect, test } from "@playwright/test";
import { buildRewritePrompt } from "@/lib/editor/rewrite";

const selection = "The valley's wind whispered loudly.";

test.describe("rewrite prompt builder", () => {
	test("includes intent-specific instructions", () => {
		const prompt = buildRewritePrompt({ selection, intent: "rewrite" });

		expect(prompt).toContain("Rewrite the selection");
		expect(prompt).toContain(selection);
	});

	test("falls back to guidance when selection is empty", () => {
		const prompt = buildRewritePrompt({ selection: "   ", intent: "shorten" });

		expect(prompt).toContain("highlighted section");
	});
});
