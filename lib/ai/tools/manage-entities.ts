import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
	createEntity,
	createEntityAttribute,
	updateEntity,
} from "@/lib/db/queries";

export const manageEntities = ({
	session,
	projectId,
}: {
	session: Session | null;
	projectId?: string;
}) =>
	tool({
		description:
			"Manage entities (characters, locations, items, etc.) in the story bible. " +
			"Can create multiple entities, update existing ones, or add details/attributes. " +
			"Use this for ALL entity-related modifications.",
		inputSchema: z.object({
			projectId: z
				.string()
				.optional()
				.describe("Project ID (optional if context is clear)."),
			action: z.enum(["create", "update"]).describe("The action to perform."),
			entities: z
				.array(
					z.object({
						id: z
							.string()
							.optional()
							.describe("ID of the entity (required for 'update')."),
						name: z
							.string()
							.optional()
							.describe("Name of the entity (required for 'create')."),
						kind: z
							.enum([
								"character",
								"location",
								"item",
								"event",
								"organization",
								"lore",
							])
							.optional()
							.describe("Type of entity (required for 'create')."),
						summary: z
							.string()
							.optional()
							.describe("Brief description or summary."),
						startDate: z
							.string()
							.optional()
							.describe("Start date (YYYY-MM-DD or textual for lore)."),
						endDate: z.string().optional().describe("End date (YYYY-MM-DD)."),
						attributes: z
							.array(
								z.object({
									name: z.string(),
									value: z.string(),
									dataType: z
										.enum(["text", "number", "boolean", "date"])
										.default("text"),
								}),
							)
							.optional()
							.describe("Key-value attributes to define the entity trait."),
					}),
				)
				.describe("List of entities to process."),
		}),
		execute: async (args: any) => {
			const { projectId: projectIdInput, action, entities } = args;
			const finalProjectId = projectIdInput || projectId;

			if (!session?.user) {
				return { error: "Authentication required to manage entities." };
			}

			if (!finalProjectId) {
				return { error: "Project ID is required." };
			}

			const results = [];

			for (const entityData of entities) {
				try {
					if (action === "create") {
						if (!entityData.name || !entityData.kind) {
							results.push({
								name: entityData.name,
								success: false,
								error: "Name and Kind are required for creation.",
							});
							continue;
						}

						const created = await createEntity({
							projectId: finalProjectId,
							name: entityData.name,
							kind: entityData.kind,
							summary: entityData.summary,
							startDate: entityData.startDate,
							endDate: entityData.endDate,
						});

						// Add attributes if present
						if (entityData.attributes && entityData.attributes.length > 0) {
							await Promise.all(
								entityData.attributes.map((attr: any) =>
									createEntityAttribute({
										projectId: finalProjectId,
										entityId: created.id,
										name: attr.name,
										value: attr.value,
										dataType: attr.dataType || "text",
									}),
								),
							);
						}

						results.push({
							name: created.name,
							id: created.id,
							success: true,
							action: "created",
						});
					} else if (action === "update") {
						if (!entityData.id) {
							results.push({
								name: entityData.name,
								success: false,
								error: "ID is required for update.",
							});
							continue;
						}

						const updated = await updateEntity({
							id: entityData.id,
							name: entityData.name,
							kind: entityData.kind,
							summary: entityData.summary,
							startDate: entityData.startDate,
							endDate: entityData.endDate,
							// Note: updateEntity implementation in queries usually replaces attributes entirely if provided
							attributes: entityData.attributes,
						});

						results.push({
							name: updated.name,
							id: updated.id,
							success: true,
							action: "updated",
						});
					}
				} catch (err) {
					results.push({
						name: entityData.name,
						id: entityData.id,
						success: false,
						error: err instanceof Error ? err.message : String(err),
					});
				}
			}

			const successCount = results.filter((r) => r.success).length;

			return {
				message: `Processed ${entities.length} entities. ${successCount} successful.`,
				results,
			};
		},
	});
