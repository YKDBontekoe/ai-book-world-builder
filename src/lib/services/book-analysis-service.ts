import "server-only";

import { gateway } from "@ai-sdk/gateway";
import { generateObject } from "ai";
import { z } from "zod";
import { retrieveContext } from "@/lib/ai/rag";
import {
	createEntity,
	createEntityAttribute,
	createRelationship,
	getChunksForSourceMaterial,
	getEntitiesForProject,
	getSampledChunks,
	getSourceMaterialById,
} from "@/lib/db/queries";
import type { Entity, SourceMaterialChunk } from "@/lib/db/schema";

// Types for analysis results
type DetectedEntity = {
	name: string;
	kind: "character" | "location" | "organization" | "item" | "event";
	confidence: number;
};

type EntityDetails = {
	name: string;
	kind: string;
	summary: string;
	attributes: Array<{ name: string; value: string }>;
	sourceQuotes: string[];
};

type InferredRelationship = {
	sourceEntityName: string;
	targetEntityName: string;
	type: string;
	description: string;
	confidence: number;
};

export type AnalysisResult = {
	sourceMaterialId: string;
	projectId: string;
	entities: Entity[];
	relationships: Array<{
		sourceId: string;
		targetId: string;
		type: string;
	}>;
	stats: {
		chunksAnalyzed: number;
		entitiesDetected: number;
		entitiesCreated: number;
		relationshipsCreated: number;
	};
};

// Schema for entity detection from sampled chunks
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

// Schema for detailed entity extraction
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

// Schema for relationship inference
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

/**
 * BookAnalysisService - Analyzes uploaded books using RAG to extract story elements
 */
export class BookAnalysisService {
	private modelId = "google/gemini-2.0-flash-001";

	/**
	 * Pass 1: Quick entity detection from sampled chunks
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

		return object.entities;
	}

	/**
	 * Pass 2: Use RAG to get detailed information about a specific entity
	 */
	async extractEntityDetails(
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
			model: gateway.languageModel(this.modelId),
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

	/**
	 * Pass 3: Infer relationships between detected entities
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

			try {
				const { object } = await generateObject({
					model: gateway.languageModel(this.modelId),
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

	/**
	 * Full analysis pipeline: detect entities, extract details, infer relationships
	 */
	async analyzeBook(params: {
		sourceMaterialId: string;
		projectId: string;
		userId: string;
		extractRelationships?: boolean;
	}): Promise<AnalysisResult> {
		const { sourceMaterialId, projectId, extractRelationships = true } = params;

		// Verify source material exists and is processed
		const material = await getSourceMaterialById({ id: sourceMaterialId });
		if (!material?.material) {
			throw new Error("Source material not found");
		}

		if (material.material.status !== "processed") {
			throw new Error(
				"Source material has not been processed yet. Please wait for processing to complete.",
			);
		}

		// Get existing entities to avoid duplicates
		const existingEntities = await getEntitiesForProject({ projectId });
		const existingNames = new Set(
			existingEntities.map((e) => e.name.toLowerCase()),
		);

		// Pass 1: Detect entities
		console.log("[BookAnalysis] Pass 1: Detecting entities...");
		const detectedEntities = await this.detectEntities(sourceMaterialId);
		console.log(`[BookAnalysis] Detected ${detectedEntities.length} entities`);

		// Filter out low confidence and duplicates
		const highConfidenceEntities = detectedEntities.filter(
			(e) => e.confidence >= 50 && !existingNames.has(e.name.toLowerCase()),
		);

		// Pass 2: Extract details and create entities
		console.log("[BookAnalysis] Pass 2: Extracting entity details...");
		const createdEntities: Entity[] = [];

		for (const detected of highConfidenceEntities.slice(0, 20)) {
			// Limit to 20 entities
			try {
				const details = await this.extractEntityDetails(
					detected.name,
					detected.kind,
					sourceMaterialId,
				);

				// Create entity
				const entity = await createEntity({
					projectId,
					name: details.name,
					kind: details.kind,
					summary: details.summary,
				});

				// Add source tracking attribute
				await createEntityAttribute({
					projectId,
					entityId: entity.id,
					name: "_inspirationSource",
					value: `book_analysis:${material.material.filename}`,
					dataType: "system",
				});

				// Add extracted attributes
				for (const attr of details.attributes.slice(0, 5)) {
					try {
						await createEntityAttribute({
							projectId,
							entityId: entity.id,
							name: attr.name,
							value: attr.value,
							dataType: "text",
						});
					} catch (_e) {
						// Attribute might already exist
						console.log(`Skipping duplicate attribute ${attr.name}`);
					}
				}

				createdEntities.push(entity);
			} catch (error) {
				console.error(`Failed to create entity ${detected.name}:`, error);
			}
		}

		// Pass 3: Infer relationships
		const createdRelationships: Array<{
			sourceId: string;
			targetId: string;
			type: string;
		}> = [];

		if (extractRelationships && createdEntities.length >= 2) {
			console.log("[BookAnalysis] Pass 3: Inferring relationships...");
			const inferredRelationships = await this.inferRelationships(
				highConfidenceEntities,
				sourceMaterialId,
			);

			// Create relationships between created entities
			for (const inferred of inferredRelationships) {
				const sourceEntity = createdEntities.find(
					(e) =>
						e.name.toLowerCase() === inferred.sourceEntityName.toLowerCase(),
				);
				const targetEntity = createdEntities.find(
					(e) =>
						e.name.toLowerCase() === inferred.targetEntityName.toLowerCase(),
				);

				if (sourceEntity && targetEntity && inferred.confidence >= 60) {
					try {
						await createRelationship({
							projectId,
							sourceEntityId: sourceEntity.id,
							targetEntityId: targetEntity.id,
							type: inferred.type,
							description: inferred.description,
						});

						createdRelationships.push({
							sourceId: sourceEntity.id,
							targetId: targetEntity.id,
							type: inferred.type,
						});
					} catch (_e) {
						// Relationship might already exist
						console.log(`Skipping duplicate relationship`);
					}
				}
			}
		}

		// Get chunk count for stats
		const allChunks = await getChunksForSourceMaterial({ sourceMaterialId });

		return {
			sourceMaterialId,
			projectId,
			entities: createdEntities,
			relationships: createdRelationships,
			stats: {
				chunksAnalyzed: allChunks.length,
				entitiesDetected: detectedEntities.length,
				entitiesCreated: createdEntities.length,
				relationshipsCreated: createdRelationships.length,
			},
		};
	}
}

// Export singleton for convenience
export const bookAnalysisService = new BookAnalysisService();
