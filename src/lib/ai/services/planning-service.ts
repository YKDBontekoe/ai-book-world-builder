import "server-only";

import { BaseAIService } from "@/lib/ai/services/base-ai-service";
import type { AIGenerationResult } from "@/lib/ai/services/types";
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
	): Promise<{ plan?: BookPlan; error?: string } & AIGenerationResult> {
		const systemPrompt = `You are an expert story architect. Your task is to create a comprehensive book plan based on a user's prompt.

REQUIREMENTS:
- Create a catchy, memorable title
- Write a compelling one-sentence logline
- Write a detailed paragraph summary of the overall plot
- Create 10-20 chapters, each with a title and summary of what happens
- Ensure the story has a clear beginning, middle, and end
- Include satisfying character arcs and plot progression

OUTPUT FORMAT: You must respond with valid JSON only. No markdown, no code blocks, no additional text.`;

		let promptText = `Create a book outline based on this prompt: "${prompt}".`;
		if (style) {
			promptText += `\nGenre: ${style.genre}\nPOV: ${style.pov}\nTone: ${style.tone}`;
		}

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			promptText,
			bookPlanSchema,
			{
				modelId,
				modelRole: "orchestrator",
				maxTokens: 4500,
			},
		);

		if (!result.success) {
			return { error: result.error };
		}

		return {
			plan: result.data.object,
			usage: result.usage,
			modelId: result.modelId,
		};
	}

	/**
	 * Plan scenes for a chapter.
	 */
	async planChapterScenes(
		chapterTitle: string,
		chapterSummary: string,
		modelId?: string,
	): Promise<{ plan?: ScenePlan; error?: string } & AIGenerationResult> {
		const systemPrompt = `You are an expert story architect. Your task is to break down a chapter into a logical sequence of scenes.

REQUIREMENTS:
- Create 3-5 scenes that follow a natural narrative arc for the chapter
- Each scene must have a clear, descriptive title
- Each scene must have a "beat" (a brief summary of what happens in that scene)
- Scenes should flow logically from one to the next
- Include a mix of action, dialogue, and reflection as appropriate

OUTPUT FORMAT: You must respond with valid JSON only. No markdown, no code blocks, no additional text.`;

		const prompt = `Plan the scenes for this chapter:

Chapter Title: ${chapterTitle}
Chapter Summary/Notes: ${chapterSummary || "No summary provided. Create a logical progression based on the title."}

Create a list of scenes with titles and beats.`;

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			prompt,
			scenePlanSchema,
			{
				modelId,
				modelRole: "orchestrator",
				maxTokens: 2500,
			},
		);

		if (!result.success) {
			return { error: result.error };
		}

		return {
			plan: result.data.object,
			usage: result.usage,
			modelId: result.modelId,
		};
	}
}

export const planningService = new PlanningService();
