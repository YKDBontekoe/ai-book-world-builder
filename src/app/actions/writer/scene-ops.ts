"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { invalidateCache } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { chapter, scene } from "@/lib/db/schema";
import { type Result, err, ok } from "@/lib/result";

const deleteScenesSchema = z.array(z.string().uuid());
const moveScenesSchema = z.object({
	sceneIds: z.array(z.string().uuid()),
	targetChapterId: z.string().uuid(),
});

/**
 * Deletes multiple scenes at once.
 * @param sceneIds Array of scene IDs to delete.
 */
export async function deleteScenes(
	sceneIds: string[],
): Promise<Result<{ count: number }>> {
	const validation = deleteScenesSchema.safeParse(sceneIds);
	if (!validation.success) {
		return err("Invalid scene IDs");
	}

	if (!sceneIds.length) {
		return ok({ count: 0 });
	}

	try {
		// 1. Fetch scenes to verify project ownership
		const scenes = await db
			.select({ id: scene.id, projectId: scene.projectId })
			.from(scene)
			.where(inArray(scene.id, sceneIds));

		if (scenes.length === 0) {
			return err("Scenes not found");
		}

		const projectId = scenes[0].projectId;
		const allSameProject = scenes.every((s) => s.projectId === projectId);

		if (!allSameProject) {
			return err("All scenes must belong to the same project");
		}

		// 2. Verify Access (Write)
		await ensureProjectAccess(projectId, true);

		// 3. Delete scenes in transaction
		const count = await db.transaction(async (tx) => {
			const result = await tx
				.delete(scene)
				.where(inArray(scene.id, sceneIds))
				.returning({ id: scene.id });
			return result.length;
		});

		await invalidateCache(`project-structure:${projectId}`);

		return ok({ count });
	} catch (error) {
		console.error("Failed to delete scenes", error);
		return err("Failed to delete scenes");
	}
}

/**
 * Moves multiple scenes to a target chapter.
 * @param sceneIds Array of scene IDs to move.
 * @param targetChapterId The ID of the destination chapter.
 */
export async function moveScenesToChapter(
	sceneIds: string[],
	targetChapterId: string,
): Promise<Result<{ count: number }>> {
	const validation = moveScenesSchema.safeParse({ sceneIds, targetChapterId });
	if (!validation.success) {
		return err("Invalid input");
	}

	if (!sceneIds.length) {
		return ok({ count: 0 });
	}

	try {
		// 1. Fetch scenes and target chapter
		const scenes = await db
			.select()
			.from(scene)
			.where(inArray(scene.id, sceneIds));

		const [targetChapter] = await db
			.select()
			.from(chapter)
			.where(eq(chapter.id, targetChapterId))
			.limit(1);

		if (!targetChapter) {
			return err("Target chapter not found");
		}

		if (scenes.length !== sceneIds.length) {
			return err("Some scenes were not found");
		}

		const projectId = targetChapter.projectId;

		// Verify all scenes belong to the same project as the target chapter
		const allSameProject = scenes.every((s) => s.projectId === projectId);
		if (!allSameProject) {
			return err("Cannot move scenes between different projects");
		}

		// 2. Verify Access
		await ensureProjectAccess(projectId, true);

		// 3. Move Logic
		// We append them to the end of the target chapter.
		// We need to know the current last sequence number in the target chapter.
		const [lastScene] = await db
			.select({ sequence: scene.sequence, id: scene.id })
			.from(scene)
			.where(eq(scene.chapterId, targetChapterId))
			.orderBy(sql`${scene.sequence} DESC`)
			.limit(1);

		let nextSequence = (lastScene?.sequence ?? 0) + 1;
		let prevId = lastScene?.id ?? undefined; // The last scene becomes the "prev" for the first moved scene

		let movedCount = 0;
		await db.transaction(async (tx) => {
			for (const sceneId of sceneIds) {
				const result = await tx
					.update(scene)
					.set({
						chapterId: targetChapterId,
						sequence: nextSequence,
						prevSceneId: prevId || null, // Ensure explicit null if undefined
						updatedAt: new Date(),
					})
					.where(eq(scene.id, sceneId))
					.returning({ id: scene.id });

				movedCount += result.length;

				prevId = sceneId;
				nextSequence++;
			}
		});

		await invalidateCache(`project-structure:${projectId}`);

		return ok({ count: movedCount });
	} catch (error) {
		console.error("Failed to move scenes", error);
		return err("Failed to move scenes");
	}
}
