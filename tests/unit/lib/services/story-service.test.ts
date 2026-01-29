import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { getSelectedModelId } from "@/lib/ai/models";
import { planningService } from "@/lib/ai/services/planning-service";
import { generationService } from "@/lib/ai/writer-service";
import { invalidateCache } from "@/lib/cache";
import { storyRepository } from "@/lib/db/repositories/story-repository";
import { storyService } from "@/lib/services/story-service";
import { logGenerationUsage } from "@/lib/services/usage-logger";

vi.mock("@/lib/actions-utils", () => ({
	ensureProjectAccess: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/ai/models", () => ({
	getSelectedModelId: vi.fn().mockResolvedValue("mock-model"),
}));

vi.mock("@/lib/ai/services/planning-service", () => ({
	planningService: {
		generateBookPlan: vi.fn(),
		planChapterScenes: vi.fn(),
	},
}));

vi.mock("@/lib/ai/writer-service", () => ({
	generationService: {
		continueWriting: vi.fn(),
	},
}));

vi.mock("@/lib/cache", () => ({
	invalidateCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/db/repositories/story-repository", () => ({
	storyRepository: {
		createBookFromPlan: vi.fn(),
		getChapterWithScenes: vi.fn(),
		getLastSceneInChapter: vi.fn(),
		createScenesBatch: vi.fn(),
		getSceneContextData: vi.fn(),
		updateSceneContent: vi.fn(),
	},
}));

vi.mock("@/lib/services/usage-logger", () => ({
	logGenerationUsage: vi.fn().mockResolvedValue(undefined),
}));

describe("StoryService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("generateBookPlan", () => {
		it("should delegate to planningService", async () => {
			const mockPlan = { plan: { title: "T" } };
			(planningService.generateBookPlan as any).mockResolvedValue(mockPlan);

			const result = await storyService.generateBookPlan("prompt");
			expect(planningService.generateBookPlan).toHaveBeenCalledWith(
				"prompt",
				undefined,
				undefined,
			);
			expect(result).toBe(mockPlan);
		});
	});

	describe("createBookFromPlan", () => {
		it("should ensure access, create book, and invalidate cache", async () => {
			const plan = { title: "T" } as any;
			(storyRepository.createBookFromPlan as any).mockResolvedValue({
				outlineId: "o1",
			});

			const result = await storyService.createBookFromPlan("p1", plan);

			expect(ensureProjectAccess).toHaveBeenCalledWith("p1", true);
			expect(storyRepository.createBookFromPlan).toHaveBeenCalledWith(
				"p1",
				plan,
				undefined,
			);
			expect(invalidateCache).toHaveBeenCalledWith("project-structure:p1");
			expect(result).toEqual({ outlineId: "o1" });
		});
	});

	describe("planChapterScenes", () => {
		const chapterId = "c1";
		const mockChapter = {
			id: "c1",
			projectId: "p1",
			title: "Ch",
			notes: "Notes",
		};

		it("should plan scenes and batch create them", async () => {
			(storyRepository.getChapterWithScenes as any).mockResolvedValue(
				mockChapter,
			);
			(planningService.planChapterScenes as any).mockResolvedValue({
				plan: { scenes: [{ title: "S1" }] },
				usage: { tokens: 10 },
				modelId: "m1",
			});
			(storyRepository.getLastSceneInChapter as any).mockResolvedValue({
				sequence: 5,
			});
			(storyRepository.createScenesBatch as any).mockResolvedValue(["s1"]);

			const result = await storyService.planChapterScenes(chapterId);

			expect(storyRepository.getChapterWithScenes).toHaveBeenCalledWith(
				chapterId,
			);
			expect(ensureProjectAccess).toHaveBeenCalledWith("p1", true);
			expect(planningService.planChapterScenes).toHaveBeenCalledWith(
				"Ch",
				"Notes",
			);
			expect(logGenerationUsage).toHaveBeenCalled();
			expect(storyRepository.createScenesBatch).toHaveBeenCalledWith(
				"p1",
				"c1",
				[{ title: "S1", sequence: 6 }],
			);
			expect(invalidateCache).toHaveBeenCalledWith("project-structure:p1");
			expect(result).toEqual(["s1"]);
		});

		it("should throw if planning fails", async () => {
			(storyRepository.getChapterWithScenes as any).mockResolvedValue(
				mockChapter,
			);
			(planningService.planChapterScenes as any).mockResolvedValue({
				error: "Failed",
			});

			await expect(storyService.planChapterScenes(chapterId)).rejects.toThrow(
				"Failed",
			);
		});

		it("should handle missing plan", async () => {
			(storyRepository.getChapterWithScenes as any).mockResolvedValue(
				mockChapter,
			);
			(planningService.planChapterScenes as any).mockResolvedValue({
				plan: null,
			});

			await expect(storyService.planChapterScenes(chapterId)).rejects.toThrow(
				"Failed to plan scenes",
			);
		});
	});

	describe("generateSceneText", () => {
		const sceneId = "s1";
		const mockContext = {
			targetScene: {
				id: "s1",
				projectId: "p1",
				title: "Title",
				chapterId: "c1",
			},
			targetChapter: {},
			targetOutline: {},
			scenesInChapter: [],
		};

		it("should build context, generate text, and update DB", async () => {
			(storyRepository.getSceneContextData as any).mockResolvedValue(
				mockContext,
			);
			(generationService.continueWriting as any).mockResolvedValue({
				text: "Generated text",
				usage: {},
				modelId: "m1",
			});

			await storyService.generateSceneText(sceneId);

			expect(storyRepository.getSceneContextData).toHaveBeenCalledWith(sceneId);
			expect(ensureProjectAccess).toHaveBeenCalledWith("p1", true);
			expect(getSelectedModelId).toHaveBeenCalledWith("large");
			expect(generationService.continueWriting).toHaveBeenCalled();
			expect(storyRepository.updateSceneContent).toHaveBeenCalledWith(
				sceneId,
				"Generated text",
				"p1",
			);
			expect(logGenerationUsage).toHaveBeenCalled();
		});

		it("should throw if generation result has error", async () => {
			(storyRepository.getSceneContextData as any).mockResolvedValue(
				mockContext,
			);
			(generationService.continueWriting as any).mockResolvedValue({
				error: "AI error",
			});

			await expect(storyService.generateSceneText(sceneId)).rejects.toThrow(
				"AI error",
			);
		});

		it("should throw if AI generates empty text", async () => {
			(storyRepository.getSceneContextData as any).mockResolvedValue(
				mockContext,
			);
			(generationService.continueWriting as any).mockResolvedValue({
				text: "",
			});

			await expect(storyService.generateSceneText(sceneId)).rejects.toThrow(
				"AI generated empty content",
			);
		});
	});
});
