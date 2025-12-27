import "server-only";
import { eq } from "drizzle-orm";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { db } from "@/lib/db/queries";
import { scene } from "@/lib/db/schema";

/**
 * Helper to verify scene access
 */
export async function verifySceneAccess(sceneId: string) {
	const sceneItem = await db.query.scene.findFirst({
		where: eq(scene.id, sceneId),
		columns: { projectId: true },
	});
	if (!sceneItem) throw new Error("Scene not found");
	await ensureProjectAccess(sceneItem.projectId, true);
}

/**
 * Helper to verify chapter access (via first scene or direct lookup if needed)
 * For now, we assume chapter operations fetch scenes first.
 */
export async function verifyProjectAccessViaScenes(
	scenes: { projectId: string }[],
) {
	if (scenes.length === 0) return;
	await ensureProjectAccess(scenes[0].projectId, true);
}
