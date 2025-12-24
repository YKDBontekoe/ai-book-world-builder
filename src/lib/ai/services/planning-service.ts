import { generateObject } from "ai";
import { getSelectedModelId } from "@/lib/ai/models";
import { myProvider } from "@/lib/ai/providers";
import {
	bookPlanSchema,
	type StoryStyle,
	scenePlanSchema,
} from "@/lib/services/schemas/story-schemas";

export class PlanningService {
	async generateBookPlan(prompt: string, style?: StoryStyle, modelId?: string) {
		// Use Large model for complex planning
		const targetModel = modelId || (await getSelectedModelId("large"));

		let promptText = `Create a book outline based on this prompt: "${prompt}".`;
		if (style) {
			promptText += `\nGenre: ${style.genre}\nPOV: ${style.pov}\nTone: ${style.tone}`;
		}
		promptText += `\nStructure it into a logical sequence of chapters (approx 10-20 depending on the scope). Provide a title, logline, and detailed summary.`;

		const { object } = await generateObject({
			model: myProvider.languageModel(targetModel),
			schema: bookPlanSchema,
			prompt: promptText,
		});

		return object;
	}

	async planChapterScenes(
		chapterTitle: string,
		chapterSummary: string,
		modelId?: string,
	) {
		// Use Large model for scene planning
		const targetModel = modelId || (await getSelectedModelId("large"));

		const { object: scenePlan } = await generateObject({
			model: myProvider.languageModel(targetModel),
			schema: scenePlanSchema,
			prompt: `Break this chapter into 3-5 scenes based on its summary.\n\nChapter Title: ${chapterTitle}\nSummary: ${chapterSummary}`,
		});

		return scenePlan;
	}
}

export const planningService = new PlanningService();
