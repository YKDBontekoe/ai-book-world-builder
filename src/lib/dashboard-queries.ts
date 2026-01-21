import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
	bookGeneration,
	bookGenerationStep,
	chapter,
	chat,
	entity,
	message,
	project,
	relationship,
	scene,
} from "@/lib/db/schema";

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

export type ActivityStats = {
	totalProjects: number;
	totalChapters: number;
	totalScenes: number;
	totalWords: number;
	lastActive: Date | null;
};

export type UsageHistory = {
	date: string;
	cost: number;
	tokens: number;
}[];

export async function getProjectStats(
	projectId: string,
	dateRange?: { from?: Date; to?: Date },
): Promise<{
	tokenStats: TokenStats;
	entityStats: EntityStats;
	activityStats: ActivityStats;
	usageHistory: UsageHistory;
}> {
	// Date filters
	const fromDate = dateRange?.from;
	const toDate = dateRange?.to;

	const genUsageWhere = and(
		eq(bookGeneration.projectId, projectId),
		sql`${bookGenerationStep.usage} is not null`,
		fromDate ? gte(bookGenerationStep.createdAt, fromDate) : undefined,
		toDate ? lte(bookGenerationStep.createdAt, toDate) : undefined,
	);

	const [
		byKindRaw,
		entities,
		rels,
		genUsage,
		chapterCount,
		sceneCount,
		wordCountRaw,
	] = await Promise.all([
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

		// 4. Generation Stats
		db
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
			.where(genUsageWhere)
			.groupBy(sql`${bookGenerationStep.usage}->>'modelId'`),

		// 5. Activity Stats
		db
			.select({ count: sql<number>`count(*)` })
			.from(chapter)
			.where(eq(chapter.projectId, projectId)),
		db
			.select({ count: sql<number>`count(*)` })
			.from(scene)
			.where(eq(scene.projectId, projectId)),
		db
			.select({ words: sql<number>`sum(${scene.wordCount})` })
			.from(scene)
			.where(eq(scene.projectId, projectId)),
	]);

	// Usage History Query (Time Series)
	const historyRaw = await db
		.select({
			date: sql<string>`to_char(${bookGenerationStep.createdAt}, 'YYYY-MM-DD')`,
			cost: sql<number>`sum(cast(${bookGenerationStep.usage}->>'totalCost' as numeric))`,
			tokens: sql<number>`sum(
				cast(${bookGenerationStep.usage}->>'promptTokens' as numeric) +
				cast(${bookGenerationStep.usage}->>'completionTokens' as numeric)
			)`,
		})
		.from(bookGenerationStep)
		.innerJoin(
			bookGeneration,
			eq(bookGenerationStep.generationId, bookGeneration.id),
		)
		.where(genUsageWhere)
		.groupBy(sql`to_char(${bookGenerationStep.createdAt}, 'YYYY-MM-DD')`)
		.orderBy(sql`to_char(${bookGenerationStep.createdAt}, 'YYYY-MM-DD')`);

	const usageHistory: UsageHistory = (historyRaw as any[]).map((row: any) => ({
		date: row.date,
		cost: Number(row.cost || 0),
		tokens: Number(row.tokens || 0),
	}));

	// Process Activity Stats
	const activityStats: ActivityStats = {
		totalProjects: 1,
		totalChapters: Number(chapterCount[0]?.count || 0),
		totalScenes: Number(sceneCount[0]?.count || 0),
		totalWords: Number(wordCountRaw[0]?.words || 0),
		lastActive: new Date(), // This could be improved by checking last updated entity
	};

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

	const entityStats = {
		totalEntities,
		byKind,
		mostConnected,
	};

	// Process Token Stats (Same as before)
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

	return { tokenStats, entityStats, activityStats, usageHistory };
}

export async function getGlobalStats(
	userId: string,
	dateRange?: { from?: Date; to?: Date },
): Promise<{
	tokenStats: TokenStats;
	entityStats: EntityStats;
	activityStats: ActivityStats;
	usageHistory: UsageHistory;
}> {
	// Date filters
	const fromDate = dateRange?.from;
	const toDate = dateRange?.to;

	const genUsageWhere = and(
		eq(project.userId, userId),
		sql`${bookGenerationStep.usage} is not null`,
		fromDate ? gte(bookGenerationStep.createdAt, fromDate) : undefined,
		toDate ? lte(bookGenerationStep.createdAt, toDate) : undefined,
	);

	const chatUsageWhere = and(
		eq(chat.userId, userId),
		sql`${message.usage} is not null`,
		fromDate ? gte(message.createdAt, fromDate) : undefined,
		toDate ? lte(message.createdAt, toDate) : undefined,
	);

	const [userProjects, genUsage, chatUsage, totalWordsRaw] = await Promise.all([
		db
			.select({ id: project.id })
			.from(project)
			.where(eq(project.userId, userId)),
		db
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
			.where(genUsageWhere)
			.groupBy(sql`${bookGenerationStep.usage}->>'modelId'`),
		db
			.select({
				modelId: sql<string>`${message.usage}->>'modelId'`,
				cost: sql<number>`sum(cast(${message.usage}->>'totalCost' as numeric))`,
				input: sql<number>`sum(cast(${message.usage}->>'promptTokens' as numeric))`,
				output: sql<number>`sum(cast(${message.usage}->>'completionTokens' as numeric))`,
			})
			.from(message)
			.innerJoin(chat, eq(message.chatId, chat.id))
			.where(chatUsageWhere)
			.groupBy(sql`${message.usage}->>'modelId'`),
		db
			.select({ words: sql<number>`sum(${scene.wordCount})` })
			.from(scene)
			.innerJoin(project, eq(scene.projectId, project.id))
			.where(eq(project.userId, userId)),
	]);

	const projectIds = (userProjects as any[]).map((p: any) => p.id);

	// Usage History (Global)
	const historyRaw = await db
		.select({
			date: sql<string>`to_char(${bookGenerationStep.createdAt}, 'YYYY-MM-DD')`,
			cost: sql<number>`sum(cast(${bookGenerationStep.usage}->>'totalCost' as numeric))`,
			tokens: sql<number>`sum(
				cast(${bookGenerationStep.usage}->>'promptTokens' as numeric) +
				cast(${bookGenerationStep.usage}->>'completionTokens' as numeric)
			)`,
		})
		.from(bookGenerationStep)
		.innerJoin(
			bookGeneration,
			eq(bookGenerationStep.generationId, bookGeneration.id),
		)
		.innerJoin(project, eq(bookGeneration.projectId, project.id))
		.where(genUsageWhere)
		.groupBy(sql`to_char(${bookGenerationStep.createdAt}, 'YYYY-MM-DD')`)
		.orderBy(sql`to_char(${bookGenerationStep.createdAt}, 'YYYY-MM-DD')`);

	const usageHistory: UsageHistory = (historyRaw as any[]).map((row: any) => ({
		date: row.date,
		cost: Number(row.cost || 0),
		tokens: Number(row.tokens || 0),
	}));

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

	// Process Generation Stats
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

	// Process Chat Stats
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

	// Activity Stats
	const activityStats: ActivityStats = {
		totalProjects: projectIds.length,
		totalChapters: 0, // Expensive to calculate globally without aggregate table, set to 0 or implement separate query
		totalScenes: 0, // Same here
		totalWords: Number(totalWordsRaw[0]?.words || 0),
		lastActive: new Date(),
	};

	return { tokenStats, entityStats, activityStats, usageHistory };
}
