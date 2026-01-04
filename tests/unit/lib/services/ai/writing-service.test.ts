import { describe, expect, it, vi } from "vitest";
import { generationService } from "@/lib/ai/services/generation-service";
import { writingService } from "@/lib/services/ai/writing-service";

// Mock dependencies
vi.mock("@/lib/ai/services/generation-service", () => ({
	generationService: {
		continueWriting: vi.fn(),
		draftScene: vi.fn(),
	},
}));

vi.mock("@/lib/db/queries", () => ({
	db: {
		query: {
			scene: {
				findFirst: vi.fn(),
			},
		},
	},
	getScenesForChapter: vi.fn(),
	updateSceneContent: vi.fn(),
}));

vi.mock("@/lib/services/ai/utils", () => ({
	verifySceneAccess: vi.fn(),
	verifyProjectAccessViaScenes: vi.fn(),
}));

describe("WritingService", () => {
	describe("rewriteScene", () => {
		it("should call generationService.continueWriting with correct params", async () => {
			// Setup mocks
			const mockScene = {
				id: "scene-1",
				title: "Test Scene",
				content: "Old content",
			};
			const mockText = "Rewritten content";

			const { db } = await import("@/lib/db/queries");
			vi.mocked(db.query.scene.findFirst).mockResolvedValue(mockScene as any);

			vi.mocked(generationService.continueWriting).mockResolvedValue({
				text: mockText,
				usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
				modelId: "large",
			} as any);

			// Execute
			const result = await writingService.rewriteScene(
				"scene-1",
				"Make it funnier",
			);

			// Verify
			expect(result.text).toBe(mockText);
			expect(generationService.continueWriting).toHaveBeenCalledWith(
				"",
				expect.stringContaining("Make it funnier"),
				expect.objectContaining({ modelId: "large" }),
			);
		});
	});
});
