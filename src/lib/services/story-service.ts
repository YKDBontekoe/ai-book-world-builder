import { ensureProjectAccess } from "@/lib/actions-utils";
import { getSelectedModelId } from "@/lib/ai/models";
import { planningService } from "@/lib/ai/services/planning-service";
import { generationService } from "@/lib/ai/writer-service"; // Use new service
import { invalidateCache } from "@/lib/cache";
import { storyRepository } from "@/lib/db/repositories/story-repository";
import type {
	BookPlan,
	StoryStyle,
} from "@/lib/services/schemas/story-schemas";
import { buildSceneGenerationContext } from "@/lib/services/story/story-context-builder";

// Re-export types for backward compatibility
export type {
	BookPlan,
	StoryStyle,
} from "@/lib/services/schemas/story-schemas";
export { bookPlanSchema } from "@/lib/services/schemas/story-schemas";

export class StoryService {
	async generateBookPlan(prompt: string, style?: StoryStyle, modelId?: string) {
		return await planningService.generateBookPlan(prompt, style, modelId);
	}

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
	}
}

export const storyService = new StoryService();
