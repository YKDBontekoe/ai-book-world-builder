import "server-only";

import { BaseAIService } from "@/lib/ai/services/base-ai-service";
import {
	type BookPlan,
	bookPlanSchema,
	type ScenePlan,
	type StoryStyle,
	scenePlanSchema,
} from "@/lib/services/schemas/story-schemas";

export class PlanningService extends BaseAIService {
	/**
	 * Generate a complete book plan from a prompt.
	 */
	async generateBookPlan(
		prompt: string,
		style?: StoryStyle,
		modelId?: string,
	): Promise<{ plan?: BookPlan; error?: string }> {
		let promptText = `Create a book outline based on this prompt: "${prompt}".`;
		if (style) {
			promptText += `\nGenre: ${style.genre}\nPOV: ${style.pov}\nTone: ${style.tone}`;
		}
		promptText += `\nStructure it into a logical sequence of chapters (approx 10-20 depending on the scope). Provide a title, logline, and detailed summary.`;

		const result = await this.generateObject(promptText, bookPlanSchema, {
			modelId,
			modelRole: "orchestrator",
			maxTokens: 4000,
		});

		if (!result.success) {
			return { error: result.error };
		}

		return { plan: result.data.object };
	}

	/**
	 * Plan scenes for a chapter.
	 */
	async planChapterScenes(
		chapterTitle: string,
		chapterSummary: string,
		modelId?: string,
	): Promise<{ plan?: ScenePlan; error?: string }> {
		const prompt = `Break this chapter into 3-5 scenes based on its summary.\n\nChapter Title: ${chapterTitle}\nSummary: ${chapterSummary}`;

		const result = await this.generateObject(prompt, scenePlanSchema, {
			modelId,
			modelRole: "orchestrator",
			maxTokens: 2000,
		});

		if (!result.success) {
			return { error: result.error };
		}

		return { plan: result.data.object };
	}
}

export const planningService = new PlanningService();
