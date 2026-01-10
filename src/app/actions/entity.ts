"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { db } from "@/lib/db";
import {
	getAttributesForProject,
	getEntitiesForProject,
} from "@/lib/db/queries/entity";
import { projectRepository } from "@/lib/db/repositories";
import { entityAttribute } from "@/lib/db/schema";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

// ============================================================================
// Validation Schemas
// ============================================================================

const projectIdSchema = z.object({
	projectId: z.string().uuid("Invalid project ID"),
});

const setImageSchema = z.object({
	entityId: z.string().uuid("Invalid entity ID"),
	imageUrl: z.string().url("Invalid image URL"),
	projectId: z.string().uuid("Invalid project ID"),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get entities with their images for a project
 */
export const getEntitiesWithImagesAction = createUserAction({
	input: projectIdSchema,
	handler: async ({ user, input }) => {
		const project = await projectRepository.findByIdWithAccess(
			input.projectId,
			user.id,
		);

		if (!project) {
			throw NotFoundError.forResource("Project", input.projectId);
		}

		const [entities, attributes] = await Promise.all([
			getEntitiesForProject({ projectId: input.projectId }),
			getAttributesForProject({ projectId: input.projectId }),
		]);

		return entities.map((e) => ({
			...e,
			imageUrl: attributes.find(
				(a) => a.entityId === e.id && a.name === "image_url",
			)?.value,
		}));
	},
});

/**
 * Set an image for an entity
 */
export const setEntityImageAction = createUserAction({
	input: setImageSchema,
	handler: async ({ user, input }) => {
		const project = await projectRepository.findByIdWithAccess(
			input.projectId,
			user.id,
		);

		if (!project) {
			throw NotFoundError.forResource("Project", input.projectId);
		}

		if (project.userId !== user.id) {
			throw new ForbiddenError(
				"Only the project owner can modify entity images",
			);
		}

		// Check if attribute exists
		const [existing] = await db
			.select()
			.from(entityAttribute)
			.where(
				and(
					eq(entityAttribute.entityId, input.entityId),
					eq(entityAttribute.name, "image_url"),
				),
			);

		if (existing) {
			await db
				.update(entityAttribute)
				.set({ value: input.imageUrl } as any)
				.where(eq(entityAttribute.id, existing.id));
		} else {
			await db.insert(entityAttribute).values({
				projectId: input.projectId,
				entityId: input.entityId,
				name: "image_url",
				value: input.imageUrl,
				dataType: "url",
				createdAt: new Date(),
			});
		}

		return { success: true };
	},
});
