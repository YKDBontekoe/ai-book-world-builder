import { tool } from "ai";
import { z } from "zod";
import { getEntityById } from "@/lib/db/queries/entity";

export const proposeManageEntities = () =>
	tool({
		description:
			"Propose changes to entities (create, update, delete). " +
			"Use this tool when the user wants to add, modify, or remove characters, locations, items, etc. " +
			"This tool DOES NOT execute the changes. It returns a proposal for the user to review. " +
			"ALWAYS use this tool instead of manageEntities for interactive confirmations.",
		inputSchema: z.object({
			projectId: z.string().describe("Project ID."),
			operations: z
				.array(
					z.object({
						action: z.enum(["create", "update", "delete"]),
						entityId: z
							.string()
							.optional()
							.describe("ID of the entity (required for update/delete)."),
						payload: z
							.object({
								name: z.string().optional(),
								kind: z
									.enum([
										"character",
										"location",
										"item",
										"event",
										"organization",
										"lore",
									])
									.optional(),
								summary: z.string().optional(),
								startDate: z.string().optional(),
								endDate: z.string().optional(),
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
									.optional(),
							})
							.optional()
							.describe("Data for create/update."),
					}),
				)
				.describe("List of proposed operations."),
		}),
		execute: async (args) => {
			const { operations } = args;

			// Enrich operations with entity names if missing (for update/delete)
			const enrichedOperations = await Promise.all(
				operations.map(async (op: any) => {
					if (
						(op.action === "update" || op.action === "delete") &&
						op.entityId
					) {
						// If we don't have a name in the payload (which is typical for delete), try to fetch it
						if (!op.payload?.name) {
							try {
								const entity = await getEntityById({ id: op.entityId });
								if (entity) {
									return {
										...op,
										payload: {
											...op.payload,
											name: entity.name, // Inject name into payload for UI display
											kind: entity.kind,
										},
									};
								}
							} catch (e) {
								console.error("Failed to fetch entity details for proposal", e);
							}
						}
					}
					return op;
				}),
			);

			return {
				message: "Entity proposal generated.",
				proposal: {
					...args,
					operations: enrichedOperations,
				},
			};
		},
	});
