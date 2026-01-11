import "server-only";
import { and, asc, count, desc, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/db/safe-query";
import {
	type Entity,
	type EntityAttribute,
	entity,
	entityAttribute,
	type Relationship,
	relationship,
} from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";

function toDateOrUndefined(value: string | undefined | null) {
	if (!value) {
		return;
	}

	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function createEntity({
	projectId,
	name,
	kind,
	summary,
	startDate,
	endDate,
}: {
	projectId: string;
	name: string;
	kind: string;
	summary?: string;
	startDate?: string;
	endDate?: string;
}): Promise<Entity> {
	const parsedStart = toDateOrUndefined(startDate);
	const parsedEnd = toDateOrUndefined(endDate);

	if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
		throw new ChatSDKError(
			"bad_request:api",
			"End date cannot be before the start date.",
		);
	}

	return safeQuery(
		async () => {
			const [existing] = await db
				.select({ count: count() })
				.from(entity)
				.where(and(eq(entity.projectId, projectId), eq(entity.name, name)))
				.limit(1);

			if (existing?.count && existing.count > 0) {
				throw new ChatSDKError(
					"bad_request:api",
					"An entity with this name already exists in the project.",
				);
			}

			const [createdEntity] = await db
				.insert(entity)
				.values({
					projectId,
					name,
					kind,
					summary,
					startDate: parsedStart,
					endDate: parsedEnd,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			return createdEntity;
		},
		{ errorMessage: "Failed to create entity" },
	);
}

export async function updateEntity({
	id,
	name,
	kind,
	summary,
	attributes,
	startDate,
	endDate,
}: {
	id: string;
	name?: string;
	kind?: string;
	summary?: string;
	attributes?: Array<{ name: string; value: string }>;
	startDate?: string;
	endDate?: string;
}): Promise<Entity> {
	const parsedStart = toDateOrUndefined(startDate);
	const parsedEnd = toDateOrUndefined(endDate);

	if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
		throw new ChatSDKError(
			"bad_request:api",
			"End date cannot be before the start date.",
		);
	}

	return safeQuery(
		async () => {
			return await db.transaction(async (tx: any) => {
				const [updatedEntity] = await tx
					.update(entity)
					.set({
						...(name ? { name } : {}),
						...(kind ? { kind } : {}),
						...(summary ? { summary } : {}),
						...(startDate ? { startDate: parsedStart } : {}),
						...(endDate ? { endDate: parsedEnd } : {}),
						updatedAt: new Date(),
					})
					.where(eq(entity.id, id))
					.returning();

				if (!updatedEntity) {
					throw new ChatSDKError("not_found:database", "Entity not found");
				}

				if (attributes) {
					// simple strategy: delete all and recreate
					await tx
						.delete(entityAttribute)
						.where(eq(entityAttribute.entityId, id));

					if (attributes.length > 0) {
						await tx.insert(entityAttribute).values(
							attributes.map((attr) => ({
								projectId: updatedEntity.projectId,
								entityId: id,
								name: attr.name,
								value: attr.value,
								dataType: "text", // defaulting to text
								createdAt: new Date(),
							})),
						);
					}
				}

				return updatedEntity;
			});
		},
		{ errorMessage: "Failed to update entity" },
	);
}

export async function getEntitiesForProject({
	projectId,
}: {
	projectId: string;
}): Promise<Entity[]> {
	return safeQuery(
		async () => {
			return await db
				.select()
				.from(entity)
				.where(eq(entity.projectId, projectId))
				.orderBy(desc(entity.createdAt));
		},
		{ errorMessage: "Failed to load entities for project" },
	);
}

export async function getEntityById({
	id,
}: {
	id: string;
}): Promise<Entity | null> {
	return safeQuery(
		async () => {
			const [selectedEntity] = await db
				.select()
				.from(entity)
				.where(eq(entity.id, id));

			return selectedEntity ?? null;
		},
		{ errorMessage: "Failed to load entity by id" },
	);
}

export async function createEntityAttribute({
	projectId,
	entityId,
	name,
	value,
	dataType,
	startDate,
	endDate,
}: {
	projectId: string;
	entityId: string;
	name: string;
	value: string;
	dataType: string;
	startDate?: string;
	endDate?: string;
}): Promise<EntityAttribute> {
	const parsedStart = toDateOrUndefined(startDate);
	const parsedEnd = toDateOrUndefined(endDate);

	if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
		throw new ChatSDKError(
			"bad_request:api",
			"Attribute end date cannot be before the start date.",
		);
	}

	return safeQuery(
		async () => {
			const [existing] = await db
				.select({ count: count() })
				.from(entityAttribute)
				.where(
					and(
						eq(entityAttribute.entityId, entityId),
						eq(entityAttribute.name, name),
					),
				)
				.limit(1);

			if (existing?.count && existing.count > 0) {
				throw new ChatSDKError(
					"bad_request:api",
					"This entity already has an attribute with that name.",
				);
			}

			const [createdAttribute] = await db
				.insert(entityAttribute)
				.values({
					projectId,
					entityId,
					name,
					value,
					dataType,
					startDate: parsedStart,
					endDate: parsedEnd,
					createdAt: new Date(),
				})
				.returning();

			return createdAttribute;
		},
		{ errorMessage: "Failed to create entity attribute" },
	);
}

export async function createRelationship({
	projectId,
	sourceEntityId,
	targetEntityId,
	type,
	description,
	startDate,
	endDate,
}: {
	projectId: string;
	sourceEntityId: string;
	targetEntityId: string;
	type: string;
	description?: string;
	startDate?: string;
	endDate?: string;
}): Promise<Relationship> {
	const parsedStart = toDateOrUndefined(startDate);
	const parsedEnd = toDateOrUndefined(endDate);

	if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
		throw new ChatSDKError(
			"bad_request:api",
			"Relationship end date cannot be before the start date.",
		);
	}

	if (sourceEntityId === targetEntityId) {
		throw new ChatSDKError(
			"bad_request:api",
			"An entity cannot be related to itself.",
		);
	}

	return safeQuery(
		async () => {
			const [source, target] = await Promise.all([
				db
					.select()
					.from(entity)
					.where(
						and(eq(entity.id, sourceEntityId), eq(entity.projectId, projectId)),
					),
				db
					.select()
					.from(entity)
					.where(
						and(eq(entity.id, targetEntityId), eq(entity.projectId, projectId)),
					),
			]);

			if (!source.length || !target.length) {
				throw new ChatSDKError(
					"bad_request:api",
					"Both related entities must belong to the same project.",
				);
			}

			const [existingRelationship] = await db
				.select({ count: count() })
				.from(relationship)
				.where(
					and(
						eq(relationship.projectId, projectId),
						eq(relationship.sourceEntityId, sourceEntityId),
						eq(relationship.targetEntityId, targetEntityId),
						eq(relationship.type, type),
					),
				)
				.limit(1);

			if (existingRelationship?.count && existingRelationship.count > 0) {
				throw new ChatSDKError(
					"bad_request:api",
					"This relationship already exists for the selected entities.",
				);
			}

			const [createdRelationship] = await db
				.insert(relationship)
				.values({
					projectId,
					sourceEntityId,
					targetEntityId,
					type,
					description,
					startDate: parsedStart,
					endDate: parsedEnd,
					createdAt: new Date(),
				})
				.returning();

			return createdRelationship;
		},
		{ errorMessage: "Failed to create relationship" },
	);
}

