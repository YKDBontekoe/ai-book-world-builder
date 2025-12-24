import "server-only";

import { getSelectedModelId } from "@/lib/ai/models";
import {
	createEntity,
	createEntityAttribute,
	createRelationship,
	getChunksForSourceMaterial,
	getEntitiesForProject,
	getSourceMaterialById,
} from "@/lib/db/queries";
import type { Entity } from "@/lib/db/schema";
import { DetailExtractor } from "@/lib/services/analysis/detail-extractor";
import { EntityDetector } from "@/lib/services/analysis/entity-detector";
import { RelationshipInferrer } from "@/lib/services/analysis/relationship-inferrer";
import type { AnalysisResult } from "@/lib/services/analysis/types";

export type { AnalysisResult };

/**
 * BookAnalysisService - Analyzes uploaded books using RAG to extract story elements
 */
export class BookAnalysisService {
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

		// Resolve model ID: user preference 'middle' or default 'openrouter/auto'
		const modelId = await getSelectedModelId("middle");

		// Instantiate services with the resolved model ID
		const entityDetector = new EntityDetector(modelId);
		const detailExtractor = new DetailExtractor(modelId);
		const relationshipInferrer = new RelationshipInferrer(modelId);

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
		const detectedEntities = await entityDetector.detect(sourceMaterialId);
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
				const details = await detailExtractor.extract(
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
			const inferredRelationships = await relationshipInferrer.infer(
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
