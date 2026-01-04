"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { entityRepository, projectRepository } from "@/lib/db/repositories";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

// ============================================================================
// Validation Schemas
// ============================================================================

const projectIdSchema = z.object({
	projectId: z.string().uuid("Invalid project ID"),
});

const updateEntitySchema = z.object({
	id: z.string().uuid("Invalid entity ID"),
	projectId: z.string().uuid("Invalid project ID"),
	name: z.string().max(200).optional(),
	kind: z.string().optional(),
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

const entityIdSchema = z.object({
	id: z.string().uuid("Invalid entity ID"),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get all entities for a project with full details
 */
export const getEntitiesForProject = createUserAction({
	input: projectIdSchema,
	handler: async ({ user, input }) => {
		const project = await projectRepository.findByIdWithAccess(
			input.projectId,
			user.id,
		);

		if (!project) {
			throw NotFoundError.forResource("Project", input.projectId);
		}

		return await entityRepository.findByProjectWithDetails(input.projectId);
	},
});

/**
 * Get entities for a project (serialized for client)
 */
export const getEntities = createUserAction({
	input: projectIdSchema,
	handler: async ({ user, input }) => {
		const project = await projectRepository.findByIdWithAccess(
			input.projectId,
			user.id,
		);

		if (!project) {
			throw NotFoundError.forResource("Project", input.projectId);
		}

		const entities = await entityRepository.findByProject(input.projectId);

		// Serialize dates
		return entities.map((entity) => ({
			...entity,
			createdAt: entity.createdAt.toISOString(),
			updatedAt: entity.updatedAt.toISOString(),
			startDate: entity.startDate?.toISOString() ?? null,
			endDate: entity.endDate?.toISOString() ?? null,
		}));
	},
});

/**
 * Update an entity
 */
export const updateEntityAction = createUserAction({
	input: updateEntitySchema,
	handler: async ({ user, input }) => {
		const entity = await entityRepository.findById(input.id);

		if (!entity) {
			throw NotFoundError.forResource("Entity", input.id);
		}

		const project = await projectRepository.findByIdWithAccess(
			entity.projectId,
			user.id,
		);

		if (!project) {
			throw new ForbiddenError("Access denied to entity");
		}

		if (project.userId !== user.id) {
			throw new ForbiddenError("Only project owner can modify entities");
		}

		if (entity.projectId !== input.projectId) {
			throw new ForbiddenError(
				"Entity does not belong to the provided project",
			);
		}

		const updatedEntity = await entityRepository.update(input.id, {
			name: input.name,
			kind: input.kind,
			summary: input.summary,
			attributes: input.attributes,
		});

		return {
			...updatedEntity,
			createdAt: updatedEntity.createdAt.toISOString(),
			updatedAt: updatedEntity.updatedAt.toISOString(),
			startDate: updatedEntity.startDate?.toISOString() ?? null,
			endDate: updatedEntity.endDate?.toISOString() ?? null,
		};
	},
});

/**
 * Delete an entity
 */
export const deleteEntityAction = createUserAction({
	input: entityIdSchema,
	handler: async ({ user, input }) => {
		const entity = await entityRepository.findById(input.id);

		if (!entity) {
			throw NotFoundError.forResource("Entity", input.id);
		}

		const project = await projectRepository.findByIdWithAccess(
			entity.projectId,
			user.id,
		);

		if (!project) {
			throw new ForbiddenError("Access denied to entity");
		}

		if (project.userId !== user.id) {
			throw new ForbiddenError("Only project owner can delete entities");
		}

		await entityRepository.delete(input.id);
		revalidatePath("/(chat)", "page");

		return { success: true };
	},
});
