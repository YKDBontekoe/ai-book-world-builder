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
	const [genUsage, historyRaw] = await Promise.all([
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
			.orderBy(sql`to_char(${bookGenerationStep.createdAt}, 'YYYY-MM-DD')`),
	]);

	const usageHistory: UsageHistory = (historyRaw as any[]).map((row: any) => ({
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

	const [genUsage, chatUsage, historyRaw] = await Promise.all([
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
			.orderBy(sql`to_char(${bookGenerationStep.createdAt}, 'YYYY-MM-DD')`),
	]);

	const usageHistory: UsageHistory = (historyRaw as any[]).map((row: any) => ({
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
