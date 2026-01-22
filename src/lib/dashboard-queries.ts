import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { project, scene } from "@/lib/db/schema";

import {
	getGlobalActivityStats,
	getProjectActivityStats,
} from "./queries/stats/activity-stats";
import {
	getGlobalEntityStats,
	getProjectEntityStats,
} from "./queries/stats/entity-stats";
import {
	getGlobalTokenStats,
	getProjectTokenStats,
} from "./queries/stats/token-stats";
import type {
	ActivityStats,
	EntityStats,
	TokenStats,
	UsageHistory,
} from "./queries/stats/types";

export type { TokenStats, EntityStats, ActivityStats, UsageHistory };

export async function getProjectStats(
	projectId: string,
	dateRange?: { from?: Date; to?: Date },
): Promise<{
	tokenStats: TokenStats;
	entityStats: EntityStats;
	activityStats: ActivityStats;
	usageHistory: UsageHistory;
}> {
	const [{ tokenStats, usageHistory }, entityStats, activityStats] =
		await Promise.all([
			getProjectTokenStats(projectId, dateRange),
			getProjectEntityStats(projectId),
			getProjectActivityStats(projectId),
		]);

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
	const [userProjects, totalWordsRaw] = await Promise.all([
		db
			.select({ id: project.id })
			.from(project)
			.where(eq(project.userId, userId)),
		db
			.select({ words: sql<number>`sum(${scene.wordCount})` })
			.from(scene)
			.innerJoin(project, eq(scene.projectId, project.id))
			.where(eq(project.userId, userId)),
	]);

	const projectIds = (userProjects as any[]).map((p: any) => p.id);
	const totalWords = Number(totalWordsRaw[0]?.words || 0);

	const [{ tokenStats, usageHistory }, entityStats, activityStats] =
		await Promise.all([
			getGlobalTokenStats(userId, dateRange),
			getGlobalEntityStats(projectIds),
			getGlobalActivityStats(projectIds.length, totalWords),
		]);

	return { tokenStats, entityStats, activityStats, usageHistory };
}
