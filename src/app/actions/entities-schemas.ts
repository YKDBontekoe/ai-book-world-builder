import { z } from "zod";

export const createEntitySchema = z.object({
	projectId: z.string().uuid("Invalid project ID"),
	name: z.string().min(1, "Name is required").max(200),
	kind: z.string().min(1, "Type is required"),
	summary: z.string().max(2000).optional(),
	attributes: z
		.array(
			z.object({
				name: z.string().min(1, "Attribute name is required"),
				value: z.string().min(1, "Attribute value is required"),
			}),
		)
		.optional(),
});

export const bulkDeleteEntitiesSchema = z.object({
	ids: z.array(z.string().uuid()),
	projectId: z.string().uuid("Invalid project ID"),
});

export const entityBackupSchema = z.object({
	id: z.string().uuid(),
	projectId: z.string().uuid(),
	name: z.string(),
	kind: z.string(),
	summary: z.string().nullable().optional(),
	startDate: z.string().nullable().optional(),
	endDate: z.string().nullable().optional(),
	createdAt: z.string(),
	updatedAt: z.string(),
	attributes: z.array(
		z.object({
			id: z.string().uuid(),
			projectId: z.string().uuid(),
			entityId: z.string().uuid(),
			name: z.string(),
			value: z.string(),
			dataType: z.string(),
			startDate: z.string().nullable().optional(),
			endDate: z.string().nullable().optional(),
			createdAt: z.string(),
		}),
	),
	relationships: z.array(
		z.object({
			id: z.string().uuid(),
			projectId: z.string().uuid(),
			sourceEntityId: z.string().uuid(),
			targetEntityId: z.string().uuid(),
			type: z.string(),
			description: z.string().nullable().optional(),
			startDate: z.string().nullable().optional(),
			endDate: z.string().nullable().optional(),
			createdAt: z.string(),
		}),
	),
});

export const restoreEntitiesSchema = z.object({
	projectId: z.string().uuid("Invalid project ID"),
	entities: z.array(entityBackupSchema),
});
