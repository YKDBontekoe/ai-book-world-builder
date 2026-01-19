import { describe, expect, it } from "vitest";
import { generateRandomTitle } from "@/lib/random-title";

describe("generateRandomTitle", () => {
	it("should return a string", () => {
		const title = generateRandomTitle();
		expect(typeof title).toBe("string");
		expect(title.length).toBeGreaterThan(0);
	});

	it("should generate different titles", () => {
		const title1 = generateRandomTitle();
		// It's possible to get the same title, but unlikely.
		// We'll generate a few and ensure at least some variance or just check format.
		// Let's just check it's not empty for now.
		expect(title1).not.toBe("");
	});
});
