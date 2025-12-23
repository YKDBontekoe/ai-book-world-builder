import { ensureProjectAccess } from "@/lib/actions-utils";
import { generationService } from "@/lib/ai/writer"; // Use new service
import { getSelectedModelId } from "@/lib/ai/models";
import { type BookPlan, type StoryStyle } from "@/lib/services/schemas/story-schemas";
import { storyRepository } from "@/lib/db/repositories/story-repository";
import { planningService } from "@/lib/ai/services/planning-service";

// Re-export types for backward compatibility
export type { BookPlan, StoryStyle } from "@/lib/services/schemas/story-schemas";
export { bookPlanSchema } from "@/lib/services/schemas/story-schemas";

export class StoryService {
  async generateBookPlan(prompt: string, style?: StoryStyle, modelId?: string) {
    return await planningService.generateBookPlan(prompt, style, modelId);
  }

  async createBookFromPlan(projectId: string, plan: BookPlan, style?: StoryStyle) {
    await ensureProjectAccess(projectId, true);
    return await storyRepository.createBookFromPlan(projectId, plan, style);
  }

  async planChapterScenes(chapterId: string) {
    const targetChapter = await storyRepository.getChapterWithScenes(chapterId);

    await ensureProjectAccess(targetChapter.projectId, true);

    const scenePlan = await planningService.planChapterScenes(targetChapter.title, targetChapter.notes || "");

    const lastScene = await storyRepository.getLastSceneInChapter(chapterId);

    let startSequence = lastScene ? lastScene.sequence + 1 : 1;

    const scenesToCreate = scenePlan.scenes.map(plan => ({
        title: plan.title,
        sequence: startSequence++
    }));

    return await storyRepository.createScenesBatch(targetChapter.projectId, chapterId, scenesToCreate);
  }

  async generateSceneText(sceneId: string) {
    // 1. Fetch Data
    const { targetScene, targetChapter, targetOutline, scenesInChapter } = await storyRepository.getSceneContextData(sceneId);

    await ensureProjectAccess(targetScene.projectId, true);

    // 2. Build Context
    const previousScenes = scenesInChapter.filter(s => s.sequence < targetScene.sequence);

    // Get full text of immediate predecessor (for continuity)
    const lastScene = previousScenes[previousScenes.length - 1];
    const lastSceneText = lastScene?.content ? `[IMMEDIATELY PREVIOUS SCENE - ${lastScene.title}]\n${lastScene.content.slice(-2000)}` : "";

    // Get summaries of earlier scenes (for arc memory)
    const otherScenesSummary = previousScenes.slice(0, -1).map(s => `[SCENE ${s.title}]: ${s.content ? "Completed" : "Planned"}`).join("\n");

    const chapterContext = `Chapter Title: ${targetChapter.title}\nChapter Summary: ${targetChapter.notes}`;
    const fullContext = `${chapterContext}\n\nPrevious Scenes Summary:\n${otherScenesSummary}\n\n${lastSceneText}`;

    // 3. AI Generation
    const modelId = await getSelectedModelId("large");
    const styleInstruction = targetOutline ? `${targetOutline.pov}, ${targetOutline.tone}` : undefined;

    // Use generationService instead of raw continueWriting
    const { text } = await generationService.continueWriting(
        fullContext,
        `Scene Title: ${targetScene.title}\n\n`,
        {
            modelId,
            style: styleInstruction
        }
    );

    // 4. Update DB
    if (text) {
        await storyRepository.updateSceneContent(sceneId, text);
    }
  }
}

export const storyService = new StoryService();
