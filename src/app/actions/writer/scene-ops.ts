"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { invalidateCache } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { chapter, scene } from "@/lib/db/schema";
import { err, ok } from "@/lib/result";

/**
 * Deletes multiple scenes at once.
 * @param sceneIds Array of scene IDs to delete.
 */
export async function deleteScenes(sceneIds: string[]) {
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
		// Note: We're not actively fixing the linked list (prevSceneId) here because
		// it might be complex if scenes are non-contiguous.
		// However, standard scene rendering often relies on `sequence` or `prevSceneId`.
		// If the app relies heavily on `prevSceneId` for ordering, this might break the chain.
		// But looking at `SceneNavigation`, it maps `chapter.scenes` which is ordered by sequence.
		// So purely deleting rows is mostly fine, though it leaves gaps in sequence.
		// A full "healing" would require re-sequencing the whole chapter, which we can skip for now
		// or handle if users report issues. `reorderScenes` exists for manual fixing.

		await db.delete(scene).where(inArray(scene.id, sceneIds));

		await invalidateCache(`project-structure:${projectId}`);

		return ok({ count: sceneIds.length });
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
) {
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

		await db.transaction(async (tx) => {
			for (const sceneId of sceneIds) {
				await tx
					.update(scene)
					.set({
						chapterId: targetChapterId,
						sequence: nextSequence,
						prevSceneId: prevId || null, // Ensure explicit null if undefined
						updatedAt: new Date(),
					})
					.where(eq(scene.id, sceneId));

				prevId = sceneId;
				nextSequence++;
			}
		});

		await invalidateCache(`project-structure:${projectId}`);

		return ok({ count: sceneIds.length });
	} catch (error) {
		console.error("Failed to move scenes", error);
		return err("Failed to move scenes");
	}
}
