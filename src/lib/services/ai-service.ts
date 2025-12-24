import "server-only";

import {
	ensureProjectAccess,
} from "@/lib/actions-utils";
import { openrouter } from "@/lib/ai/providers";
import { generationService } from "@/lib/ai/writer-service";
import {
	createEntity,
	createEntityAttribute,
	db,
	getEntitiesForProject,
	getScenesForChapter,
	updateSceneContent,
} from "@/lib/db/queries";
import { scene } from "@/lib/db/schema";
import { generateObject } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";

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

const loreSchema = z.object({
	name: z.string(),
	kind: z.enum([
		"character",
		"location",
		"item",
		"event",
		"organization",
		"lore",
	]),
	summary: z.string(),
	attributes: z.array(
		z.object({
			name: z.string(),
			value: z.string(),
		}),
	),
});

/**
 * AI Service
 *
 * Central service for High-Level AI Operations that don't fit into
 * purely "structural" (StoryService) or "ingestion" (BookAnalysisService) buckets.
 */
export class AIService {
	/**
	 * Helper to verify scene access
	 */
	private async verifySceneAccess(sceneId: string) {
		const sceneItem = await db.query.scene.findFirst({
			where: eq(scene.id, sceneId),
			columns: { projectId: true },
		});
		if (!sceneItem) throw new Error("Scene not found");
		await ensureProjectAccess(sceneItem.projectId, true);
	}

	/**
	 * Helper to verify chapter access (via first scene or direct lookup if needed)
	 * For now, we assume chapter operations fetch scenes first.
	 */
	private async verifyProjectAccessViaScenes(scenes: { projectId: string }[]) {
		if (scenes.length === 0) return;
		await ensureProjectAccess(scenes[0].projectId, true);
	}

	/**
	 * Batch writes all scenes in a chapter.
	 * Iterates sequentially to maintain context.
	 */
	async batchWriteChapter(
		chapterId: string,
		instructions?: string,
	): Promise<{ success: boolean; writtenCount: number }> {
		const scenes = await getScenesForChapter({ chapterId });
		if (!scenes || scenes.length === 0) {
			throw new Error("No scenes found in chapter.");
		}

		// Verify access using the first scene's project ID
		// Note: getScenesForChapter returns objects with projectId
		await this.verifyProjectAccessViaScenes(scenes);

		let writtenCount = 0;
		// Sort by sequence to ensure logical flow
		const sortedScenes = scenes.sort((a, b) => a.sequence - b.sequence);

		for (const sceneItem of sortedScenes) {
			// Skip if already has substantial content (safety check)
			// User can use 'Rewrite' for existing content
			if (sceneItem.content && sceneItem.content.length > 500) {
				continue;
			}

			try {
				const { text } = await generationService.draftScene(
					sceneItem.title,
					{
						purpose: "Part of batch generation", // Minimal context
					},
					instructions,
				);

				if (text) {
					await updateSceneContent({
						sceneId: sceneItem.id,
						content: text,
						status: "drafted",
					});
					writtenCount++;
				}
			} catch (e) {
				console.error(`Failed to write scene ${sceneItem.id}`, e);
				// Continue to next scene instead of failing whole batch
			}
		}

		return { success: true, writtenCount };
	}

	/**
	 * Rewrites a specific scene based on instructions.
	 */
	async rewriteScene(
		sceneId: string,
		instructions: string,
	): Promise<{ text: string }> {
		await this.verifySceneAccess(sceneId);

		const sceneItem = await db.query.scene.findFirst({
			where: eq(scene.id, sceneId),
		});

		if (!sceneItem) throw new Error("Scene not found");

		const prompt = `
      You are an expert editor and fiction writer.
      Rewrite the following scene based on these instructions: "${instructions}"

      Original Scene Title: ${sceneItem.title}
      Original Content:
      ${sceneItem.content || "(No content yet)"}
    `;

		const { text } = await generationService.continueWriting(
			"", // No previous context needed for a strict rewrite
			prompt,
			{ modelId: "large" }
		);

		if (!text) throw new Error("Failed to generate rewrite.");

		return { text };
	}

	/**
	 * Expands a skeletal scene into full prose.
	 */
	async expandScene(
		sceneId: string,
		notes: string,
	): Promise<{ text: string }> {
		await this.verifySceneAccess(sceneId);

		const sceneItem = await db.query.scene.findFirst({
			where: eq(scene.id, sceneId),
		});
		if (!sceneItem) throw new Error("Scene not found");

		const prompt = `
      You are an expert fiction writer.
      Expand the following rough notes/skeleton into a full, vivid scene.
      Focus on sensory details, dialogue, and pacing.

      Scene Title: ${sceneItem.title}
      Notes/Skeleton:
      ${notes || sceneItem.content || ""}
    `;

		const { text } = await generationService.continueWriting(
			"",
			prompt,
			{ modelId: "large" }
		);

		if (!text) throw new Error("Failed to generate text.");

		return { text };
	}

	/**
	 * Critiques a chapter's content.
	 */
	async critiqueChapter(chapterId: string): Promise<z.infer<typeof critiqueSchema>> {
		// Fetch all content
		const scenes = await getScenesForChapter({ chapterId });
		if (!scenes.length) throw new Error("Chapter is empty");

		await this.verifyProjectAccessViaScenes(scenes);

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
			model: openrouter("google/gemini-2.0-flash-001"), // Fast, good reasoning
			schema: critiqueSchema,
			prompt,
		});

		return object;
	}

	/**
	 * Checks for consistency errors in a chapter.
	 */
	async analyzeConsistency(
		chapterId: string,
	): Promise<z.infer<typeof consistencySchema>> {
		const scenes = await getScenesForChapter({ chapterId });
		if (!scenes.length) throw new Error("Chapter is empty");

		await this.verifyProjectAccessViaScenes(scenes);

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
	}

	/**
	 * Generates a new Lore entity based on a prompt.
	 */
	async generateLore(
		projectId: string,
		prompt: string,
		category: string = "lore",
	) {
		await ensureProjectAccess(projectId);

		const { object } = await generateObject({
			model: openrouter("google/gemini-2.0-flash-001"),
			schema: loreSchema,
			prompt: `
        Create a new world-building entity for a story.
        Category: ${category}
        User Request: ${prompt}

        Return a rich description and key attributes.
      `,
		});

		// Create in DB
		const entity = await createEntity({
			projectId,
			name: object.name,
			kind: object.kind,
			summary: object.summary,
		});

		for (const attr of object.attributes) {
			await createEntityAttribute({
				projectId,
				entityId: entity.id,
				name: attr.name,
				value: attr.value,
				dataType: "text",
			});
		}

		return entity;
	}

	/**
	 * Semantically searches the project (currently simple context search).
	 */
	async searchProject(projectId: string, query: string): Promise<string> {
		await ensureProjectAccess(projectId);

		// 1. Fetch all entities (and maybe recent scenes?)
		const entities = await getEntitiesForProject({ projectId });
		const context = entities
			.map((e) => `[Entity: ${e.name} (${e.kind})] ${e.summary}`)
			.join("\n");

		// 2. Ask LLM to answer based on context
		const prompt = `
      You are a helper for a fiction writer.
      Answer the user's question based *only* on the provided project context.
      If the answer isn't in the context, say "I couldn't find that in your notes."

      Project Context:
      ${context}

      User Question: "${query}"
    `;

		const { text } = await generationService.continueWriting(
			"",
			prompt,
			{ modelId: "light" }
		);

		return text || "No results found.";
	}
}

export const aiService = new AIService();
