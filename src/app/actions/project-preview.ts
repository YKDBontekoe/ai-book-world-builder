"use server";

import { desc, eq, sql } from "drizzle-orm";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/drizzle";
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
		// We can do this with aggregate queries
		const [sceneStats] = await db
			.select({
				count: sql<number>`count(*)`,
				words: sql<number>`sum(${scene.words})`,
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
		const recentScene = await db.query.scene.findFirst({
			where: eq(scene.projectId, projectId),
			orderBy: [desc(scene.updatedAt)],
			with: {
				chapter: true,
			},
		});

		// 3. Get Structure Summary (First 5 chapters)
		const chapters = await db.query.chapter.findMany({
			where: eq(chapter.projectId, projectId),
			orderBy: [sql`${chapter.sequence} asc`],
			limit: 5,
			with: {
				scenes: {
					columns: {
						id: true,
					},
				},
			},
		});

		return {
			success: true,
			data: {
				counts: {
					chapters: Number(chapterStats?.count || 0),
					scenes: Number(sceneStats?.count || 0),
					words: Number(sceneStats?.words || 0),
				},
				recentActivity: recentScene
					? {
							sceneId: recentScene.id,
							sceneTitle: recentScene.title,
							chapterTitle: recentScene.chapter.title,
							updatedAt: recentScene.updatedAt,
						}
					: null,
				structure: chapters.map((c) => ({
					id: c.id,
					title: c.title,
					sceneCount: c.scenes.length,
				})),
			},
		};
	} catch (error) {
		console.error("Failed to fetch project preview:", error);
		return { error: "Failed to load project details" };
	}
}
