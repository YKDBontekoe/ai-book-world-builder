import { z } from "zod";

export const createEntitySchema = z.object({
	projectId: z.string().uuid("Invalid project ID"),
	name: z.string().min(1, "Name is required").max(200),
	kind: z.string().min(1, "Type is required"),
	summary: z.string().max(2000).optional(),
	attributes: z
		.array(
			z.object({
				name: z.string(),
				value: z.string(),
			}),
		)
		.optional(),
});

export const bulkDeleteEntitiesSchema = z.object({
	ids: z.array(z.string().uuid()),
	projectId: z.string().uuid("Invalid project ID"),
});
