import "server-only";

import { ensureProjectAccess } from "@/lib/actions-utils";
import { planningService } from "@/lib/ai/services/planning-service";
import { invalidateCache } from "@/lib/cache";
import { storyRepository } from "@/lib/db/repositories/story-repository";
import type {
	BookPlan,
	StoryStyle,
} from "@/lib/services/schemas/story-schemas";
import { logGenerationUsage } from "@/lib/services/usage-logger";

export class StoryPlanner {
	/**
	 * Generates a high-level book plan (Outline + Chapters) based on a prompt.
	 */
	async generateBookPlan(prompt: string, style?: StoryStyle, modelId?: string) {
		return await planningService.generateBookPlan(prompt, style, modelId);
	}

	/**
	 * Persists a generated book plan to the database.
	 */
	async createBookFromPlan(
		projectId: string,
		plan: BookPlan,
		style?: StoryStyle,
	) {
		await ensureProjectAccess(projectId, true);
		const result = await storyRepository.createBookFromPlan(
			projectId,
			plan,
			style,
		);
		await invalidateCache(`project-structure:${projectId}`);
		return result;
	}

	/**
	 * Generates a list of scenes for a specific chapter based on the chapter's summary and context.
	 */
	async planChapterScenes(chapterId: string) {
		const targetChapter = await storyRepository.getChapterWithScenes(chapterId);

		await ensureProjectAccess(targetChapter.projectId, true);

		const result = await planningService.planChapterScenes(
			targetChapter.title,
			targetChapter.notes || "",
		);

		if (result.error || !result.plan) {
			throw new Error(result.error || "Failed to plan scenes");
		}

		// Log Usage (Fire and forget)
		logGenerationUsage({
			projectId: targetChapter.projectId,
			usage: result.usage,
			modelId: result.modelId,
			context: {
				projectId: targetChapter.projectId,
				generationType: "planning",
				stepType: "plan_chapter_scenes",
				chapterId: chapterId,
			},
		}).catch((err: any) =>
			console.error("Failed to log generation usage:", err),
		);

		const scenePlan = result.plan;

		const lastScene = await storyRepository.getLastSceneInChapter(chapterId);

		let startSequence = lastScene ? lastScene.sequence + 1 : 1;

		const scenesToCreate = scenePlan.scenes.map((plan) => ({
			title: plan.title,
			sequence: startSequence++,
		}));

		const createResult = await storyRepository.createScenesBatch(
			targetChapter.projectId,
			chapterId,
			scenesToCreate,
		);

		await invalidateCache(`project-structure:${targetChapter.projectId}`);

		return createResult;
	}
}

export const storyPlanner = new StoryPlanner();
