import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
	bookGeneration,
	bookGenerationStep,
	chat,
	message,
	project,
} from "@/lib/db/schema";
import type { TokenStats, UsageHistory } from "./types";

interface HistoryRow {
	date: string;
	cost: number;
	tokens: number;
}

export async function getProjectTokenStats(
	projectId: string,
	dateRange?: { from?: Date; to?: Date },
): Promise<{ tokenStats: TokenStats; usageHistory: UsageHistory }> {
	const fromDate = dateRange?.from;
	const toDate = dateRange?.to;

	const genUsageWhere = and(
		eq(bookGeneration.projectId, projectId),
		sql`${bookGenerationStep.usage} is not null`,
		fromDate ? gte(bookGenerationStep.createdAt, fromDate) : undefined,
		toDate ? lte(bookGenerationStep.createdAt, toDate) : undefined,
	);

	// Run parallel queries
	const [genUsage, historyRaw] = (await Promise.all([
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

		db
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
			.orderBy(sql`to_char(${bookGenerationStep.createdAt}, 'YYYY-MM-DD')`)
			.then((rows: unknown) => rows as HistoryRow[]),
	])) as [
		{ modelId: string | null; cost: number; input: number; output: number }[],
		HistoryRow[],
	];

	// TODO: Fetch chat history as well and merge. For now we only track generation history.
	// Since getProjectTokenStats is specific to a project, but chat is often project-scoped too.
	// But the schema implies chat is separate or linked differently.
	// Assuming chat is global or we need a similar query.
	// But `getProjectTokenStats` is scoped to `bookGeneration`.
	// If `chat` has `projectId` we could include it. `chat` schema has `projectId`.
	// Let's check `src/lib/db/schema/index.ts` or just `schema`.
	// I see `chat` imported.
	// But `getProjectTokenStats` didn't include chat history originally.
	// The CodeRabbit comment was about `getGlobalTokenStats`.
	// So `getProjectTokenStats` might be fine?
	// Actually the CodeRabbit comment said "The usageHistory currently maps only historyRaw (bookGenerationStep) so chat messages are omitted while genUsage+chatUsage totals include chat".
	// This applies to `getGlobalTokenStats`.
	// For `getProjectTokenStats`, `genUsage` only queries `bookGenerationStep`.
	// So `getProjectTokenStats` usageHistory is consistent with its totals (only generation).

	const usageHistory: UsageHistory = historyRaw.map((row) => ({
		date: row.date,
		cost: Number(row.cost || 0),
		tokens: Number(row.tokens || 0),
	}));

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

	return { tokenStats, usageHistory };
}

export async function getGlobalTokenStats(
	userId: string,
	dateRange?: { from?: Date; to?: Date },
): Promise<{ tokenStats: TokenStats; usageHistory: UsageHistory }> {
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

	const [genUsage, chatUsage, historyRaw, chatHistoryRaw] = (await Promise.all([
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
			.orderBy(sql`to_char(${bookGenerationStep.createdAt}, 'YYYY-MM-DD')`)
			.then((rows: unknown) => rows as HistoryRow[]),
		db
			.select({
				date: sql<string>`to_char(${message.createdAt}, 'YYYY-MM-DD')`,
				cost: sql<number>`sum(cast(${message.usage}->>'totalCost' as numeric))`,
				tokens: sql<number>`sum(
					cast(${message.usage}->>'promptTokens' as numeric) +
					cast(${message.usage}->>'completionTokens' as numeric)
				)`,
			})
			.from(message)
			.innerJoin(chat, eq(message.chatId, chat.id))
			.where(chatUsageWhere)
			.groupBy(sql`to_char(${message.createdAt}, 'YYYY-MM-DD')`)
			.orderBy(sql`to_char(${message.createdAt}, 'YYYY-MM-DD')`)
			.then((rows: unknown) => rows as HistoryRow[]),
	])) as [
		{ modelId: string | null; cost: number; input: number; output: number }[],
		{ modelId: string | null; cost: number; input: number; output: number }[],
		HistoryRow[],
		HistoryRow[],
	];

	// Aggregate history by date
	const historyMap = new Map<string, { cost: number; tokens: number }>();

	for (const row of [...historyRaw, ...chatHistoryRaw]) {
		const existing = historyMap.get(row.date) || { cost: 0, tokens: 0 };
		historyMap.set(row.date, {
			cost: existing.cost + Number(row.cost || 0),
			tokens: existing.tokens + Number(row.tokens || 0),
		});
	}

	const usageHistory: UsageHistory = Array.from(historyMap.entries())
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([date, stats]) => ({
			date,
			cost: stats.cost,
			tokens: stats.tokens,
		}));

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

	return { tokenStats, usageHistory };
}
