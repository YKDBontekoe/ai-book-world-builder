"use server";

import { and, eq, inArray } from "drizzle-orm";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { invalidateCache } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { scene } from "@/lib/db/schema";

export async function bulkDeleteScenes(
	projectId: string,
	sceneIds: string[],
): Promise<{ success: boolean; error?: string }> {
	try {
		await ensureProjectAccess(projectId, true);

		if (!sceneIds.length) {
			return { success: true };
		}

		await db
			.update(scene)
			.set({ deletedAt: new Date() })
			.where(and(eq(scene.projectId, projectId), inArray(scene.id, sceneIds)));

		await invalidateCache(`project-structure:${projectId}`);
		return { success: true };
	} catch (error) {
		console.error("bulkDeleteScenes error:", error);
		return { success: false, error: "Failed to delete scenes" };
	}
}

export async function restoreScenes(
	projectId: string,
	sceneIds: string[],
): Promise<{ success: boolean; error?: string }> {
	try {
		await ensureProjectAccess(projectId, true);

		if (!sceneIds.length) {
			return { success: true };
		}

		await db
			.update(scene)
			.set({ deletedAt: null })
			.where(and(eq(scene.projectId, projectId), inArray(scene.id, sceneIds)));

		await invalidateCache(`project-structure:${projectId}`);
		return { success: true };
	} catch (error) {
		console.error("restoreScenes error:", error);
		return { success: false, error: "Failed to restore scenes" };
	}
}
