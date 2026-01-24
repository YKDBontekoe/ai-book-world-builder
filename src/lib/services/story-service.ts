import "server-only";

import {
	type BookPlan,
	bookPlanSchema,
	type StoryStyle,
} from "@/lib/services/schemas/story-schemas";
import { sceneWriter } from "@/lib/services/story/scene-writer";
import { storyPlanner } from "@/lib/services/story/story-planner";

// Re-export types for backward compatibility
export type { BookPlan, StoryStyle };
export { bookPlanSchema };

/**
 * StoryService
 *
 * Facade for Story Planning and Generation.
 * Delegates to StoryPlanner and SceneWriter.
 *
 * Responsibilities:
 * - Planning books and chapters (Delegated to StoryPlanner)
 * - Orchestrating scene text generation (Delegated to SceneWriter)
 */
export class StoryService {
	/**
	 * Generates a high-level book plan (Outline + Chapters) based on a prompt.
	 */
	async generateBookPlan(prompt: string, style?: StoryStyle, modelId?: string) {
		return await storyPlanner.generateBookPlan(prompt, style, modelId);
	}

	/**
	 * Persists a generated book plan to the database.
	 */
	async createBookFromPlan(
		projectId: string,
		plan: BookPlan,
		style?: StoryStyle,
	) {
		return await storyPlanner.createBookFromPlan(projectId, plan, style);
	}

	/**
	 * Generates a list of scenes for a specific chapter based on the chapter's summary and context.
	 */
	async planChapterScenes(chapterId: string) {
		return await storyPlanner.planChapterScenes(chapterId);
	}

	/**
	 * Generates prose for a specific scene ("Batch Write" tool).
	 */
	async generateSceneText(sceneId: string) {
		return await sceneWriter.generateSceneText(sceneId);
	}
}

export const storyService = new StoryService();
