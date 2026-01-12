import "server-only";

import { ensureProjectAccess } from "@/lib/actions-utils";
import { getSelectedModelId } from "@/lib/ai/models";
import { generationService } from "@/lib/ai/services/generation-service";
import { planningService } from "@/lib/ai/services/planning-service";
import { invalidateCache } from "@/lib/cache";
import { storyRepository } from "@/lib/db/repositories/story-repository";
import {
	type BookPlan,
	bookPlanSchema,
	type StoryStyle,
} from "@/lib/services/schemas/story-schemas";
import { buildSceneGenerationContext } from "@/lib/services/story/story-context-builder";
import { logGenerationUsage } from "@/lib/services/usage-logger";

// Re-export types for backward compatibility
export type { BookPlan, StoryStyle };
export { bookPlanSchema };

/**
 * StoryService
 *
 * The primary business logic layer for interactive story management.
 * It coordinates between the Database (Repository), AI Services (Planning/Generation),
 * and Access Control.
 *
 * Responsibilities:
 * - Planning books and chapters
 * - Orchestrating scene text generation
 * - Managing structure updates (creating scenes/chapters)
 */
export class StoryService {
	/**
	 * Generates a high-level book plan (Outline + Chapters) based on a prompt.
	 * Delegates to `planningService` for the actual AI call.
	 *
	 * @param prompt User's story idea
	 * @param style Optional style configuration (tone, pacing)
	 * @param modelId Optional specific model ID (defaults to 'large')
	 */
	async generateBookPlan(prompt: string, style?: StoryStyle, modelId?: string) {
		return await planningService.generateBookPlan(prompt, style, modelId);
	}

	/**
	 * Persists a generated book plan to the database.
	 *
	 * @param projectId The target project
	 * @param plan The generated plan structure
	 * @param style Style preferences to save with the outline
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
	 * - Fetches chapter details
	 * - Calls `planningService.planChapterScenes`
	 * - Batch creates the new scenes in the database
	 *
	 * @param chapterId The chapter to populate with scenes
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

	/**
	 * Generates prose for a specific scene ("Batch Write" tool).
	 *
	 * Workflow:
	 * 1. Fetches scene context (Chapter info, Outline, Previous scenes)
	 * 2. Builds a context-flooded prompt using `buildSceneGenerationContext`
	 * 3. Calls `generationService.continueWriting` (using the 'Large' model)
	 * 4. Updates the scene content in the database
	 *
	 * @param sceneId The ID of the scene to generate text for
	 */
	async generateSceneText(sceneId: string) {
		// 1. Fetch Data
		const { targetScene, targetChapter, targetOutline, scenesInChapter } =
			await storyRepository.getSceneContextData(sceneId);

		await ensureProjectAccess(targetScene.projectId, true);

		// 2. Build Context
		const { fullContext, styleInstruction } = buildSceneGenerationContext({
			targetScene,
			targetChapter,
			targetOutline,
			scenesInChapter,
		});

		// 3. AI Generation
		const modelId = await getSelectedModelId("large");

		// Use generationService instead of raw continueWriting
		const result = await generationService.continueWriting(
			fullContext,
			`Scene Title: ${targetScene.title}\n\n`,
			{
				modelId,
				style: styleInstruction,
			},
		);

		// 4. Check for errors
		if (result.error) {
			throw new Error(result.error);
		}

		if (!result.text) {
			throw new Error("AI generated empty content for scene");
		}

		// 5. Update DB
		await storyRepository.updateSceneContent(sceneId, result.text);

		// 6. Log Usage (Fire and forget)
		logGenerationUsage({
			projectId: targetScene.projectId,
			usage: result.usage,
			modelId: result.modelId,
			context: {
				projectId: targetScene.projectId,
				generationType: "story_generation",
				stepType: "generate_scene_text",
				chapterId: targetScene.chapterId || undefined,
			},
		}).catch((err: any) =>
			console.error("Failed to log generation usage:", err),
		);
	}
}

export const storyService = new StoryService();
