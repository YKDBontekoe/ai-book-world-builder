import { z } from "zod";

export const bookPlanSchema = z.object({
	title: z.string().describe("The suggested title of the book"),
	logline: z.string().describe("A one-sentence summary of the story"),
	summary: z.string().describe("A paragraph summary of the plot"),
	chapters: z
		.array(
			z.object({
				title: z.string(),
				summary: z.string().describe("What happens in this chapter"),
			}),
		)
		.max(100, "Too many chapters")
		.describe("The list of chapters for the book"),
});

export type BookPlan = z.infer<typeof bookPlanSchema>;

export interface StoryStyle {
	pov: string;
	tone: string;
	genre: string;
}

export const scenePlanSchema = z.object({
	scenes: z
		.array(
			z.object({
				title: z.string(),
				beat: z.string().describe("What happens in this scene"),
			}),
		)
		.max(50, "Too many scenes"),
});

export type ScenePlan = z.infer<typeof scenePlanSchema>;
