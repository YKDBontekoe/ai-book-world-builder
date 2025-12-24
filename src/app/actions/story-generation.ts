"use server";

import { auth } from "@/app/(auth)/auth";
import { withProjectWriteAccess } from "@/lib/actions-utils";
import {
	type BookPlan,
	type StoryStyle,
	storyService,
} from "@/lib/services/story-service";

export type { BookPlan, StoryStyle };

export async function generateBookPlan(
	prompt: string,
	style?: StoryStyle,
	modelId?: string,
) {
	try {
		const session = await auth();
		if (!session?.user) {
			return { success: false, error: "Unauthorized" };
		}
		const result = await storyService.generateBookPlan(prompt, style, modelId);
		if (result.error || !result.plan) {
			return { success: false, error: result.error || "Failed to generate plan" };
		}
		return { success: true, plan: result.plan };
	} catch (error) {
		console.error("Failed to generate book plan", error);
		return { success: false, error: "Failed to generate plan" };
	}
}

export async function createBookFromPlan(
	projectId: string,
	plan: BookPlan,
	style?: StoryStyle,
) {
	return withProjectWriteAccess(projectId, async () => {
		try {
			await storyService.createBookFromPlan(projectId, plan, style);
			return { success: true };
		} catch (error) {
			console.error("Failed to create book from plan", error);
			// Check if error is already a friendly message or throw generic
			if (error instanceof Error) {
				return { success: false, error: error.message };
			}
			return { success: false, error: "Failed to apply plan" };
		}
	});
}

export async function planChapterScenes(chapterId: string) {
	// We need to fetch the chapter first to get the projectId for security check
	// However, we don't have a direct "getProjectIdForChapter" helper exposed here easily
	// without importing repository.
	// But `storyService.planChapterScenes` internally calls `getChapterWithScenes`.
	// Ideally, we should refactor `planChapterScenes` to accept projectId, OR we rely on internal check.
	// But the goal is to make it EXPLICIT.
	// Since `withProjectWriteAccess` requires `projectId`, we can't easily use it without fetching the project ID first.
	// This exposes a flaw in the `actions-utils` design: it assumes we always start with projectId.

	// OPTION: We stick to the internal check for now for `planChapterScenes` but ensure it IS checked.
	// storyService.planChapterScenes calls `ensureProjectAccess(targetChapter.projectId, true)`.
	// This is safe. But `createBookFromPlan` took `projectId` directly, so we could wrap it easily.

	// Let's at least wrap the error handling similarly.
	try {
		const sceneIds = await storyService.planChapterScenes(chapterId);
		return { success: true, sceneIds };
	} catch (error) {
		console.error("Failed to plan chapter scenes", error);
		const msg = error instanceof Error ? error.message : "Planning failed";
		return { success: false, error: msg };
	}
}

export async function generateSceneText(sceneId: string) {
	try {
		await storyService.generateSceneText(sceneId);
		return { success: true };
	} catch (error) {
		console.error("Failed to generate scene text", error);
		return { success: false };
	}
}
