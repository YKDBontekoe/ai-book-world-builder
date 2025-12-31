"use server";

import { asc, eq } from "drizzle-orm";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { clearCacheByPrefix } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { createOutline, getOutlinesForProject } from "@/lib/db/queries/outline";
import {
	createVolumePlan,
	getVolumePlansForProject,
} from "@/lib/db/queries/volume";
import { sceneRepository } from "@/lib/db/repositories";
import { chapter, project } from "@/lib/db/schema";

export async function initializeProject(projectId: string) {
	try {
		await ensureProjectAccess(projectId, true);

		// 1. Check/Create Structure
		const outlines = await getOutlinesForProject({ projectId });
		let outlineId = outlines[0]?.id;
		if (!outlineId) {
			const newOutline = await createOutline({
				projectId,
				title: "Project Outline",
				pov: "Third Person",
				tone: "Neutral",
				pacing: "Moderate",
				beats: [],
			});
			outlineId = newOutline.id;
		}

		const volumes = await getVolumePlansForProject({ projectId });
		let volumeId = volumes[0]?.id;
		let chapterId: string | null = null;

		if (!volumeId) {
			// Create Volume AND Chapter 1
			const newVolume = await createVolumePlan({
				projectId,
				outlineId,
				title: "Volume 1",
				chapters: [{ title: "Chapter 1", sequence: 1 }],
			});
			volumeId = newVolume.id;
			chapterId = newVolume.chapters[0]?.id;
		} else {
			// Volume exists, check for chapters
			const chapters = await db
				.select()
				.from(chapter)
				.where(eq(chapter.volumeId, volumeId))
				.orderBy(asc(chapter.sequence));

			if (chapters.length > 0) {
				chapterId = chapters[0].id;
			} else {
				// Create Chapter 1
				const [newChapter] = await db
					.insert(chapter)
					.values({
						projectId,
						volumeId,
						outlineId,
						title: "Chapter 1",
						sequence: 1,
						status: "planned",
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();
				chapterId = newChapter.id;
			}
		}

		if (!chapterId) throw new Error("Failed to resolve chapter");

		// 2. Check/Create Scene 1 using repository
		const scenes = await sceneRepository.findByChapter(chapterId);

		let sceneId = scenes[0]?.id;

		if (!sceneId) {
			const newScene = await sceneRepository.create({
				projectId,
				chapterId,
				title: "Scene 1",
				sequence: 1,
				content: "",
				status: "drafting",
			});
			sceneId = newScene.id;
		}

		await clearCacheByPrefix(`project-structure:${projectId}`);

		return { success: true, sceneId };
	} catch (error) {
		console.error("Failed to initialize project", error);
		return { success: false, error: "Initialization failed" };
	}
}

export async function updateLastViewedScene(
	projectId: string,
	sceneId: string,
) {
	try {
		await ensureProjectAccess(projectId, true);

		await db
			.update(project)
			.set({ lastViewedSceneId: sceneId })
			.where(eq(project.id, projectId));

		// Does not affect structure

		return { success: true };
	} catch (error) {
		console.error("Failed to update last viewed scene", error);
		return { success: false };
	}
}
