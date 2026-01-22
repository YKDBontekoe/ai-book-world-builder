import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { chapter, scene } from "@/lib/db/schema";
import type { ActivityStats } from "./types";

export async function getProjectActivityStats(
	projectId: string,
): Promise<ActivityStats> {
	const [chapterCount, sceneCount, wordCountRaw] = await Promise.all([
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

	return {
		totalProjects: 1,
		totalChapters: Number(chapterCount[0]?.count || 0),
		totalScenes: Number(sceneCount[0]?.count || 0),
		totalWords: Number(wordCountRaw[0]?.words || 0),
		lastActive: new Date(), // This could be improved by checking last updated entity
	};
}

/**
 * Calculates global activity stats for a user.
 *
 * Note: `totalChapters` and `totalScenes` are currently returned as 0 because calculating
 * them globally across all projects is expensive without a dedicated aggregate table.
 * These fields are intentionally omitted/uncomputed to optimize dashboard load performance.
 */
export async function getGlobalActivityStats(
	totalProjects: number,
	totalWords: number,
): Promise<ActivityStats> {
	return {
		totalProjects,
		totalChapters: 0,
		totalScenes: 0,
		totalWords,
		lastActive: new Date(),
	};
}
