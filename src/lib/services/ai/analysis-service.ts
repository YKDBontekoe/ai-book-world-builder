import "server-only";

import { generateObject } from "ai";
import { z } from "zod";
import { openrouter } from "@/lib/ai/providers";
import { getEntitiesForProject, getScenesForChapter } from "@/lib/db/queries";
import { verifyProjectAccessViaScenes } from "./utils";

// Schema Definitions
const critiqueSchema = z.object({
	strengths: z.array(z.string()).describe("List of what works well."),
	weaknesses: z
		.array(z.string())
		.describe("List of areas needing improvement."),
	pacing: z
		.string()
		.describe("Analysis of the pacing (too fast, too slow, good)."),
	tone: z.string().describe("Analysis of the tone consistency."),
	suggestions: z
		.array(z.string())
		.describe("Actionable suggestions for improvement."),
});

const consistencySchema = z.object({
	issues: z.array(
		z.object({
			type: z.enum(["plot", "character", "setting", "timeline"]),
			description: z.string(),
			location: z.string().describe("Where in the text this issue occurs."),
			severity: z.enum(["high", "medium", "low"]),
		}),
	),
	overallCoherence: z.number().describe("Score from 0 to 10."),
});

export const analysisService = {
	/**
	 * Critiques a chapter's content.
	 */
	async critiqueChapter(
		chapterId: string,
	): Promise<z.infer<typeof critiqueSchema>> {
		const scenes = await getScenesForChapter({ chapterId });
		if (!scenes.length) throw new Error("Chapter is empty");

		await verifyProjectAccessViaScenes(scenes);

		const fullText = scenes
			.sort((a, b) => a.sequence - b.sequence)
			.map((s) => `[SCENE: ${s.title}]\n${s.content || "(Not written)"}`)
			.join("\n\n");

		const prompt = `
      Analyze the following fiction chapter. Provide a critique on strengths, weaknesses, pacing, and tone.
      Be constructive but honest.

      Chapter Text:
      ${fullText}
    `;

		const { object } = await generateObject({
			model: openrouter("google/gemini-2.0-flash-001"),
			schema: critiqueSchema,
			prompt,
		});

		return object;
	},

	/**
	 * Checks for consistency errors in a chapter.
	 */
	async analyzeConsistency(
		chapterId: string,
	): Promise<z.infer<typeof consistencySchema>> {
		const scenes = await getScenesForChapter({ chapterId });
		if (!scenes.length) throw new Error("Chapter is empty");

		await verifyProjectAccessViaScenes(scenes);

		const firstScene = scenes[0];
		const entities = await getEntitiesForProject({
			projectId: firstScene.projectId,
		});

		const entityContext = entities
			.map((e) => `${e.name} (${e.kind}): ${e.summary}`)
			.join("\n");

		const fullText = scenes
			.sort((a, b) => a.sequence - b.sequence)
			.map((s) => `[SCENE: ${s.title}]\n${s.content || "(Not written)"}`)
			.join("\n\n");

		const prompt = `
      Analyze the following chapter for consistency errors.
      Check for:
      1. Plot holes or contradictions.
      2. Character inconsistencies (names, behavior, physical traits).
      3. Setting/Timeline errors.

      Known Entities (Context):
      ${entityContext}

      Chapter Text:
      ${fullText}
    `;

		const { object } = await generateObject({
			model: openrouter("google/gemini-2.0-flash-001"),
			schema: consistencySchema,
			prompt,
		});

		return object;
	},
};
