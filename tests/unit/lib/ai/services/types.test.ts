import { describe, expect, it } from "vitest";
import {
	aiError,
	aiSuccess,
	MODEL_TIER_DESCRIPTIONS,
	ROLE_TO_TIER,
	type AIError,
	type AISuccess,
	type ModelRole,
	type ModelTier,
} from "@/lib/ai/services/types";

describe("AI Services Types", () => {
	describe("ModelTier", () => {
		it("should have three tiers: light, middle, large", () => {
			const tiers: ModelTier[] = ["light", "middle", "large"];
			expect(tiers).toHaveLength(3);
		});

		it("should have descriptions for all tiers", () => {
			expect(MODEL_TIER_DESCRIPTIONS.light).toContain("Fast");
			expect(MODEL_TIER_DESCRIPTIONS.middle).toContain("Balanced");
			expect(MODEL_TIER_DESCRIPTIONS.large).toContain("capable");
		});
	});

	describe("ModelRole", () => {
		it("should have four roles", () => {
			const roles: ModelRole[] = [
				"orchestrator",
				"writer",
				"checker",
				"context",
			];
			expect(roles).toHaveLength(4);
		});

		it("should map roles to tiers correctly", () => {
			expect(ROLE_TO_TIER.orchestrator).toBe("large");
			expect(ROLE_TO_TIER.writer).toBe("large");
			expect(ROLE_TO_TIER.checker).toBe("large");
			expect(ROLE_TO_TIER.context).toBe("middle");
		});
	});

	describe("aiSuccess", () => {
		it("should create a success result", () => {
			const result = aiSuccess({ text: "hello" });

			expect(result.success).toBe(true);
			expect(result.data).toEqual({ text: "hello" });
		});

		it("should work with any data type", () => {
			const result = aiSuccess(42);

			expect(result.success).toBe(true);
			expect(result.data).toBe(42);
		});
	});

	describe("aiError", () => {
		it("should create an error result", () => {
			const result = aiError("Something went wrong");

			expect(result.success).toBe(false);
			expect(result.error).toBe("Something went wrong");
		});
	});

	describe("AIResult type narrowing", () => {
		it("should allow type narrowing on success", () => {
			const successResult: AISuccess<string> = aiSuccess("data");

			if (successResult.success) {
				// TypeScript should know this is AISuccess
				expect(successResult.data).toBe("data");
			}
		});

		it("should allow type narrowing on error", () => {
			const errorResult: AIError = aiError("error");

			if (!errorResult.success) {
				// TypeScript should know this is AIError
				expect(errorResult.error).toBe("error");
			}
		});
	});
});
