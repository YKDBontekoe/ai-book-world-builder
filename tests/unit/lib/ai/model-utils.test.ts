import { describe, expect, it } from "vitest";
import { isModelFree } from "@/lib/ai/model-utils";

describe("isModelFree", () => {
	it("returns true for models with 0 pricing for input and output", () => {
		const model = {
			pricing: {
				input: "0",
				output: "0",
			},
		};
		expect(isModelFree(model)).toBe(true);
	});

	it("returns false for models with non-zero pricing", () => {
		const model = {
			pricing: {
				input: "0.0001",
				output: "0",
			},
		};
		expect(isModelFree(model)).toBe(false);
	});

	it("returns false if pricing is missing", () => {
		const model = {};
		expect(isModelFree(model)).toBe(false);
	});

	it("returns true if pricing is '0.0' strings", () => {
		const model = {
			pricing: {
				input: "0.0",
				output: "0.00",
			},
		};
		expect(isModelFree(model)).toBe(true);
	});
});
