import "server-only";
import { inArray } from "drizzle-orm";
import {
	entity,
	entityAttribute,
	relationship,
} from "@/lib/db/schema";
import { DatabaseError } from "@/lib/errors";

export class EntityCleanupRepository {
	/**
	 * Deletes all entity-related data (entities, attributes, relationships) for a set of projects.
	 */
	async deleteByProjectIds(tx: any, projectIds: string[]) {
		try {
			// 1. Relationships
			await tx
				.delete(relationship)
				.where(inArray(relationship.projectId, projectIds));

			// 2. Entity Attributes
			await tx
				.delete(entityAttribute)
				.where(inArray(entityAttribute.projectId, projectIds));

			// 3. Entities
			await tx.delete(entity).where(inArray(entity.projectId, projectIds));
		} catch (error) {
			console.error("EntityCleanupRepository.deleteByProjectIds error:", error);
			throw new DatabaseError("Failed to delete entity data");
		}
	}
}

export const entityCleanupRepository = new EntityCleanupRepository();
