"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { invalidateCache } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { createOutline, getOutlinesForProject } from "@/lib/db/queries/outline";
import {
	createVolumePlan,
	getVolumePlansForProject,
} from "@/lib/db/queries/volume";
import { chapterRepository, sceneRepository } from "@/lib/db/repositories";
import { chapter, chapterVersion } from "@/lib/db/schema";
import { updateChapterTitleSchema } from "@/lib/validation";

export async function createChapterSnapshot(chapterId: string) {
	try {
		// 1. Fetch current chapter
		const [currentChapter] = await db
			.select()
			.from(chapter)
			.where(eq(chapter.id, chapterId))
			.limit(1);

		if (!currentChapter) return { success: false };

		// 2. Verify Access (Write requires ownership)
		await ensureProjectAccess(currentChapter.projectId, true);

		// 3. Get scenes using repository
		const scenes = await sceneRepository.findByChapter(chapterId);

		const fullContent = scenes
			.map((s) => `## ${s.title}\n\n${s.content || ""}`)
			.join("\n\n");

		// 4. Determine next version number
		const [lastVersion] = await db
			.select()
			.from(chapterVersion)
			.where(eq(chapterVersion.chapterId, chapterId))
			.orderBy(desc(chapterVersion.version))
			.limit(1);

		const nextVersion = (lastVersion?.version || 0) + 1;

		// 5. Save snapshot
		await db.insert(chapterVersion).values({
			chapterId,
			content: fullContent,
			version: nextVersion,
			createdAt: new Date(),
		});

		return { success: true };
	} catch (error) {
		console.error("Failed to create chapter snapshot", error);
		return { success: false };
	}
}

export async function createNewChapter(projectId: string) {
	try {
		await ensureProjectAccess(projectId, true);

		// 1. Get or Create Outline/Volume (Basic Check)
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
		if (!volumeId) {
			const newVolume = await createVolumePlan({
				projectId,
				outlineId,
				title: "Volume 1",
				chapters: [],
			});
			volumeId = newVolume.id;
		}

		// 2. Determine sequence
		const existingChapters = await db
			.select()
			.from(chapter)
			.where(eq(chapter.volumeId, volumeId))
			.orderBy(desc(chapter.sequence));

		const nextSequence = (existingChapters[0]?.sequence ?? 0) + 1;

		// 3. Create Chapter
		const [newChapter] = await db
			.insert(chapter)
			.values({
				projectId,
				volumeId,
				outlineId,
				title: `Chapter ${nextSequence}`,
				sequence: nextSequence,
				status: "planned",
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		await invalidateCache(`project-structure:${projectId}`);

		return { success: true, chapterId: newChapter.id };
	} catch (error) {
		console.error("Failed to create new chapter", error);
		return { success: false };
	}
}

export async function updateChapterTitle(
	chapterId: string,
	title: string,
): Promise<{ success: boolean; error?: string }> {
	const validation = updateChapterTitleSchema.safeParse({ chapterId, title });
	if (!validation.success) {
		return { success: false, error: validation.error.errors[0].message };
	}

	try {
		const [currentChapter] = await db
			.select()
			.from(chapter)
			.where(eq(chapter.id, chapterId))
			.limit(1);

		if (!currentChapter) {
			return { success: false, error: "Chapter not found" };
		}

		await ensureProjectAccess(currentChapter.projectId, true);

		await chapterRepository.update(chapterId, { title });

		await invalidateCache(`project-structure:${currentChapter.projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to update chapter title", error);
		return { success: false, error: "Failed to update chapter title" };
	}
}

export async function deleteChapter(chapterId: string) {
	try {
		const [currentChapter] = await db
			.select()
			.from(chapter)
			.where(eq(chapter.id, chapterId))
			.limit(1);

		if (!currentChapter) {
			return { success: false, error: "Chapter not found" };
		}

		await ensureProjectAccess(currentChapter.projectId, true);

		await chapterRepository.delete(chapterId);

		await invalidateCache(`project-structure:${currentChapter.projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to delete chapter", error);
		return { success: false, error: "Failed to delete chapter" };
	}
}

export async function reorderChapters(chapterIds: string[], volumeId: string) {
	try {
		if (chapterIds.length === 0) return { success: true };

		// 1. Query the DB for all chapters with ids IN chapterIds AND volumeId = provided volumeId
		const chapters = await db
			.select({ id: chapter.id, projectId: chapter.projectId })
			.from(chapter)
			.where(
				and(inArray(chapter.id, chapterIds), eq(chapter.volumeId, volumeId)),
			);

		// 2. Verify the returned count equals chapterIds.length
		if (chapters.length !== chapterIds.length) {
			return {
				success: false,
				error: "One or more chapters do not belong to the specified volume",
			};
		}

		// 3. Verify they all share the same projectId
		const projectId = chapters[0].projectId;
		const allSameProject = chapters.every((ch) => ch.projectId === projectId);
		if (!allSameProject) {
			return {
				success: false,
				error: "Chapters must belong to the same project",
			};
		}

		// 4. Call ensureProjectAccess(projectId, true) once
		await ensureProjectAccess(projectId, true);

		// 5. Inside the transaction update chapters
		await db.transaction(async (tx) => {
			for (let i = 0; i < chapterIds.length; i++) {
				await tx
					.update(chapter)
					.set({ sequence: i + 1, updatedAt: new Date() })
					.where(
						and(eq(chapter.id, chapterIds[i]), eq(chapter.volumeId, volumeId)),
					);
			}
		});

		await invalidateCache(`project-structure:${projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to reorder chapters", error);
		return { success: false, error: "Failed to reorder chapters" };
	}
}
