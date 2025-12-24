import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { entityRepository } from "@/lib/db/repositories";

const analyzeCharacterSchema = z.object({
	entityName: z
		.string()
		.describe("The name of the character entity to analyze."),
	projectId: z.string().describe("The ID of the project/world."),
});

export const analyzeCharacter = ({ session }: { session: Session | null }) =>
	tool({
		description:
			"Analyze a character entity to provide insights about their relationships, attributes, and story potential. Returns detailed analysis and suggestions for character development.",
		inputSchema: analyzeCharacterSchema,
		execute: async (args: z.infer<typeof analyzeCharacterSchema>) => {
			const { entityName, projectId } = args;

			if (!session?.user) {
				return { error: "Authentication required to analyze a character." };
			}

			if (!projectId) {
				return { error: "Project ID is required to analyze a character." };
			}

			try {
				// Find the entity by name using repository
				const entities = await entityRepository.findByProject(projectId);
				const entity = entities.find(
					(e) => e.name.toLowerCase() === entityName.toLowerCase().trim(),
				);

				if (!entity) {
					return {
						error: `Character '${entityName}' not found in this project. Please create the character first.`,
					};
				}

				if (entity.kind !== "character") {
					return {
						error: `Entity '${entityName}' is not a character (it's a ${entity.kind}). This tool only analyzes characters.`,
					};
				}

				// Get detailed information using repository
				const entityDetails = await entityRepository.findByIdWithDetails(
					entity.id,
				);

				if (!entityDetails) {
					return { error: "Failed to load character details." };
				}

				// Analyze relationships
				const relationships = entityDetails.relationships;
				const relationshipTypes = new Map<string, number>();
				const connectedEntities: string[] = [];

				for (const rel of relationships) {
					const count = relationshipTypes.get(rel.type) || 0;
					relationshipTypes.set(rel.type, count + 1);

					// Find the other entity in the relationship
					const otherEntityId =
						rel.sourceEntityId === entity.id
							? rel.targetEntityId
							: rel.sourceEntityId;
					const otherEntity = entities.find((e) => e.id === otherEntityId);
					if (otherEntity) {
						connectedEntities.push(otherEntity.name);
					}
				}

				// Build analysis
				const analysis = {
					name: entity.name,
					summary: entity.summary || "No summary provided.",
					attributeCount: entityDetails.attributes.length,
					relationshipCount: relationships.length,
					relationshipTypes: Array.from(relationshipTypes.entries()).map(
						([type, count]) => ({ type, count }),
					),
					connectedTo: connectedEntities,
					attributes: entityDetails.attributes.map((attr) => ({
						name: attr.name,
						value: attr.value,
						dataType: attr.dataType,
					})),
				};

				// Generate suggestions
				const suggestions: string[] = [];

				if (entityDetails.attributes.length === 0) {
					suggestions.push(
						"Consider adding attributes like personality traits, physical appearance, or skills.",
					);
				}

				if (relationships.length === 0) {
					suggestions.push(
						"This character has no relationships. Consider connecting them to other characters or locations.",
					);
				} else if (relationships.length < 3) {
					suggestions.push(
						"This character has few relationships. Adding more connections can create richer story dynamics.",
					);
				}

				if (!entity.summary) {
					suggestions.push(
						"Add a summary to provide context about this character's role and background.",
					);
				}

				const hasConflict = relationships.some((r) =>
					["enemy", "rival", "antagonist"].includes(r.type.toLowerCase()),
				);
				if (!hasConflict) {
					suggestions.push(
						"Consider adding a conflict relationship (enemy, rival) to create dramatic tension.",
					);
				}

				return {
					message: `Analysis complete for character '${entity.name}'.`,
					analysis,
					suggestions,
					storyPotential: {
						networkSize: connectedEntities.length,
						hasConflict,
						developmentLevel:
							entityDetails.attributes.length > 3 ? "detailed" : "basic",
					},
				};
			} catch (error) {
				return {
					error: `Failed to analyze character: ${error instanceof Error ? error.message : String(error)}`,
				};
			}
		},
	});
