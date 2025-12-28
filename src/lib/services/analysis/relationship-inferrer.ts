import { generateObject } from "ai";
import { z } from "zod";
import { openrouter } from "@/lib/ai/providers";
import { getChunksForSourceMaterial } from "@/lib/db/queries";
import type { SourceMaterialChunk } from "@/lib/db/schema";
import type {
	DetectedEntity,
	InferredRelationship,
} from "@/lib/services/analysis/types";

const relationshipInferenceSchema = z.object({
	relationships: z.array(
		z.object({
			sourceEntity: z.string(),
			targetEntity: z.string(),
			type: z
				.string()
				.describe(
					"Relationship type (e.g., 'friend', 'enemy', 'mentor', 'parent', 'rival')",
				),
			description: z.string().describe("Brief description of the relationship"),
			confidence: z.number().min(0).max(100),
		}),
	),
});

export class RelationshipInferrer {
	constructor(private modelId: string) {}

	async infer(
		entities: DetectedEntity[],
		sourceMaterialId: string,
	): Promise<InferredRelationship[]> {
		if (entities.length < 2) {
			return [];
		}

		// Get chunks for RAG
		const allChunks = await getChunksForSourceMaterial({ sourceMaterialId });

		// Find chunks where multiple entities appear together
		const characterEntities = entities.filter((e) => e.kind === "character");
		const entityNames = characterEntities.map((e) => e.name.toLowerCase());

		// Find co-occurring pairs
		const coOccurrences = new Map<string, SourceMaterialChunk[]>();

		for (const chunk of allChunks) {
			const chunkLower = chunk.text.toLowerCase();
			const foundEntities = entityNames.filter((name) =>
				chunkLower.includes(name),
			);

			if (foundEntities.length >= 2) {
				// Create pairs
				for (let i = 0; i < foundEntities.length; i++) {
					for (let j = i + 1; j < foundEntities.length; j++) {
						const pairKey = [foundEntities[i], foundEntities[j]]
							.sort()
							.join("|");
						const existing = coOccurrences.get(pairKey) || [];
						existing.push(chunk);
						coOccurrences.set(pairKey, existing);
					}
				}
			}
		}

		if (coOccurrences.size === 0) {
			return [];
		}

		// Analyze top co-occurring pairs (limit to 10 pairs)
		const topPairs = Array.from(coOccurrences.entries())
			.sort((a, b) => b[1].length - a[1].length)
			.slice(0, 10);

		const allRelationships: InferredRelationship[] = [];

		for (const [pairKey, chunks] of topPairs) {
			const [entity1, entity2] = pairKey.split("|");
			const contextText = chunks
				.slice(0, 3)
				.map((c) => c.text)
				.join("\n\n---\n\n");

			try {
				const { object } = await generateObject({
					model: openrouter(this.modelId) as any,
					schema: relationshipInferenceSchema,
					prompt: `Based on these text excerpts, describe the relationship between "${entity1}" and "${entity2}".

Text excerpts:
${contextText}

What is their relationship?`,
				});

				allRelationships.push(
					...object.relationships.map((r) => ({
						sourceEntityName: r.sourceEntity,
						targetEntityName: r.targetEntity,
						type: r.type,
						description: r.description,
						confidence: r.confidence,
					})),
				);
			} catch (error) {
				console.error(`Failed to infer relationship for ${pairKey}:`, error);
			}
		}

		return allRelationships;
	}
}
