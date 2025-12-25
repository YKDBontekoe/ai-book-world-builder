"use server";

import { requireAuth, withProjectWriteAccess } from "@/lib/actions-utils";
import { err, ok, type Result } from "@/lib/result";
import {
	type BookPlan,
	type StoryStyle,
	storyService,
} from "@/lib/services/story-service";
import { chapterRepository } from "@/lib/db/repositories/chapter-repository";

export type { BookPlan, StoryStyle };

export async function generateBookPlan(
	prompt: string,
	style?: StoryStyle,
	modelId?: string,
): Promise<Result<{ plan: BookPlan }>> {
	const authResult = await requireAuth();
	if (!authResult.success) {
		return err(authResult.error);
	}

	try {
		const result = await storyService.generateBookPlan(prompt, style, modelId);
		if (result.error || !result.plan) {
			return err(result.error || "Failed to generate plan");
		}
		return ok({ plan: result.plan });
	} catch (error) {
		console.error("Failed to generate book plan", error);
		return err("Failed to generate plan");
	}
}

export async function createBookFromPlan(
	projectId: string,
	plan: BookPlan,
	style?: StoryStyle,
): Promise<Result<void>> {
	return withProjectWriteAccess(projectId, async () => {
		await storyService.createBookFromPlan(projectId, plan, style);
	});
}

export async function planChapterScenes(
	chapterId: string,
): Promise<Result<{ sceneIds: string[] }>> {
	try {
		// Centralize access check by fetching the chapter first
		const chapter = await chapterRepository.findById(chapterId);
		if (!chapter) {
			return err("Chapter not found");
		}

		// Ensure we have write access to the project owning this chapter
		return withProjectWriteAccess(chapter.projectId, async () => {
			const sceneIds = await storyService.planChapterScenes(chapterId);
			return { sceneIds };
		});
	} catch (error) {
		console.error("Failed to plan chapter scenes", error);
		const msg = error instanceof Error ? error.message : "Planning failed";
		return err(msg);
	}
}

export async function generateSceneText(
	sceneId: string,
): Promise<Result<void>> {
	try {
		await storyService.generateSceneText(sceneId);
		return ok(undefined);
	} catch (error) {
		console.error("Failed to generate scene text", error);
		return err("Failed to generate scene text");
	}
}
