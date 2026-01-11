"use server";

import { ensureProjectAccess } from "@/lib/actions-utils";
import { updateSceneCard } from "@/lib/db/queries/scene";

export async function updateSceneChronology(
	sceneId: string,
	sequence: number,
	projectId: string,
) {
	try {
		await ensureProjectAccess(projectId, true);
		await updateSceneCard({ sceneId, chronologicalSequence: sequence });
		return { success: true };
	} catch (error) {
		console.error("Failed to update chronology:", error);
		return { success: false, error: "Failed to update chronology" };
	}
}
