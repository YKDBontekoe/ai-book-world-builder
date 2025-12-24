import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import {
	bookGeneration,
	bookGenerationStep,
	chat,
	entity,
	message,
	project,
	relationship,
} from "@/lib/db/schema";
import type { AppUsage } from "@/lib/usage";

export type TokenStats = {
	totalCost: number;
	totalInputTokens: number;
	totalOutputTokens: number;
	byModel: Record<
		string,
		{
			cost: number;
			inputTokens: number;
			outputTokens: number;
		}
	>;
	byFeature: {
		chat: { cost: number; inputTokens: number; outputTokens: number };
		generation: { cost: number; inputTokens: number; outputTokens: number };
	};
};

export type EntityStats = {
	totalEntities: number;
	byKind: Record<string, number>;
	mostConnected: {
		id: string;
		name: string;
		kind: string;
		connections: number;
	}[];
};

export async function getProjectStats(
	projectId: string,
): Promise<{ tokenStats: TokenStats; entityStats: EntityStats }> {
	// 1. Entity Stats
	const byKindRaw = await db
		.select({
			kind: entity.kind,
			count: sql<number>`count(*)`,
		})
		.from(entity)
		.where(eq(entity.projectId, projectId))
		.groupBy(entity.kind);

	const byKind: Record<string, number> = {};
	let totalEntities = 0;
	for (const row of byKindRaw) {
		const c = Number(row.count);
		byKind[row.kind] = c;
		totalEntities += c;
	}

	// Most connected (Top 5)
	// We count relationships where entity is source OR target
	// This is efficiently done by fetching entities and their relationship counts,
	// or a union query. Given complexity of Drizzle union, fetching relationships is okay if not huge,
	// but let's try a better approach:
	// Select top 5 entities by (select count(*) from relationship where source=id or target=id)
	// Drizzle subquery support:

	// Simpler approximation: Just count source + target frequency from relationship table
	// and join with entity table.
	// For now, I'll stick to the previous application-side aggregation for connections
	// as it's cleaner than complex SQL for "most connected in graph" and valid for reasonable project sizes.
	// But to be safer for perf, let's limit the fetching.

	const entities = await db
		.select({
			id: entity.id,
			name: entity.name,
			kind: entity.kind,
		})
		.from(entity)
		.where(eq(entity.projectId, projectId));

	// Fetch only necessary relationship data (ids)
	const rels = await db
		.select({ s: relationship.sourceEntityId, t: relationship.targetEntityId })
		.from(relationship)
		.where(eq(relationship.projectId, projectId));

	const connCounts: Record<string, number> = {};
	for (const r of rels) {
		connCounts[r.s] = (connCounts[r.s] || 0) + 1;
		connCounts[r.t] = (connCounts[r.t] || 0) + 1;
	}

	const mostConnected = entities
		.map((e) => ({ ...e, connections: connCounts[e.id] || 0 }))
		.sort((a, b) => b.connections - a.connections)
		.slice(0, 5);

	const entityStats = {
		totalEntities,
		byKind,
		mostConnected,
	};

	// 2. Generation Stats (DB Aggregation)
	// Aggregate usage from bookGenerationStep

	const genUsage = await db
		.select({
			modelId: sql<string>`${bookGenerationStep.usage}->>'modelId'`,
			cost: sql<number>`sum(cast(${bookGenerationStep.usage}->>'totalCost' as numeric))`,
			input: sql<number>`sum(cast(${bookGenerationStep.usage}->>'promptTokens' as numeric))`,
			output: sql<number>`sum(cast(${bookGenerationStep.usage}->>'completionTokens' as numeric))`,
		})
		.from(bookGenerationStep)
		.innerJoin(
			bookGeneration,
			eq(bookGenerationStep.generationId, bookGeneration.id),
		)
		.where(
			and(
				eq(bookGeneration.projectId, projectId),
				sql`${bookGenerationStep.usage} is not null`,
			),
		)
		.groupBy(sql`${bookGenerationStep.usage}->>'modelId'`);

	const tokenStats: TokenStats = {
		totalCost: 0,
		totalInputTokens: 0,
		totalOutputTokens: 0,
		byModel: {},
		byFeature: {
			chat: { cost: 0, inputTokens: 0, outputTokens: 0 },
			generation: { cost: 0, inputTokens: 0, outputTokens: 0 },
		},
	};

	for (const row of genUsage) {
		const modelId = row.modelId || "unknown";
		const cost = Number(row.cost || 0);
		const input = Number(row.input || 0);
		const output = Number(row.output || 0);

		tokenStats.totalCost += cost;
		tokenStats.totalInputTokens += input;
		tokenStats.totalOutputTokens += output;

		tokenStats.byFeature.generation.cost += cost;
		tokenStats.byFeature.generation.inputTokens += input;
		tokenStats.byFeature.generation.outputTokens += output;

		if (!tokenStats.byModel[modelId]) {
			tokenStats.byModel[modelId] = {
				cost: 0,
				inputTokens: 0,
				outputTokens: 0,
			};
		}
		tokenStats.byModel[modelId].cost += cost;
		tokenStats.byModel[modelId].inputTokens += input;
		tokenStats.byModel[modelId].outputTokens += output;
	}

	return { tokenStats, entityStats };
}

