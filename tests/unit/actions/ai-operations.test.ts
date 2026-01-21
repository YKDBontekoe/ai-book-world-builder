import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as aiOperations from "@/app/actions/ai-operations";
import { analysisService } from "@/lib/services/ai/analysis-service";
import { loreService } from "@/lib/services/ai/lore-service";
import { manuscriptService } from "@/lib/services/ai/manuscript-service";
import { writingService } from "@/lib/services/ai/writing-service";

// Mock dependencies
vi.mock("@/lib/services/ai/writing-service", () => ({
	writingService: {
		batchWriteChapter: vi.fn(),
		rewriteScene: vi.fn(),
		expandScene: vi.fn(),
	},
}));

vi.mock("@/lib/services/ai/analysis-service", () => ({
	analysisService: {
		critiqueChapter: vi.fn(),
		analyzeConsistency: vi.fn(),
		dialogueCoach: vi.fn(),
	},
}));

vi.mock("@/lib/services/ai/lore-service", () => ({
	loreService: {
		generateLore: vi.fn(),
		searchProject: vi.fn(),
	},
}));

vi.mock("@/lib/services/ai/manuscript-service", () => ({
	manuscriptService: {
		askManuscript: vi.fn(),
	},
}));

describe("AI Operations Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("batchWriteChapterAction", () => {
		it("should return success response on success", async () => {
			vi.mocked(writingService.batchWriteChapter).mockResolvedValue({
				success: true,
				writtenCount: 5,
			} as any);

			const result = await aiOperations.batchWriteChapterAction(
				"chapter-1",
				"instructions",
			);

			expect(result).toEqual({ success: true, writtenCount: 5 });
			expect(writingService.batchWriteChapter).toHaveBeenCalledWith(
				"chapter-1",
				"instructions",
			);
		});

		it("should return friendly error message on failure", async () => {
			vi.mocked(writingService.batchWriteChapter).mockRejectedValue(
				new Error("API Error"),
			);

			const result = await aiOperations.batchWriteChapterAction("chapter-1");

			expect(result).toEqual({
				success: false,
				error: "Failed to generate scenes. Please try again later.",
			});
			expect(console.error).toHaveBeenCalledWith(
				"[AI Operations] Batch Write Error:",
				expect.any(Error),
			);
		});
	});

	describe("rewriteSceneAction", () => {
		it("should return result on success", async () => {
			vi.mocked(writingService.rewriteScene).mockResolvedValue({
				text: "rewritten",
			} as any);

			const result = await aiOperations.rewriteSceneAction(
				"scene-1",
				"make it better",
			);

			expect(result).toEqual({ text: "rewritten" });
		});

		it("should return friendly error on failure", async () => {
			vi.mocked(writingService.rewriteScene).mockRejectedValue(
				new Error("Fail"),
			);

			const result = await aiOperations.rewriteSceneAction("scene-1", "prompt");

			expect(result).toEqual({
				error: "Failed to rewrite scene. Please try again.",
			});
		});
	});

	describe("critiqueChapterAction", () => {
		it("should return data on success", async () => {
			vi.mocked(analysisService.critiqueChapter).mockResolvedValue({
				critique: "good",
			} as any);

			const result = await aiOperations.critiqueChapterAction("chapter-1");

			expect(result).toEqual({ success: true, data: { critique: "good" } });
		});

		it("should return friendly error on failure", async () => {
			vi.mocked(analysisService.critiqueChapter).mockRejectedValue(
				new Error("Fail"),
			);

			const result = await aiOperations.critiqueChapterAction("chapter-1");

			expect(result).toEqual({
				success: false,
				error: "Failed to analyze chapter. Please try again.",
			});
		});
	});
});
