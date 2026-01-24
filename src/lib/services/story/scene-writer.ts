import "server-only";

import { ensureProjectAccess } from "@/lib/actions-utils";
import { getSelectedModelId } from "@/lib/ai/models";
import { generationService } from "@/lib/ai/writer-service";
import { storyRepository } from "@/lib/db/repositories/story-repository";
import { buildSceneGenerationContext } from "@/lib/services/story/story-context-builder";
import { logGenerationUsage } from "@/lib/services/usage-logger";

export class SceneWriter {
	/**
	 * Generates prose for a specific scene ("Batch Write" tool).
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

export const sceneWriter = new SceneWriter();
