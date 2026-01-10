
import { vi, describe, it, expect, beforeEach } from "vitest";
import { storyService } from "@/lib/services/story-service";
import { storyRepository } from "@/lib/db/repositories/story-repository";
import { generationService } from "@/lib/ai/writer-service";
import * as dbQueries from "@/lib/db/queries";
import * as aiUtils from "@/lib/services/ai/utils";

// Mock dependencies
vi.mock("@/lib/db/repositories/story-repository", () => ({
  storyRepository: {
    getScene: vi.fn(),
  },
}));

vi.mock("@/lib/db/queries", () => ({
  getScenesForChapter: vi.fn(),
  updateSceneContent: vi.fn(),
}));

vi.mock("@/lib/ai/writer-service", () => ({
  generationService: {
    draftScene: vi.fn(),
    rewriteScene: vi.fn(),
    expandScene: vi.fn(),
  },
}));

vi.mock("@/lib/services/ai/utils", () => ({
  verifyProjectAccessViaScenes: vi.fn(),
  verifySceneAccess: vi.fn(),
}));

vi.mock("@/lib/ai/models", () => ({
  getSelectedModelId: vi.fn().mockResolvedValue("mock-model-id"),
}));

describe("StoryService - Writing Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("batchWriteChapter", () => {
    it("should successfully batch write scenes", async () => {
      // Setup
      const mockScenes = [
        { id: "scene-1", title: "Scene 1", sequence: 1, content: "" },
        { id: "scene-2", title: "Scene 2", sequence: 2, content: "" },
      ];
      vi.mocked(dbQueries.getScenesForChapter).mockResolvedValue(mockScenes as any);
      vi.mocked(generationService.draftScene).mockResolvedValue({
        text: "Generated content",
        usage: {},
        modelId: "mock-model",
      });

      // Execute
      const result = await storyService.batchWriteChapter("chapter-1");

      // Verify
      expect(result.success).toBe(true);
      expect(result.writtenCount).toBe(2);
      expect(dbQueries.updateSceneContent).toHaveBeenCalledTimes(2);
      expect(generationService.draftScene).toHaveBeenCalledTimes(2);
    });

    it("should skip scenes with existing content > 500 chars", async () => {
      // Setup
      const mockScenes = [
        { id: "scene-1", title: "Scene 1", sequence: 1, content: "A".repeat(600) },
        { id: "scene-2", title: "Scene 2", sequence: 2, content: "" },
      ];
      vi.mocked(dbQueries.getScenesForChapter).mockResolvedValue(mockScenes as any);
      vi.mocked(generationService.draftScene).mockResolvedValue({
        text: "Generated content",
        usage: {},
        modelId: "mock-model",
      });

      // Execute
      const result = await storyService.batchWriteChapter("chapter-1");

      // Verify
      expect(result.success).toBe(true);
      expect(result.writtenCount).toBe(1); // Only scene 2 written
      expect(dbQueries.updateSceneContent).toHaveBeenCalledTimes(1);
    });
  });

  describe("rewriteScene", () => {
    it("should rewrite scene successfully", async () => {
      // Setup
      vi.mocked(storyRepository.getScene).mockResolvedValue({
        id: "scene-1",
        title: "Old Title",
        content: "Old Content",
      } as any);

      vi.mocked(generationService.rewriteScene).mockResolvedValue({
        text: "Rewritten Content",
        usage: {},
        modelId: "mock-model",
      });

      // Execute
      const result = await storyService.rewriteScene("scene-1", "Make it better");

      // Verify
      expect(result.text).toBe("Rewritten Content");
      expect(aiUtils.verifySceneAccess).toHaveBeenCalledWith("scene-1");
      expect(generationService.rewriteScene).toHaveBeenCalledWith(
        "Old Title",
        "Old Content",
        "Make it better",
        expect.any(Object)
      );
    });
  });

  describe("expandScene", () => {
    it("should expand scene successfully", async () => {
      // Setup
      vi.mocked(storyRepository.getScene).mockResolvedValue({
        id: "scene-1",
        title: "Notes Title",
        content: "Some notes",
      } as any);

      vi.mocked(generationService.expandScene).mockResolvedValue({
        text: "Expanded Content",
        usage: {},
        modelId: "mock-model",
      });

      // Execute
      const result = await storyService.expandScene("scene-1", "More notes");

      // Verify
      expect(result.text).toBe("Expanded Content");
      expect(aiUtils.verifySceneAccess).toHaveBeenCalledWith("scene-1");
      expect(generationService.expandScene).toHaveBeenCalledWith(
        "Notes Title",
        "More notes", // Uses the passed notes if present
        expect.any(Object)
      );
    });
  });
});
