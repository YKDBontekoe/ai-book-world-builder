import { beforeEach, describe, expect, it, vi } from "vitest";
import { planningService } from "@/lib/ai/services/planning-service";
import { generationService } from "@/lib/ai/writer-service";
import { clearCached } from "@/lib/cache";
import { storyRepository } from "@/lib/db/repositories/story-repository";
import { StoryService } from "@/lib/services/story-service";

// Mock dependencies
vi.mock("@/lib/ai/services/planning-service");
vi.mock("@/lib/db/repositories/story-repository");
vi.mock("@/lib/cache");
vi.mock("@/lib/ai/writer-service");
vi.mock("@/lib/actions-utils", () => ({
	ensureProjectAccess: vi.fn(),
}));
vi.mock("@/lib/ai/models", () => ({
	getSelectedModelId: vi.fn(() => "mock-model-id"),
}));

describe("StoryService", () => {
	let storyService: StoryService;

	beforeEach(() => {
		storyService = new StoryService();
		vi.clearAllMocks();
	});

	describe("generateBookPlan", () => {
		it("should call planningService.generateBookPlan", async () => {
			const prompt = "A story about a dragon.";
			await storyService.generateBookPlan(prompt);
			expect(planningService.generateBookPlan).toHaveBeenCalledWith(
				prompt,
				undefined,
				undefined,
			);
		});
	});

	describe("createBookFromPlan", () => {
		it("should call repository and clear cache", async () => {
			const plan = {
				title: "Dragon's Lair",
				logline: "a",
				summary: "a",
				chapters: [],
			};
			await storyService.createBookFromPlan("proj-1", plan);
			expect(storyRepository.createBookFromPlan).toHaveBeenCalledWith(
				"proj-1",
				plan,
				undefined,
			);
			expect(clearCached).toHaveBeenCalledWith("project-structure:proj-1");
		});
	});

	describe("planChapterScenes", () => {
		it("should generate scenes and create them", async () => {
			vi.mocked(storyRepository.getChapterWithScenes).mockResolvedValue({
				id: "ch-1",
				projectId: "proj-1",
				title: "Chapter 1",
				notes: "Some notes",
				scenes: [],
			});
			vi.mocked(planningService.planChapterScenes).mockResolvedValue({
				plan: { scenes: [{ title: "Scene 1" }] },
			});

			await storyService.planChapterScenes("ch-1");

			expect(storyRepository.createScenesBatch).toHaveBeenCalled();
			expect(clearCached).toHaveBeenCalledWith("project-structure:proj-1");
		});
	});

	describe("generateSceneText", () => {
		it("should call repository and AI service", async () => {
			vi.mocked(storyRepository.getSceneContextData).mockResolvedValue({
				targetScene: { projectId: "proj-1", sequence: 1 },
				targetChapter: {},
				targetOutline: {},
				scenesInChapter: [],
			});
			vi.mocked(generationService.continueWriting).mockResolvedValue({
				text: "Generated content",
			});
			await storyService.generateSceneText("scene-1");
			expect(storyRepository.getSceneContextData).toHaveBeenCalledWith(
				"scene-1",
			);
			expect(generationService.continueWriting).toHaveBeenCalled();
		});
	});
});
