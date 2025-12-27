/**
 * Analysis Service
 *
 * Consolidated service for book analysis operations:
 * - Entity detection
 * - Detail extraction
 * - Relationship inference
 */

import "server-only";

import { z } from "zod";
import { retrieveContext } from "@/lib/ai/rag";
import { BaseAIService } from "@/lib/ai/services/base-ai-service";
import { getChunksForSourceMaterial, getSampledChunks } from "@/lib/db/queries";
import type { SourceMaterialChunk } from "@/lib/db/schema";

// =============================================================================
// Types
// =============================================================================

export type EntityKind =
	| "character"
	| "location"
	| "organization"
	| "item"
	| "event";

export interface DetectedEntity {
	name: string;
	kind: EntityKind;
	confidence: number;
}

export interface EntityDetails {
	name: string;
	kind: string;
	summary: string;
	attributes: Array<{ name: string; value: string }>;
	sourceQuotes: string[];
}

export interface InferredRelationship {
	sourceEntityName: string;
	targetEntityName: string;
	type: string;
	description: string;
	confidence: number;
}

// =============================================================================
// Schemas
// =============================================================================

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

const relationshipSchema = z.object({
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

// =============================================================================
// Service
// =============================================================================

export class AnalysisService extends BaseAIService {
	/**
	 * Detect entities from sampled chunks of source material.
	 */
	async detectEntities(sourceMaterialId: string): Promise<DetectedEntity[]> {
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

		const systemPrompt = `You are an expert literary analyst. Your task is to identify key story elements from text excerpts.
Identify all named entities (characters, locations, organizations, items, major events).
Only include entities that are significant to the story. Assign a confidence score based on the clarity of the reference in the text.`;

		const prompt = `Identify significant entities in the following text excerpts:

${combinedText}

Return the list of detected entities.`;

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			prompt,
			entityDetectionSchema,
			{
				modelRole: "context",
			},
		);

		if (!result.success) {
			throw new Error(result.error);
		}

		return result.data.object.entities.map((e) => ({
			name: e.name,
			kind: e.kind as EntityKind,
			confidence: e.confidence,
		}));
	}

	/**
	 * Extract detailed information about a specific entity.
	 */
	async extractDetails(
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

		const systemPrompt = `You are an expert biographer for fictional characters and worlds. 
Your goal is to extract accurate, detailed information about an entity based on the provided text excerpts. 
Be precise and only include information supported by the text.`;

		const prompt = `Based on the following text excerpts, extract detailed information about "${entityName}" (a ${entityKind}).

Text excerpts:
${relevantText}

Provide a summary, key attributes, and relevant quotes.`;

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			prompt,
			entityDetailsSchema,
			{
				modelRole: "context",
			},
		);

		if (!result.success) {
			return {
				name: entityName,
				kind: entityKind,
				summary: "Failed to extract details",
				attributes: [],
				sourceQuotes: [],
			};
		}

		return {
			name: entityName,
			kind: entityKind,
			summary: result.data.object.summary,
			attributes: result.data.object.attributes,
			sourceQuotes: result.data.object.quotes,
		};
	}

	/**
	 * Infer relationships between detected entities.
	 */
	async inferRelationships(
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

			const systemPrompt = `You are an expert in social dynamics and literary analysis.
Your task is to identify and describe the relationship between two entities based on the provided text excerpts.
Identify the type of relationship (e.g., friend, rival, family) and provide a clear description.`;

			const prompt = `Based on these text excerpts, describe the relationship between "${entity1}" and "${entity2}".

Text excerpts:
${contextText}

Identify how they interact and what their relationship is.`;

			const result = await this.generateObjectWithSystem(
				systemPrompt,
				prompt,
				relationshipSchema,
				{
					modelRole: "context",
				},
			);

			if (result.success) {
				allRelationships.push(
					...result.data.object.relationships.map((r) => ({
						sourceEntityName: r.sourceEntity,
						targetEntityName: r.targetEntity,
						type: r.type,
						description: r.description,
						confidence: r.confidence,
					})),
				);
			}
		}

		return allRelationships;
	}
}

export const analysisService = new AnalysisService();
