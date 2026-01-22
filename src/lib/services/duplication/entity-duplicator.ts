import { eq, type InferSelectModel } from "drizzle-orm";

import type { DbTransaction } from "@/lib/db";
import { entity, entityAttribute, relationship } from "@/lib/db/schema";
import { chunkedInsert } from "./utils";

type EntityRow = InferSelectModel<typeof entity>;
type AttributeRow = InferSelectModel<typeof entityAttribute>;
type RelationshipRow = InferSelectModel<typeof relationship>;

export class EntityDuplicator {
	constructor(private tx: DbTransaction) {}

	async cloneEntities(
		originalProjectId: string,
		newProjectId: string,
		idMap: Map<string, string>,
	) {
		const limit = 100;
		let offset = 0;
		let hasMore = true;

		while (hasMore) {
			const oldEntities = (await this.tx
				.select()
				.from(entity as any)
				.where(eq(entity.projectId, originalProjectId))
				.limit(limit)
				.offset(offset)) as EntityRow[];

			if (oldEntities.length === 0) {
				hasMore = false;
				break;
			}

			const newEntities = oldEntities.map((old: EntityRow) => {
				const newId = crypto.randomUUID();
				idMap.set(old.id, newId);
				const { id: _id, ...data } = old;
				return {
					...data,
					id: newId,
					projectId: newProjectId,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
			});

			await chunkedInsert(this.tx, entity, newEntities);
			offset += limit;
		}
	}

	async cloneAttributes(
		originalProjectId: string,
		newProjectId: string,
		entityIdMap: Map<string, string>,
	) {
		const oldAttributes = (await this.tx
			.select()
			.from(entityAttribute as any)
			.where(
				eq(entityAttribute.projectId, originalProjectId),
			)) as AttributeRow[];

		if (oldAttributes.length > 0) {
			const newAttributes = [];
			for (const old of oldAttributes) {
				const newEntityId = entityIdMap.get(old.entityId);
				if (newEntityId) {
					const { id: _id, ...data } = old;
					newAttributes.push({
						...data,
						id: crypto.randomUUID(),
						entityId: newEntityId,
						projectId: newProjectId,
						createdAt: new Date(),
					});
				}
			}
			if (newAttributes.length > 0) {
				await chunkedInsert(this.tx, entityAttribute, newAttributes);
			}
		}
	}

	async cloneRelationships(
		originalProjectId: string,
		newProjectId: string,
		entityIdMap: Map<string, string>,
	) {
		const oldRelationships = (await this.tx
			.select()
			.from(relationship as any)
			.where(
				eq(relationship.projectId, originalProjectId),
			)) as RelationshipRow[];

		if (oldRelationships.length > 0) {
			const newRelationships = [];
			for (const old of oldRelationships) {
				const sourceId = entityIdMap.get(old.sourceEntityId);
				const targetId = entityIdMap.get(old.targetEntityId);
				if (sourceId && targetId) {
					const { id: _id, ...data } = old;
					newRelationships.push({
						...data,
						id: crypto.randomUUID(),
						sourceEntityId: sourceId,
						targetEntityId: targetId,
						projectId: newProjectId,
						createdAt: new Date(),
					});
				}
			}
			if (newRelationships.length > 0) {
				await chunkedInsert(this.tx, relationship, newRelationships);
			}
		}
	}
}
