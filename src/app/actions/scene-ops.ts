"use server";

import { and, eq, inArray } from "drizzle-orm";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { invalidateCache } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { scene, sceneCard } from "@/lib/db/schema";
import { sceneRepository } from "@/lib/db/repositories";

export async function bulkDeleteScenes(sceneIds: string[]): Promise<{ success: boolean; error?: string }> {
	if (sceneIds.length === 0) return { success: true };

	try {
		// 1. Get first scene to determine project
		const firstScene = await sceneRepository.findById(sceneIds[0]);
		if (!firstScene) {
			return { success: false, error: "Scene not found" };
		}

		// 2. Verify Access (Write)
		await ensureProjectAccess(firstScene.projectId, true);
		const projectId = firstScene.projectId;

		// 3. Perform Deletion in Transaction
		await db.transaction(async (tx) => {
			// Delete dependencies first (sceneCard)
			// We limit deletion to scenes that belong to the project AND are in the list.
			// This prevents IDOR where sceneIds contains ID from another project.

			// First, find IDs that actually belong to this project (intersection)
			// This effectively filters out any malicious IDs.
			// However, we can just use the WHERE clause in delete.

			// Delete cards
			await tx.delete(sceneCard)
				.where(
					inArray(
						sceneCard.sceneId,
						db.select({ id: scene.id })
							.from(scene)
							.where(and(
								inArray(scene.id, sceneIds),
								eq(scene.projectId, projectId)
							))
					)
				);

			// Delete scenes
			await tx.delete(scene)
				.where(and(
					inArray(scene.id, sceneIds),
					eq(scene.projectId, projectId)
				));
		});

		// Invalidate cache
		await invalidateCache(`project-structure:${projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to bulk delete scenes", error);
		return { success: false, error: "Failed to delete scenes" };
	}
}
