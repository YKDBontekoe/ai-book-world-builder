import { generateObject } from "ai";
import { z } from "zod";
import { openrouter } from "@/lib/ai/providers";
import { retrieveContext } from "@/lib/ai/rag";
import { getChunksForSourceMaterial } from "@/lib/db/queries";
import type { EntityDetails } from "@/lib/services/analysis/types";

const entityDetailsSchema = z.object({
	summary: z
		.string()
		.describe("A 2-3 sentence summary of this entity based on the text"),
	attributes: z
		.array(
			z.object({
				name: z
					.string()
					.describe("Attribute name (e.g., 'Personality', 'Role')"),
				value: z.string().describe("Attribute value"),
			}),
		)
		.describe("Key attributes extracted from the text"),
	quotes: z
		.array(z.string())
		.describe("Direct quotes from the text that describe this entity"),
});

export class DetailExtractor {
	constructor(private modelId: string) {}

	async extract(
		entityName: string,
		entityKind: string,
		sourceMaterialId: string,
	): Promise<EntityDetails> {
		// Get all chunks for RAG retrieval
		const allChunks = await getChunksForSourceMaterial({ sourceMaterialId });

		if (allChunks.length === 0) {
			return {
				name: entityName,
				kind: entityKind,
				summary: "No details available",
				attributes: [],
				sourceQuotes: [],
			};
		}

		// Use RAG to find chunks most relevant to this entity
		const candidates = allChunks.map((chunk) => ({
			content: chunk.text,
			metadata: { chunkId: chunk.id, sequence: chunk.sequence },
		}));

		const relevantChunks = await retrieveContext({
			query: `Tell me about ${entityName}, a ${entityKind} in this story`,
			candidates,
			topK: 5,
		});

		if (relevantChunks.length === 0) {
			return {
				name: entityName,
				kind: entityKind,
				summary: "Referenced but no detailed information found",
				attributes: [],
				sourceQuotes: [],
			};
		}

		const relevantText = relevantChunks
			.map((c) => c.content)
			.join("\n\n---\n\n");

		const { object } = await generateObject({
			model: openrouter(this.modelId) as any,
			schema: entityDetailsSchema,
			prompt: `Based on the following text excerpts, extract detailed information about "${entityName}" (a ${entityKind}).

Text excerpts:
${relevantText}

Provide:
1. A summary of who/what this entity is
2. Key attributes (personality traits, physical description, role, abilities, etc.)
3. Direct quotes from the text that describe this entity`,
		});

		return {
			name: entityName,
			kind: entityKind,
			summary: object.summary,
			attributes: object.attributes,
			sourceQuotes: object.quotes,
		};
	}
}
