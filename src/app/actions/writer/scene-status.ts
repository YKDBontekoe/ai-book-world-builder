"use server";

import { ensureProjectAccess } from "@/lib/actions-utils";
import { updateScene } from "@/lib/db/queries/scene";

export async function updateSceneStatus(
	sceneId: string,
	status: string,
	projectId: string,
) {
	try {
		await ensureProjectAccess(projectId, true);
		await updateScene({ id: sceneId, status, projectId });
		return { success: true };
	} catch (error) {
		console.error("Failed to update status", error);
		return { success: false, error: "Failed to update status" };
	}
}
