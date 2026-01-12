"use server";

import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { withProjectWriteAccess } from "@/lib/actions-utils";
import { chapterRepository, sceneRepository } from "@/lib/db/repositories";
import { bookPlanSchema } from "@/lib/services/schemas/story-schemas";
import {
	type BookPlan,
	type StoryStyle,
	storyService,
} from "@/lib/services/story-service";

// Define schema for validation
const generateBookPlanSchema = z.object({
	prompt: z
		.string()
		.min(1, "Prompt is required")
		.max(5000, "Prompt is too long (max 5000 chars)"),
	style: z
		.object({
			pov: z.string().optional(),
			tone: z.string().optional(),
			genre: z.string().optional(),
		})
		.optional(),
	modelId: z.string().optional(),
});

const planChapterSchema = z.object({
	chapterId: z.string().uuid("Invalid chapter ID"),
});

const generateSceneSchema = z.object({
	sceneId: z.string().uuid("Invalid scene ID"),
});

const createBookFromPlanSchema = z.object({
	projectId: z.string().uuid("Invalid project ID"),
	plan: bookPlanSchema,
	style: z
		.object({
			pov: z.string().optional(),
			tone: z.string().optional(),
			genre: z.string().optional(),
		})
		.optional(),
});

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

		// Validate Input
		const validation = generateBookPlanSchema.safeParse({
			prompt,
			style,
			modelId,
		});

		if (!validation.success) {
			return { success: false, error: validation.error.message };
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
	const validation = createBookFromPlanSchema.safeParse({
		projectId,
		plan,
		style,
	});
	if (!validation.success) {
		return { success: false, error: validation.error.message };
	}

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
	const validation = planChapterSchema.safeParse({ chapterId });
	if (!validation.success) {
		return { success: false, error: validation.error.message };
	}

	try {
		// Resolve Project ID to authorize
		const chapter = await chapterRepository.findById(chapterId);
		if (!chapter) {
			return { success: false, error: "Chapter not found" };
		}

		// Authorize & Execute
		return withProjectWriteAccess(chapter.projectId, async () => {
			const sceneIds = await storyService.planChapterScenes(chapterId);
			return { success: true, sceneIds };
		});
	} catch (error) {
		console.error("Failed to plan chapter scenes", error);
		const msg = error instanceof Error ? error.message : "Planning failed";
		return { success: false, error: msg };
	}
}

export async function generateSceneText(sceneId: string) {
	const validation = generateSceneSchema.safeParse({ sceneId });
	if (!validation.success) {
		return { success: false, error: validation.error.message };
	}

	try {
		// Resolve Project ID
		const scene = await sceneRepository.findById(sceneId);
		if (!scene) {
			return { success: false, error: "Scene not found" };
		}

		// Authorize & Execute
		return withProjectWriteAccess(scene.projectId, async () => {
			await storyService.generateSceneText(sceneId);
			return { success: true };
		});
	} catch (error) {
		console.error("Failed to generate scene text", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to generate scene content";
		return { success: false, error: errorMessage };
	}
}
