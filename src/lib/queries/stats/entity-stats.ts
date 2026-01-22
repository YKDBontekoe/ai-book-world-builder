import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { entity, relationship } from "@/lib/db/schema";
import type { EntityStats } from "./types";

export async function getProjectEntityStats(
	projectId: string,
): Promise<EntityStats> {
	const [byKindRaw, entities, rels] = await Promise.all([
		// 1. Entity Stats
		db
			.select({
				kind: entity.kind,
				count: sql<number>`count(*)`,
			})
			.from(entity)
			.where(eq(entity.projectId, projectId))
			.groupBy(entity.kind),

		// 2. Entities List
		db
			.select({
				id: entity.id,
				name: entity.name,
				kind: entity.kind,
			})
			.from(entity)
			.where(eq(entity.projectId, projectId)),

		// 3. Relationships
		db
			.select({
				s: relationship.sourceEntityId,
				t: relationship.targetEntityId,
			})
			.from(relationship)
			.where(eq(relationship.projectId, projectId)),
	]);

	// Process Entity Stats
	const byKind: Record<string, number> = {};
	let totalEntities = 0;
	for (const row of byKindRaw) {
		const c = Number(row.count);
		byKind[row.kind] = c;
		totalEntities += c;
	}

	const connCounts: Record<string, number> = {};
	for (const r of rels) {
		connCounts[r.s] = (connCounts[r.s] || 0) + 1;
		connCounts[r.t] = (connCounts[r.t] || 0) + 1;
	}

	const mostConnected = (entities as any[])
		.map((e: any) => ({ ...e, connections: connCounts[e.id] || 0 }))
		.sort((a: any, b: any) => b.connections - a.connections)
		.slice(0, 5);

	return {
		totalEntities,
		byKind,
		mostConnected,
	};
}

export async function getGlobalEntityStats(
	projectIds: string[],
): Promise<EntityStats> {
	let totalEntities = 0;
	const byKind: Record<string, number> = {};

	if (projectIds.length > 0) {
		const byKindRaw = await db
			.select({
				kind: entity.kind,
				count: sql<number>`count(*)`,
			})
			.from(entity)
			.where(inArray(entity.projectId, projectIds))
			.groupBy(entity.kind);

		for (const row of byKindRaw) {
			const c = Number(row.count);
			byKind[row.kind] = c;
			totalEntities += c;
		}
	}

	return {
		totalEntities,
		byKind,
		mostConnected: [], // Not applicable globally
	};
}
