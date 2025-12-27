import { describe, expect, it } from "vitest";
import { buildSceneGenerationContext } from "@/lib/services/story/story-context-builder";

describe("buildSceneGenerationContext", () => {
	const mockChapter = {
		title: "Chapter 1",
		notes: "Chapter summary notes",
	};

	const mockOutline = {
		pov: "Third Person",
		tone: "Dark",
	};

	const mockScenes = [
		{ sequence: 1, title: "Scene 1", content: "Content of scene 1" },
		{ sequence: 2, title: "Scene 2", content: "Content of scene 2" },
		{ sequence: 3, title: "Scene 3", content: "Content of scene 3" },
	];

	it("should build context correctly with previous scenes", () => {
		const targetScene = { sequence: 3, title: "Scene 3" };

		const result = buildSceneGenerationContext({
			targetScene,
			targetChapter: mockChapter,
			targetOutline: mockOutline,
			scenesInChapter: mockScenes,
		});

		expect(result.styleInstruction).toBe("Third Person, Dark");
		expect(result.fullContext).toContain("Chapter Title: Chapter 1");
		expect(result.fullContext).toContain(
			"Chapter Summary: Chapter summary notes",
		);
		// Scene 1 should be summarized
		expect(result.fullContext).toContain("[SCENE Scene 1]: Completed");
		// Scene 2 should be full text as immediate predecessor
		expect(result.fullContext).toContain(
			"[IMMEDIATELY PREVIOUS SCENE - Scene 2]",
		);
		expect(result.fullContext).toContain("Content of scene 2");
	});

	it("should handle first scene correctly", () => {
		const targetScene = { sequence: 1, title: "Scene 1" };

		const result = buildSceneGenerationContext({
			targetScene,
			targetChapter: mockChapter,
			targetOutline: mockOutline,
			scenesInChapter: mockScenes,
		});

		expect(result.fullContext).toContain("Chapter Title: Chapter 1");
		// Use toContain because the builder adds headers even if content is empty,
		// but we verify no actual scenes are listed
		expect(result.fullContext).toContain("Previous Scenes Summary:");
		expect(result.fullContext).not.toContain("[SCENE");
	});
});