export async function getGlobalStats(
	userId: string,
): Promise<{ tokenStats: TokenStats; entityStats: EntityStats }> {
	// 1. Projects Stats (Aggregated)
	const userProjects = await db
		.select({ id: project.id })
		.from(project)
		.where(eq(project.userId, userId));

	const projectIds = userProjects.map((p) => p.id);

	// Aggregate Entity Stats
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

	const entityStats: EntityStats = {
		totalEntities,
		byKind,
		mostConnected: [], // Not applicable globally
	};

	const tokenStats: TokenStats = {
		totalCost: 0,
		totalInputTokens: 0,
		totalOutputTokens: 0,
		byModel: {},
		byFeature: {
			chat: { cost: 0, inputTokens: 0, outputTokens: 0 },
			generation: { cost: 0, inputTokens: 0, outputTokens: 0 },
		},
	};

	// 2. Generation Stats (Global)
	// Join project to filter by user
	const genUsage = await db
		.select({
			modelId: sql<string>`${bookGenerationStep.usage}->>'modelId'`,
			cost: sql<number>`sum(cast(${bookGenerationStep.usage}->>'totalCost' as numeric))`,
			input: sql<number>`sum(cast(${bookGenerationStep.usage}->>'promptTokens' as numeric))`,
			output: sql<number>`sum(cast(${bookGenerationStep.usage}->>'completionTokens' as numeric))`,
		})
		.from(bookGenerationStep)
		.innerJoin(
			bookGeneration,
			eq(bookGenerationStep.generationId, bookGeneration.id),
		)
		.innerJoin(project, eq(bookGeneration.projectId, project.id))
		.where(
			and(
				eq(project.userId, userId),
				sql`${bookGenerationStep.usage} is not null`,
			),
		)
		.groupBy(sql`${bookGenerationStep.usage}->>'modelId'`);

	for (const row of genUsage) {
		const modelId = row.modelId || "unknown";
		const cost = Number(row.cost || 0);
		const input = Number(row.input || 0);
		const output = Number(row.output || 0);

		tokenStats.totalCost += cost;
		tokenStats.totalInputTokens += input;
		tokenStats.totalOutputTokens += output;

		tokenStats.byFeature.generation.cost += cost;
		tokenStats.byFeature.generation.inputTokens += input;
		tokenStats.byFeature.generation.outputTokens += output;

		if (!tokenStats.byModel[modelId]) {
			tokenStats.byModel[modelId] = {
				cost: 0,
				inputTokens: 0,
				outputTokens: 0,
			};
		}
		tokenStats.byModel[modelId].cost += cost;
		tokenStats.byModel[modelId].inputTokens += input;
		tokenStats.byModel[modelId].outputTokens += output;
	}

	// 3. Chat Stats (Global)
	const chatUsage = await db
		.select({
			modelId: sql<string>`${message.usage}->>'modelId'`,
			cost: sql<number>`sum(cast(${message.usage}->>'totalCost' as numeric))`,
			input: sql<number>`sum(cast(${message.usage}->>'promptTokens' as numeric))`,
			output: sql<number>`sum(cast(${message.usage}->>'completionTokens' as numeric))`,
		})
		.from(message)
		.innerJoin(chat, eq(message.chatId, chat.id))
		.where(and(eq(chat.userId, userId), sql`${message.usage} is not null`))
		.groupBy(sql`${message.usage}->>'modelId'`);

	for (const row of chatUsage) {
		const modelId = row.modelId || "unknown";
		const cost = Number(row.cost || 0);
		const input = Number(row.input || 0);
		const output = Number(row.output || 0);

		tokenStats.totalCost += cost;
		tokenStats.totalInputTokens += input;
		tokenStats.totalOutputTokens += output;

		tokenStats.byFeature.chat.cost += cost;
		tokenStats.byFeature.chat.inputTokens += input;
		tokenStats.byFeature.chat.outputTokens += output;

		if (!tokenStats.byModel[modelId]) {
			tokenStats.byModel[modelId] = {
				cost: 0,
				inputTokens: 0,
				outputTokens: 0,
			};
		}
		tokenStats.byModel[modelId].cost += cost;
		tokenStats.byModel[modelId].inputTokens += input;
		tokenStats.byModel[modelId].outputTokens += output;
	}

	return { tokenStats, entityStats };
}
