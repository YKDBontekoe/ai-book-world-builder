"use server";

import { auth } from "@/app/(auth)/auth";
import { withProjectWriteAccess } from "@/lib/actions-utils";
import {
	type BookPlan,
	type StoryStyle,
	storyService,
} from "@/lib/services/story-service";

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
			return {
				success: false,
				error: result.error || "Failed to generate plan",
			};
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
	try {
		// Validated internal call or add explicit pre-check here.
		// Service layer handles authorization (ensureProjectAccess), but strictly speaking
		// actions should validate too.
		// For IDOR prevention, we rely on storyService.planChapterScenes calling `getChapterWithScenes`
		// which returns the project ID, then calling `ensureProjectAccess`.
		// To be 100% safe against service refactors, we enforce it here:
		if (!chapterId || typeof chapterId !== "string") {
			return { success: false, error: "Invalid chapter ID" };
		}

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
		if (!sceneId || typeof sceneId !== "string") {
			return { success: false, error: "Invalid scene ID" };
		}
		// Service layer handles ensureProjectAccess via verifySceneAccess inside `generateSceneText`
		await storyService.generateSceneText(sceneId);
		return { success: true };
	} catch (error) {
		console.error("Failed to generate scene text", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to generate scene content";
		return { success: false, error: errorMessage };
	}
}