export type EntityWithDetails = Entity & {
	attributes: EntityAttribute[];
	relationships: Relationship[];
};

export async function getEntityWithDetails({
	id,
}: {
	id: string;
}): Promise<EntityWithDetails | null> {
	return safeQuery(
		async () => {
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
		},
		{ errorMessage: "Failed to load entity details" },
	);
}

export async function getRelationshipsForProject({
	projectId,
}: {
	projectId: string;
}): Promise<Relationship[]> {
	return safeQuery(
		async () => {
			return await db
				.select()
				.from(relationship)
				.where(eq(relationship.projectId, projectId))
				.orderBy(desc(relationship.createdAt));
		},
		{ errorMessage: "Failed to load relationships" },
	);
}

export async function getAttributesForProject({
	projectId,
}: {
	projectId: string;
}): Promise<EntityAttribute[]> {
	return safeQuery(
		async () => {
			return await db
				.select()
				.from(entityAttribute)
				.where(eq(entityAttribute.projectId, projectId))
				.orderBy(asc(entityAttribute.name));
		},
		{ errorMessage: "Failed to load attributes for project" },
	);
}

export async function deleteEntity({ id }: { id: string }): Promise<void> {
	return safeQuery(
		async () => {
			await db.transaction(async (tx: any) => {
				// Delete related attributes first
				await tx
					.delete(entityAttribute)
					.where(eq(entityAttribute.entityId, id));

				// Delete related relationships where entity is source or target
				await tx
					.delete(relationship)
					.where(
						or(
							eq(relationship.sourceEntityId, id),
							eq(relationship.targetEntityId, id),
						),
					);

				// Finally delete the entity
				await tx.delete(entity).where(eq(entity.id, id));
			});
		},
		{ errorMessage: "Failed to delete entity" },
	);
}
