import "server-only";

import { generateObject } from "ai";
import { z } from "zod";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { getSelectedModelId } from "@/lib/ai/models";
import { openrouter } from "@/lib/ai/providers";
import { generationService } from "@/lib/ai/writer-service";
import {
	createEntity,
	createEntityAttribute,
	getEntitiesForProject,
} from "@/lib/db/queries";

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

const summarySchema = z.object({
	summary: z.string(),
});

export const loreService = {
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
			model: openrouter(await getSelectedModelId("large")),
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
	},

	/**
	 * Generates a summary for an entity based on its name and type.
	 */
	async generateEntitySummary(
		projectId: string,
		name: string,
		kind: string,
	): Promise<string> {
		await ensureProjectAccess(projectId);

		const { object } = await generateObject({
			model: openrouter(await getSelectedModelId("light")),
			schema: summarySchema,
			prompt: `
        Write a brief, creative summary (max 3 sentences) for a story entity.
        Name: ${name}
        Type: ${kind}

        Be creative but concise.
      `,
		});

		return object.summary;
	},

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

		const { text } = await generationService.continueWriting("", prompt, {
			modelId: "light",
		});

		return text || "No results found.";
	},
};
