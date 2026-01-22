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

export async function getGlobalActivityStats(
	totalProjects: number,
	totalWords: number,
): Promise<ActivityStats> {
	return {
		totalProjects,
		totalChapters: 0, // Expensive to calculate globally without aggregate table
		totalScenes: 0, // Same here
		totalWords,
		lastActive: new Date(),
	};
}
