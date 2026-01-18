import { describe, expect, it } from "vitest";
import { analyzeWritingStyle } from "@/lib/services/analysis/style-analytics";

describe("analyzeWritingStyle", () => {
	it("returns neutral/mixed metrics for empty or short content", () => {
		const result = analyzeWritingStyle("Too short");
		expect(result).toEqual({
			tone: "neutral",
			voice: "mixed",
			sentenceVariety: "medium",
			descriptiveLevel: "medium",
		});
	});

	it("detects formal tone", () => {
		const text =
			"Therefore, we must proceed with caution. Furthermore, the evidence suggests a strong correlation. Consequently, the results are significant.";
		// Need 50+ chars
		const longText = `${text} ${text} ${text}`;
		const result = analyzeWritingStyle(longText);
		expect(result.tone).toBe("formal");
	});

	it("detects casual tone", () => {
		const text =
			"I'm gonna go to the store. Wanna come? Yeah, it'll be fun. Okay, see ya.";
		const longText = `${text} ${text} ${text}`;
		const result = analyzeWritingStyle(longText);
		expect(result.tone).toBe("casual");
	});

	it("detects passive voice", () => {
		const text =
			"The ball was thrown by the boy. The dinner is being cooked by mom. The car was driven by dad.";
		const longText = `${text} ${text} ${text}`;
		const result = analyzeWritingStyle(longText);
		expect(result.voice).toBe("passive");
	});
});
