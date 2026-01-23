import "server-only";
import { and, asc, count, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
	type Entity,
	type EntityAttribute,
	entity,
	entityAttribute,
	type Relationship,
	relationship,
} from "@/lib/db/schema";
import { DatabaseError, NotFoundError, ValidationError } from "@/lib/errors";
import { BaseRepository, type FindOptions } from "./base-repository";

// ============================================================================
// Types
// ============================================================================

export interface CreateEntityInput {
	projectId: string;
	name: string;
	kind: string;
	summary?: string;
	startDate?: Date;
	endDate?: Date;
}

export interface UpdateEntityInput {
	name?: string;
	kind?: string;
	summary?: string;
	startDate?: Date;
	endDate?: Date;
	attributes?: Array<{ name: string; value: string }>;
}

export interface CreateAttributeInput {
	projectId: string;
	entityId: string;
	name: string;
	value: string;
	dataType: string;
	startDate?: Date;
	endDate?: Date;
}

export interface CreateRelationshipInput {
	projectId: string;
	sourceEntityId: string;
	targetEntityId: string;
	type: string;
	description?: string;
	startDate?: Date;
	endDate?: Date;
}

export type EntityWithDetails = Entity & {
	attributes: EntityAttribute[];
	relationships: Relationship[];
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert a string or Date to Date, or undefined if invalid
 * Exported for use by callers who receive string dates from API
 */
export function toDateOrUndefined(
	value: string | Date | undefined | null,
): Date | undefined {
	if (!value) return undefined;
	if (value instanceof Date) return value;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function validateDateRange(
	startDate?: Date,
	endDate?: Date,
	context = "Entity",
): void {
	if (startDate && endDate && startDate > endDate) {
		throw new ValidationError(
			`${context} end date cannot be before the start date.`,
		);
	}
}

// ============================================================================
// Repository Implementation
// ============================================================================

export class EntityRepository extends BaseRepository<
	Entity,
	CreateEntityInput,
	UpdateEntityInput
> {
	/**
	 * Find an entity by ID
	 */
	async findById(id: string): Promise<Entity | null> {
		try {
			const [result] = await db.select().from(entity).where(eq(entity.id, id));
			return result ?? null;
		} catch (error) {
			console.error("EntityRepository.findById error:", error);
			throw new DatabaseError("Failed to find entity");
		}
	}

	/**
	 * Find all entities
	 */
	async findAll(_options?: FindOptions): Promise<Entity[]> {
		try {
			return await db.select().from(entity).orderBy(desc(entity.createdAt));
		} catch (error) {
			console.error("EntityRepository.findAll error:", error);
			throw new DatabaseError("Failed to list entities");
		}
	}

	/**
	 * Find entities by project ID
	 */
	async findByProject(projectId: string): Promise<Entity[]> {
		try {
			return await db
				.select()
				.from(entity)
				.where(eq(entity.projectId, projectId))
				.orderBy(desc(entity.createdAt));
		} catch (error) {
			console.error("EntityRepository.findByProject error:", error);
			throw new DatabaseError("Failed to load entities for project");
		}
	}

	/**
	 * Find all entities with details by project ID
	 */
	async findByProjectWithDetails(
		projectId: string,
	): Promise<EntityWithDetails[]> {
		try {
			const entities = await db
				.select()
				.from(entity)
				.where(eq(entity.projectId, projectId))
				.orderBy(desc(entity.createdAt));

			if (entities.length === 0) return [];

			// Fetch all attributes and relationships in parallel
			const [allAttributes, allRelationships] = await Promise.all([
				db
					.select()
					.from(entityAttribute)
					.where(
						inArray(
							entityAttribute.entityId,
							entities.map((e: Entity) => e.id),
						),
					),
				db
					.select()
					.from(relationship)
					.where(eq(relationship.projectId, projectId)),
			]);

			// Map details to entities
			return entities.map((ent: Entity) => ({
				...ent,
				attributes: allAttributes
					.filter((attr: EntityAttribute) => attr.entityId === ent.id)
					.sort((a: EntityAttribute, b: EntityAttribute) =>
						a.name.localeCompare(b.name),
					),
				relationships: allRelationships
					.filter(
						(rel: Relationship) =>
							rel.sourceEntityId === ent.id || rel.targetEntityId === ent.id,
					)
					.sort(
						(a: Relationship, b: Relationship) =>
							b.createdAt.getTime() - a.createdAt.getTime(),
					),
			}));
		} catch (error) {
			console.error("EntityRepository.findByProjectWithDetails error:", error);
			throw new DatabaseError("Failed to load entity details for project");
		}
	}

	/**
	 * Find entity with all details (attributes and relationships)
	 */
	async findByIdWithDetails(id: string): Promise<EntityWithDetails | null> {
		try {
			const [selectedEntity] = await db
				.select()
				.from(entity)
				.where(eq(entity.id, id));

			if (!selectedEntity) {
				return null;
			}

			const [attributes, relationships] = await Promise.all([
				db
					.select()
					.from(entityAttribute)
					.where(eq(entityAttribute.entityId, id))
					.orderBy(asc(entityAttribute.name)),
				db
					.select()
					.from(relationship)
					.where(
						or(
							eq(relationship.sourceEntityId, id),
							eq(relationship.targetEntityId, id),
						),
					)
					.orderBy(desc(relationship.createdAt)),
			]);

			return { ...selectedEntity, attributes, relationships };
		} catch (error) {
			console.error("EntityRepository.findByIdWithDetails error:", error);
			throw new DatabaseError("Failed to load entity details");
		}
	}

	/**
	 * Create a new entity
	 */
	async create(data: CreateEntityInput): Promise<Entity> {
		validateDateRange(data.startDate, data.endDate);

		try {
			// Check for duplicate name in project
			const [existing] = await db
				.select({ count: count() })
				.from(entity)
				.where(
					and(eq(entity.projectId, data.projectId), eq(entity.name, data.name)),
				)
				.limit(1);

			if (existing?.count && existing.count > 0) {
				throw new ValidationError(
					"An entity with this name already exists in the project.",
				);
			}

			const [created] = await db
				.insert(entity)
				.values({
					projectId: data.projectId,
					name: data.name,
					kind: data.kind,
					summary: data.summary,
					startDate: data.startDate,
					endDate: data.endDate,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			return created;
		} catch (error) {
			if (error instanceof ValidationError) throw error;
			console.error("EntityRepository.create error:", error);
			throw new DatabaseError("Failed to create entity");
		}
	}

	/**
	 * Update an existing entity
	 */
	async update(
		id: string,
		data: UpdateEntityInput,
		projectId?: string,
	): Promise<Entity> {
		validateDateRange(data.startDate, data.endDate);

		try {
			return await db.transaction(async (tx: any) => {
				const updateData: Record<string, unknown> = { updatedAt: new Date() };
				if (data.name !== undefined) updateData.name = data.name;
				if (data.kind !== undefined) updateData.kind = data.kind;
				if (data.summary !== undefined) updateData.summary = data.summary;
				if (data.startDate !== undefined) updateData.startDate = data.startDate;
				if (data.endDate !== undefined) updateData.endDate = data.endDate;

				const [updated] = await tx
					.update(entity)
					.set(updateData)
					.where(
						projectId
							? and(eq(entity.id, id), eq(entity.projectId, projectId))
							: eq(entity.id, id),
					)
					.returning();

				if (!updated) {
					throw NotFoundError.forResource("Entity", id);
				}

				// Handle attributes update if provided
				if (data.attributes) {
					await tx
						.delete(entityAttribute)
						.where(eq(entityAttribute.entityId, id));

					if (data.attributes.length > 0) {
						await tx.insert(entityAttribute).values(
							data.attributes.map((attr) => ({
								projectId: updated.projectId,
								entityId: id,
								name: attr.name,
								value: attr.value,
								dataType: "text",
								createdAt: new Date(),
							})),
						);
					}
				}

				return updated;
			});
		} catch (error) {
			if (error instanceof NotFoundError || error instanceof ValidationError)
				throw error;
			console.error("EntityRepository.update error:", error);
			throw new DatabaseError("Failed to update entity");
		}
	}

	/**
	 * Delete an entity and all related data
	 */
	async delete(id: string, projectId?: string): Promise<void> {
		try {
			await db.transaction(async (tx: any) => {
				// Delete related attributes first
				await tx
					.delete(entityAttribute)
					.where(
						projectId
							? and(
									eq(entityAttribute.entityId, id),
									eq(entityAttribute.projectId, projectId),
								)
							: eq(entityAttribute.entityId, id),
					);

				// Delete related relationships
				await tx
					.delete(relationship)
					.where(
						projectId
							? and(
									or(
										eq(relationship.sourceEntityId, id),
										eq(relationship.targetEntityId, id),
									),
									eq(relationship.projectId, projectId),
								)
							: or(
									eq(relationship.sourceEntityId, id),
									eq(relationship.targetEntityId, id),
								),
					);

				// Delete the entity
				await tx
					.delete(entity)
					.where(
						projectId
							? and(eq(entity.id, id), eq(entity.projectId, projectId))
							: eq(entity.id, id),
					);
			});
		} catch (error) {
			console.error("EntityRepository.delete error:", error);
			throw new DatabaseError("Failed to delete entity");
		}
	}

	/**
	 * Delete multiple entities and their related data
	 */
	async bulkDelete(ids: string[], projectId?: string): Promise<void> {
		if (ids.length === 0) return;

		try {
			await db.transaction(async (tx: any) => {
				// Delete related attributes
				await tx
					.delete(entityAttribute)
					.where(
						projectId
							? and(
									inArray(entityAttribute.entityId, ids),
									eq(entityAttribute.projectId, projectId),
								)
							: inArray(entityAttribute.entityId, ids),
					);

				// Delete related relationships
				await tx
					.delete(relationship)
					.where(
						projectId
							? and(
									or(
										inArray(relationship.sourceEntityId, ids),
										inArray(relationship.targetEntityId, ids),
									),
									eq(relationship.projectId, projectId),
								)
							: or(
									inArray(relationship.sourceEntityId, ids),
									inArray(relationship.targetEntityId, ids),
								),
					);

				// Delete the entities
				await tx
					.delete(entity)
					.where(
						projectId
							? and(inArray(entity.id, ids), eq(entity.projectId, projectId))
							: inArray(entity.id, ids),
					);
			});
		} catch (error) {
			console.error("EntityRepository.bulkDelete error:", error);
			throw new DatabaseError("Failed to bulk delete entities");
		}
	}

	/**
	 * Delete all entities and related data for multiple projects.
	 * Can run within an existing transaction.
	 */
	async deleteByProjectIds(projectIds: string[], tx?: any): Promise<void> {
		const executor = tx || db;
		try {
			await executor
				.delete(relationship)
				.where(inArray(relationship.projectId, projectIds));
			await executor
				.delete(entityAttribute)
				.where(inArray(entityAttribute.projectId, projectIds));
			await executor
				.delete(entity)
				.where(inArray(entity.projectId, projectIds));
		} catch (error) {
			console.error("EntityRepository.deleteByProjectIds error:", error);
			throw new DatabaseError("Failed to delete entity data for projects");
		}
	}

	// ============================================================================
	// Attribute Operations
	// ============================================================================

	/**
	 * Create an entity attribute
	 */
	async createAttribute(data: CreateAttributeInput): Promise<EntityAttribute> {
		validateDateRange(data.startDate, data.endDate, "Attribute");

		try {
			// Check for duplicate attribute name on entity
			const [existing] = await db
				.select({ count: count() })
				.from(entityAttribute)
				.where(
					and(
						eq(entityAttribute.entityId, data.entityId),
						eq(entityAttribute.name, data.name),
					),
				)
				.limit(1);

			if (existing?.count && existing.count > 0) {
				throw new ValidationError(
					"This entity already has an attribute with that name.",
				);
			}

			const [created] = await db
				.insert(entityAttribute)
				.values({
					...data,
					createdAt: new Date(),
				})
				.returning();

			return created;
		} catch (error) {
			if (error instanceof ValidationError) throw error;
			console.error("EntityRepository.createAttribute error:", error);
			throw new DatabaseError("Failed to create entity attribute");
		}
	}

	/**
	 * Get attributes for a project
	 */
	async getAttributesByProject(projectId: string): Promise<EntityAttribute[]> {
		try {
			return await db
				.select()
				.from(entityAttribute)
				.where(eq(entityAttribute.projectId, projectId))
				.orderBy(asc(entityAttribute.name));
		} catch (error) {
			console.error("EntityRepository.getAttributesByProject error:", error);
			throw new DatabaseError("Failed to load attributes");
		}
	}

	// ============================================================================
	// Relationship Operations
	// ============================================================================

	/**
	 * Create a relationship between entities
	 */
	async createRelationship(
		data: CreateRelationshipInput,
	): Promise<Relationship> {
		validateDateRange(data.startDate, data.endDate, "Relationship");

		if (data.sourceEntityId === data.targetEntityId) {
			throw new ValidationError("An entity cannot be related to itself.");
		}

		try {
			// Verify both entities exist and belong to the same project
			const [source, target] = await Promise.all([
				db
					.select()
					.from(entity)
					.where(
						and(
							eq(entity.id, data.sourceEntityId),
							eq(entity.projectId, data.projectId),
						),
					),
				db
					.select()
					.from(entity)
					.where(
						and(
							eq(entity.id, data.targetEntityId),
							eq(entity.projectId, data.projectId),
						),
					),
			]);

			if (!source.length || !target.length) {
				throw new ValidationError(
					"Both related entities must belong to the same project.",
				);
			}

			// Check for duplicate relationship
			const [existing] = await db
				.select({ count: count() })
				.from(relationship)
				.where(
					and(
						eq(relationship.projectId, data.projectId),
						eq(relationship.sourceEntityId, data.sourceEntityId),
						eq(relationship.targetEntityId, data.targetEntityId),
						eq(relationship.type, data.type),
					),
				)
				.limit(1);

			if (existing?.count && existing.count > 0) {
				throw new ValidationError(
					"This relationship already exists for the selected entities.",
				);
			}

			const [created] = await db
				.insert(relationship)
				.values({
					...data,
					createdAt: new Date(),
				})
				.returning();

			return created;
		} catch (error) {
			if (error instanceof ValidationError) throw error;
			console.error("EntityRepository.createRelationship error:", error);
			throw new DatabaseError("Failed to create relationship");
		}
	}

	/**
	 * Get relationships for a project
	 */
	async getRelationshipsByProject(projectId: string): Promise<Relationship[]> {
		try {
			return await db
				.select()
				.from(relationship)
				.where(eq(relationship.projectId, projectId))
				.orderBy(desc(relationship.createdAt));
		} catch (error) {
			console.error("EntityRepository.getRelationshipsByProject error:", error);
			throw new DatabaseError("Failed to load relationships");
		}
	}
}

// Export singleton instance
export const entityRepository = new EntityRepository();
