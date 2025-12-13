import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
	createEntityAttribute,
	createEntity as createEntityMutation,
} from "@/lib/db/queries";
import type { EntityAttribute } from "@/lib/db/schema/entities";

const inputSchema = z.object({
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
				dataType: z
					.string()
					.default("text")
					.describe("Data type (text, number, etc.)"),
			}),
		)
		.optional()
		.describe("Key-value attributes to define the entity."),
	projectId: z
		.string()
		.optional()
		.describe(
			"The ID of the project to create the entity in. If not provided, it will infer from context or fail.",
		),
});

export const createEntity = ({
	projectId,
}: {
	session: Session | null;
	projectId?: string;
}) =>
	tool({
		description:
			"Create a new entity (character, location, item, etc.) in the project.",
		inputSchema,
		execute: async (args: z.infer<typeof inputSchema>) => {
			const {
				name,
				kind,
				summary,
				attributes,
				projectId: projectIdInput,
			} = args;
			const finalProjectId = projectIdInput || projectId;

			if (!finalProjectId) {
				return { error: "Project ID is required to create an entity." };
			}

			try {
				const entity = await createEntityMutation({
					projectId: finalProjectId,
					name,
					kind,
					summary,
				});

				let createdAttributes: EntityAttribute[] = [];
				if (attributes && attributes.length > 0) {
					createdAttributes = await Promise.all(
						attributes.map((attr) =>
							createEntityAttribute({
								projectId: finalProjectId,
								entityId: entity.id,
								name: attr.name,
								value: attr.value,
								dataType: attr.dataType || "text",
							}),
						),
					);
				}

				return {
					message: `Entity '${name}' created successfully.`,
					entity: {
						...entity,
						attributes: createdAttributes,
						createdAt: entity.createdAt.toISOString(),
						updatedAt: entity.updatedAt.toISOString(),
						startDate: entity.startDate?.toISOString() ?? null,
						endDate: entity.endDate?.toISOString() ?? null,
					},
				};
			} catch (error) {
				return {
					error: `Failed to create entity: ${error instanceof Error ? error.message : String(error)}`,
				};
			}
		},
	});
