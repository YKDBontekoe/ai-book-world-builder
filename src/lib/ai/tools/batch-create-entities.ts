import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { entityRepository, projectRepository } from "@/lib/db/repositories";

export const batchCreateEntities = ({
	session: _session,
	projectId,
}: {
	session: Session | null;
	projectId?: string;
}) =>
	tool({
		description:
			"Create multiple new entities (characters, locations, items, etc.) in the project at once.",
		inputSchema: z.object({
			entities: z.array(
				z.object({
					name: z.string().describe("The name of the entity."),
					kind: z
						.enum([
							"character",
							"location",
							"item",
							"organization",
							"event",
							"other",
						])
						.describe("The type/kind of the entity."),
					summary: z
						.string()
						.optional()
						.describe("A brief summary or description of the entity."),
					attributes: z
						.array(
							z.object({
								name: z
									.string()
									.describe("Name of the attribute (e.g., 'Age', 'Role')"),
								value: z.string().describe("Value of the attribute"),
								dataType: z.string().default("text").describe("Data type"),
							}),
						)
						.optional()
						.describe("Key-value attributes to define the entity."),
				}),
			),
			projectId: z
				.string()
				.optional()
				.describe(
					"The ID of the project to create the entities in. If not provided, it will infer from context or fail.",
				),
		}),
		execute: async (args: {
			entities: Array<{
				name: string;
				kind: string;
				summary?: string;
				attributes?: Array<{ name: string; value: string; dataType: string }>;
			}>;
			projectId?: string;
		}) => {
			const { entities, projectId: projectIdInput } = args;
			const finalProjectId = projectIdInput || projectId;

			if (!_session?.user?.id) {
				return { error: "Authentication required." };
			}

			if (!finalProjectId) {
				return { error: "Project ID is required to create entities." };
			}

			try {
				// SECURITY: Verify project ownership
				await projectRepository.findByIdWithOwnership(
					finalProjectId,
					_session.user.id,
				);

				const results = [];

				for (const entityData of entities) {
					try {
						const entity = await entityRepository.create({
							projectId: finalProjectId,
							name: entityData.name,
							kind: entityData.kind,
							summary: entityData.summary,
						});

						// Create attributes if provided
						if (entityData.attributes && entityData.attributes.length > 0) {
							await Promise.all(
								entityData.attributes.map((attr) =>
									entityRepository.createAttribute({
										projectId: finalProjectId,
										entityId: entity.id,
										name: attr.name,
										value: attr.value,
										dataType: attr.dataType || "text",
									}),
								),
							);
						}

						results.push({
							name: entity.name,
							id: entity.id,
							success: true,
						});
					} catch (err) {
						results.push({
							name: entityData.name,
							success: false,
							error: err instanceof Error ? err.message : String(err),
						});
					}
				}

				const successCount = results.filter((r) => r.success).length;

				return {
					message: `Processed ${results.length} entities. ${successCount} created successfully.`,
					results,
				};
			} catch (error) {
				return {
					error: `Failed to batch create entities: ${error instanceof Error ? error.message : String(error)}`,
				};
			}
		},
	});
