import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoist mocks
const mocks = vi.hoisted(() => ({
	getSelectedModelId: vi.fn(),
}));

// Mock dependencies
vi.mock("@/lib/ai/models", () => ({
	getSelectedModelId: mocks.getSelectedModelId,
}));

// Import after mocks
import {
	getModelIdForRole,
	getModelIdForTier,
	ROLE_TO_TIER,
	type ModelRole,
	type ModelTier,
} from "@/lib/ai/model-routing";

describe("Model Routing", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("ROLE_TO_TIER", () => {
		it("should map orchestrator to large", () => {
			expect(ROLE_TO_TIER.orchestrator).toBe("large");
		});

		it("should map writer to large", () => {
			expect(ROLE_TO_TIER.writer).toBe("large");
		});

		it("should map checker to large", () => {
			expect(ROLE_TO_TIER.checker).toBe("large");
		});

		it("should map context to middle", () => {
			expect(ROLE_TO_TIER.context).toBe("middle");
		});
	});

	describe("getModelIdForRole", () => {
		it("should resolve writer role to large tier model", async () => {
			mocks.getSelectedModelId.mockResolvedValue("anthropic/claude-3.5-sonnet");

			const result = await getModelIdForRole("writer");

			expect(mocks.getSelectedModelId).toHaveBeenCalledWith("large");
			expect(result).toBe("anthropic/claude-3.5-sonnet");
		});

		it("should resolve context role to middle tier model", async () => {
			mocks.getSelectedModelId.mockResolvedValue("openrouter/auto");

			const result = await getModelIdForRole("context");

			expect(mocks.getSelectedModelId).toHaveBeenCalledWith("middle");
			expect(result).toBe("openrouter/auto");
		});

		it("should resolve orchestrator role to large tier model", async () => {
			mocks.getSelectedModelId.mockResolvedValue("gpt-4o");

			const result = await getModelIdForRole("orchestrator");

			expect(mocks.getSelectedModelId).toHaveBeenCalledWith("large");
			expect(result).toBe("gpt-4o");
		});
	});

	describe("getModelIdForTier", () => {
		it("should call getSelectedModelId with light tier", async () => {
			mocks.getSelectedModelId.mockResolvedValue("gpt-4o-mini");

			const result = await getModelIdForTier("light");

			expect(mocks.getSelectedModelId).toHaveBeenCalledWith("light");
			expect(result).toBe("gpt-4o-mini");
		});

		it("should call getSelectedModelId with middle tier", async () => {
			mocks.getSelectedModelId.mockResolvedValue("openrouter/auto");

			const result = await getModelIdForTier("middle");

			expect(mocks.getSelectedModelId).toHaveBeenCalledWith("middle");
			expect(result).toBe("openrouter/auto");
		});

		it("should call getSelectedModelId with large tier", async () => {
			mocks.getSelectedModelId.mockResolvedValue("claude-3.5-opus");

			const result = await getModelIdForTier("large");

			expect(mocks.getSelectedModelId).toHaveBeenCalledWith("large");
			expect(result).toBe("claude-3.5-opus");
		});
	});
});
