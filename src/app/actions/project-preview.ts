"use server";

import { desc, eq, sql } from "drizzle-orm";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { projectRepository } from "@/lib/db/repositories";
import { chapter, scene } from "@/lib/db/schema";

export type ProjectPreviewData = {
	counts: {
		chapters: number;
		scenes: number;
		words: number;
	};
	recentActivity: {
		sceneId: string;
		sceneTitle: string;
		chapterTitle: string;
		updatedAt: Date;
	} | null;
	structure: {
		id: string;
		title: string;
		sceneCount: number;
	}[];
};

export async function getProjectPreviewData(
	projectId: string,
): Promise<{ success: true; data: ProjectPreviewData } | { error: string }> {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}

	// Verify access
	const projectAccess = await projectRepository.findByIdWithAccess(
		projectId,
		session.user.id,
	);
	if (!projectAccess) {
		return { error: "Project not found or access denied" };
	}

	try {
		// 1. Get Counts
		// Using array_length of regex split for approximate word count
		// CAST(COALESCE(...) AS INTEGER) ensures we get a number back
		const [stats] = await db
			.select({
				sceneCount: sql<number>`count(*)`,
				wordCount: sql<number>`COALESCE(sum(array_length(regexp_split_to_array(trim(${scene.content}), '\s+'), 1)), 0)`,
			})
			.from(scene)
			.where(eq(scene.projectId, projectId));

		const [chapterStats] = await db
			.select({
				count: sql<number>`count(*)`,
			})
			.from(chapter)
			.where(eq(chapter.projectId, projectId));

		// 2. Get Recent Activity (Last updated scene)
		const [recentScene] = await db
			.select({
				id: scene.id,
				title: scene.title,
				updatedAt: scene.updatedAt,
				chapterTitle: chapter.title,
			})
			.from(scene)
			.innerJoin(chapter, eq(scene.chapterId, chapter.id))
			.where(eq(scene.projectId, projectId))
			.orderBy(desc(scene.updatedAt))
			.limit(1);

		// 3. Get Structure Summary (First 5 chapters)
		// We'll just get the chapters first, then count scenes for them.
		// A single group by query is better.
		const chapters = await db
			.select({
				id: chapter.id,
				title: chapter.title,
				sequence: chapter.sequence,
				sceneCount: sql<number>`count(${scene.id})`,
			})
			.from(chapter)
			.leftJoin(scene, eq(chapter.id, scene.chapterId))
			.where(eq(chapter.projectId, projectId))
			.groupBy(chapter.id, chapter.title, chapter.sequence)
			.orderBy(chapter.sequence)
			.limit(5);

		return {
			success: true,
			data: {
				counts: {
					chapters: Number(chapterStats?.count || 0),
					scenes: Number(stats?.sceneCount || 0),
					words: Number(stats?.wordCount || 0),
				},
				recentActivity: recentScene
					? {
							sceneId: recentScene.id,
							sceneTitle: recentScene.title,
							chapterTitle: recentScene.chapterTitle,
							updatedAt: recentScene.updatedAt,
						}
					: null,
				structure: chapters.map((c) => ({
					id: c.id,
					title: c.title,
					sceneCount: Number(c.sceneCount),
				})),
			},
		};
	} catch (error) {
		console.error("Failed to fetch project preview:", error);
		return { error: "Failed to load project details" };
	}
}
