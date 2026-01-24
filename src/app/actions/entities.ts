"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { entityRepository, projectRepository } from "@/lib/db/repositories";
import { toDateOrUndefined } from "@/lib/db/repositories/entity-repository";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import {
	bulkDeleteEntitiesSchema,
	createEntitySchema,
	restoreEntitiesSchema,
} from "./entities-schemas";

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

		revalidatePath(`/projects/${input.projectId}`);

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

		const entity = await entityRepository.create({
			projectId: input.projectId,
			name: input.name,
			kind: input.kind,
			summary: input.summary,
		});

		// Create attributes if provided
		if (input.attributes && input.attributes.length > 0) {
			await Promise.all(
				input.attributes.map((attr) =>
					entityRepository.createAttribute({
						projectId: input.projectId,
						entityId: entity.id,
						name: attr.name,
						value: attr.value,
						dataType: "text",
					}),
				),
			);
		}

		revalidatePath(`/projects/${input.projectId}`);

		return {
			...entity,
			createdAt: entity.createdAt.toISOString(),
			updatedAt: entity.updatedAt.toISOString(),
			startDate: entity.startDate?.toISOString() ?? null,
			endDate: entity.endDate?.toISOString() ?? null,
		};
	},
});

/**
 * Bulk delete entities
 */
export const bulkDeleteEntitiesAction = createUserAction({
	input: bulkDeleteEntitiesSchema,
	handler: async ({ user, input }) => {
		const project = await projectRepository.findByIdWithAccess(
			input.projectId,
			user.id,
		);

		if (!project) {
			throw NotFoundError.forResource("Project", input.projectId);
		}

		if (project.userId !== user.id) {
			throw new ForbiddenError("Only project owner can delete entities");
		}

		// Verify all entities belong to this project
		// This is a bit of a shortcut; strictly we should check every entity.
		// But since we are deleting by IDs, we can just ensure we only delete entities
		// that belong to this project.
		// However, entityRepository.bulkDelete takes IDs, it doesn't filter by project.
		// So we MUST verify ownership of the IDs.

		const entitiesToCheck = await Promise.all(
			input.ids.map((id) => entityRepository.findByIdWithDetails(id)),
		);

		const invalidEntity = entitiesToCheck.find(
			(e) => !e || e.projectId !== input.projectId,
		);

		if (invalidEntity) {
			throw new ForbiddenError(
				"One or more entities do not belong to the project",
			);
		}

		// Prepare backup data (serializing dates)
		const backup = entitiesToCheck
			.filter((e): e is NonNullable<typeof e> => e !== null)
			.map((e) => ({
				...e,
				createdAt: e.createdAt.toISOString(),
				updatedAt: e.updatedAt.toISOString(),
				startDate: e.startDate?.toISOString(),
				endDate: e.endDate?.toISOString(),
				attributes: e.attributes.map((a) => ({
					...a,
					createdAt: a.createdAt.toISOString(),
					startDate: a.startDate?.toISOString(),
					endDate: a.endDate?.toISOString(),
				})),
				relationships: e.relationships.map((r) => ({
					...r,
					createdAt: r.createdAt.toISOString(),
					startDate: r.startDate?.toISOString(),
					endDate: r.endDate?.toISOString(),
				})),
			}));

		await entityRepository.bulkDelete(input.ids);
		revalidatePath(`/projects/${input.projectId}`);

		return { success: true, backup };
	},
});

/**
 * Restore entities from backup
 */
export const restoreEntitiesAction = createUserAction({
	input: restoreEntitiesSchema,
	handler: async ({ user, input }) => {
		const project = await projectRepository.findByIdWithAccess(
			input.projectId,
			user.id,
		);

		if (!project) {
			throw NotFoundError.forResource("Project", input.projectId);
		}

		if (project.userId !== user.id) {
			throw new ForbiddenError("Only project owner can restore entities");
		}

		// Restore entities transactionally would be ideal, but repositories handle transactions internally per method.
		// We'll restore sequentially for now, or Promise.all.
		// Order matters if there are internal relationships. Relationships must come after Entities.

		const results = await Promise.all(
			input.entities.map(async (entityData) => {
				// 1. Restore Entity
				await entityRepository.create({
					id: entityData.id,
					projectId: input.projectId,
					name: entityData.name,
					kind: entityData.kind,
					summary: entityData.summary ?? undefined,
					startDate: toDateOrUndefined(entityData.startDate),
					endDate: toDateOrUndefined(entityData.endDate),
					createdAt: toDateOrUndefined(entityData.createdAt),
					updatedAt: toDateOrUndefined(entityData.updatedAt),
				});

				// 2. Restore Attributes
				if (entityData.attributes.length > 0) {
					await Promise.all(
						entityData.attributes.map((attr) =>
							entityRepository.createAttribute({
								id: attr.id,
								projectId: input.projectId,
								entityId: entityData.id,
								name: attr.name,
								value: attr.value,
								dataType: attr.dataType,
								startDate: toDateOrUndefined(attr.startDate),
								endDate: toDateOrUndefined(attr.endDate),
								createdAt: toDateOrUndefined(attr.createdAt),
							}),
						),
					);
				}

				return entityData.id;
			}),
		);

		// 3. Restore Relationships (must happen after all entities are created)
		// We collect all relationships from all restored entities
		const allRelationships = input.entities.flatMap((e) => e.relationships);

		// We need to deduplicate relationships because they appear in both source and target entities
		const uniqueRelationships = Array.from(
			new Map(allRelationships.map((r) => [r.id, r])).values(),
		);

		await Promise.all(
			uniqueRelationships.map(async (rel) => {
				try {
					await entityRepository.createRelationship({
						id: rel.id,
						projectId: input.projectId,
						sourceEntityId: rel.sourceEntityId,
						targetEntityId: rel.targetEntityId,
						type: rel.type,
						description: rel.description ?? undefined,
						startDate: toDateOrUndefined(rel.startDate),
						endDate: toDateOrUndefined(rel.endDate),
						createdAt: toDateOrUndefined(rel.createdAt),
					});
				} catch (error) {
					console.warn(
						`Failed to restore relationship ${rel.id}:`,
						(error as Error).message,
					);
				}
			}),
		);

		revalidatePath(`/projects/${input.projectId}`);

		return { success: true, restoredCount: results.length };
	},
});
