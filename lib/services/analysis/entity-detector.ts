import { gateway } from "@ai-sdk/gateway";
import { generateObject } from "ai";
import { z } from "zod";
import { getSampledChunks } from "@/lib/db/queries";
import type { DetectedEntity } from "./types";

const entityDetectionSchema = z.object({
	entities: z.array(
		z.object({
			name: z.string().describe("The name of the entity"),
			kind: z
				.enum(["character", "location", "organization", "item", "event"])
				.describe("The type of entity"),
			confidence: z.number().min(0).max(100).describe("Confidence score 0-100"),
		}),
	),
});

export class EntityDetector {
	constructor(private modelId: string) {}

	async detect(sourceMaterialId: string): Promise<DetectedEntity[]> {
		// Get sampled chunks (every 5th chunk for fast scan)
		const sampledChunks = await getSampledChunks({
			sourceMaterialId,
			sampleRate: 5,
		});

		if (sampledChunks.length === 0) {
			return [];
		}

		// Combine sampled chunks into a single text (limit to avoid token overflow)
		const combinedText = sampledChunks
			.slice(0, 20) // Max 20 chunks
			.map((c) => c.text)
			.join("\n\n---\n\n");

		const { object } = await generateObject({
			model: gateway.languageModel(this.modelId),
			schema: entityDetectionSchema,
			prompt: `You are analyzing excerpts from a book to identify story elements.

Identify all named entities (characters, locations, organizations, items, major events) mentioned in this text.
Only include entities that are clearly named and appear to be significant to the story.
Assign a confidence score (0-100) based on how sure you are this is a real story element.

Text excerpts:
${combinedText}

List all entities found:`,
		});

		return object.entities.map((e) => ({
			name: e.name,
			kind: e.kind as DetectedEntity["kind"],
			confidence: e.confidence,
		}));
	}
}
