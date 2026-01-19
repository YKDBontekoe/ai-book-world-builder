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

const createEntitySchema = z.object({
	projectId: z.string().uuid("Invalid project ID"),
	name: z.string().min(1, "Name is required").max(200),
	kind: z.string().min(1, "Type is required"),
	summary: z.string().max(2000).optional(),
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

const bulkDeleteSchema = z.object({
	ids: z.array(z.string().uuid("Invalid entity ID")),
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
 * Create a new entity
 */
export const createEntityAction = createUserAction({
	input: createEntitySchema,
	handler: async ({ user, input }) => {
		const project = await projectRepository.findByIdWithAccess(
			input.projectId,
			user.id,
		);

		if (!project) {
			throw NotFoundError.forResource("Project", input.projectId);
		}

		if (project.userId !== user.id) {
			throw new ForbiddenError("Only project owner can create entities");
		}

		const newEntity = await entityRepository.create({
			projectId: input.projectId,
			name: input.name,
			kind: input.kind,
			summary: input.summary,
		});

		revalidatePath("/(studio)", "layout");

		return {
			...newEntity,
			createdAt: newEntity.createdAt.toISOString(),
			updatedAt: newEntity.updatedAt.toISOString(),
			startDate: newEntity.startDate?.toISOString() ?? null,
			endDate: newEntity.endDate?.toISOString() ?? null,
		};
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

		revalidatePath("/(studio)", "layout");

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
		revalidatePath("/(studio)", "layout");

		return { success: true };
	},
});

/**
 * Bulk delete entities
 */
export const bulkDeleteEntitiesAction = createUserAction({
	input: bulkDeleteSchema,
	handler: async ({ user, input }) => {
		if (input.ids.length === 0) {
			return { success: true, count: 0 };
		}

		// Verify ownership of the first entity to check project access
		// Optimization: In a real bulk delete, we might want to check all, or check project ID.
		// For now, let's assuming all belong to the same project or check one by one is too slow.
		// Better approach: fetch all entities, check if they belong to a project the user owns.

		// For simplicity/performance, we'll fetch them and check.
		const entities = await Promise.all(
			input.ids.map((id) => entityRepository.findById(id)),
		);

		const validEntities = entities.filter((e) => e !== null);

		if (validEntities.length === 0) {
			return { success: true, count: 0 };
		}

		// Check project access for the first one (assuming context usually is one project)
		const firstEntity = validEntities[0];
		if (!firstEntity) {
			// Should be unreachable due to length check
			return { success: true, count: 0 };
		}
		const projectId = firstEntity.projectId;
		const project = await projectRepository.findByIdWithAccess(
			projectId,
			user.id,
		);

		if (!project || project.userId !== user.id) {
			throw new ForbiddenError("Access denied to project or entities");
		}

		// Verify all entities belong to this project or another project the user owns.
		// To be safe and strict: ensure all entities belong to the SAME project verified above.
		const alienEntities = validEntities.filter(
			(e) => e && e.projectId !== projectId,
		);
		if (alienEntities.length > 0) {
			// If they span multiple projects, this simple check fails.
			// But the UI context is usually one project.
			throw new ForbiddenError("Cannot delete entities from multiple projects");
		}

		// Proceed to delete
		await Promise.all(input.ids.map((id) => entityRepository.delete(id)));

		revalidatePath("/(studio)", "layout");

		return { success: true, count: input.ids.length };
	},
});
