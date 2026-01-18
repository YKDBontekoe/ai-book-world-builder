import { describe, expect, it } from "vitest";
import { smartTruncate } from "@/lib/services/story/story-context-builder";

describe("smartTruncate", () => {
	it("returns text as is if length is within limit", () => {
		const text = "Short text.";
		expect(smartTruncate(text, 100)).toBe("Short text.");
	});

	it("truncates text to limit if no sentence boundary is found", () => {
		const text = "abcdefghijklmnopqrstuvwxyz";
		// Limit 10 -> 'qrstuvwxyz'
		expect(smartTruncate(text, 10)).toBe("qrstuvwxyz");
	});

	it("truncates at the first sentence boundary after the cutoff", () => {
		// Length: 50
		// "First sentence. Second sentence. Third sentence."
		const text = "First sentence. Second sentence. Third sentence.";

		// We want last 25 chars.
		// Length is 48. 48 - 25 = 23.
		// "First sentence. Second " -> 23 chars.
		// Text at 23 is "s" of "sentence".
		// We extract suffix of 25 chars: "cond sentence. Third sentence."
		// It should find ". " after "sentence".
		// Actually, my logic was: find boundary in the candidate.

		// Candidate: "cond sentence. Third sentence."
		// First boundary: ". " after "sentence".
		// Should return "Third sentence."

		const result = smartTruncate(text, 25);
		expect(result).toBe("Third sentence.");
	});

	it("handles newlines as boundaries", () => {
		const text = "Line 1.\nLine 2.\nLine 3.";
		// limit to include part of Line 2 and full Line 3.
		// Line 3 is 7 chars. Line 2 is 7 chars.
		// Total 23 chars.
		// limit 12 chars -> ".\nLine 3."
		// boundary is \n.
		const result = smartTruncate(text, 12);
		expect(result).toBe("Line 3.");
	});

	it("falls back to space if no sentence punctuation", () => {
		const text = "word1 word2 word3 word4 word5";
		// limit to last 2 words roughly. "word4 word5" is 11 chars.
		// limit 13 chars -> "3 word4 word5"
		// space after 3.
		const result = smartTruncate(text, 13);
		expect(result).toBe("word4 word5");
	});

	it("trims the result", () => {
		const text = "Sentence one.   Sentence two.";
		// limit 15; // "  Sentence two."
		// boundary not found (no . ? ! in the prefix part of candidate which is just spaces?)
		// Wait, candidate is "  Sentence two."
		// No punctuation inside.
		// Space is at index 0.
		const result = smartTruncate(text, 15);
		expect(result).toBe("Sentence two.");
	});
});
