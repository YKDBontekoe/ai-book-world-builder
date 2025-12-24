"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { db } from "@/lib/db/drizzle";
import { sceneRepository } from "@/lib/db/repositories";
import { scene } from "@/lib/db/schema";

export async function updateSceneTitle(sceneId: string, newTitle: string) {
	try {
		// 1. Get Scene to verify ownership
		const targetScene = await sceneRepository.findById(sceneId);
		if (!targetScene) throw new Error("Scene not found");

		// 2. Verify Write Access
		await ensureProjectAccess(targetScene.projectId, true);

		// 3. Update Title
		await sceneRepository.update(sceneId, { title: newTitle });

		// 4. Revalidate
		revalidatePath(`/projects/${targetScene.projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to update scene title", error);
		return { success: false, error: "Failed to update title" };
	}
}

export async function duplicateScene(sceneId: string) {
	try {
		// 1. Get Scene
		const targetScene = await sceneRepository.findById(sceneId);
		if (!targetScene) throw new Error("Scene not found");

		// 2. Verify Access
		await ensureProjectAccess(targetScene.projectId, true);

		// 3. Create Duplicate
		// Note: We're not doing complex re-sequencing here for simplicity in this MVP step,
		// just appending with a decimal or finding next int could be better,
		// but for now let's just insert it and let the user reorder or the DB handle it.
		// Actually, let's find the max sequence in this chapter to append to end to be safe?
		// Or insert right after?

		// Let's insert right after with sequence + 1, shifting others?
		// "Shallow" feature depth implies we make it work well.
		// For now, let's just append to the end of the chapter to be safe and simple.

		const chapterScenes = await sceneRepository.findByChapter(
			targetScene.chapterId,
		);
		const maxSeq = Math.max(...chapterScenes.map((s) => s.sequence || 0));

		await sceneRepository.create({
			projectId: targetScene.projectId,
			chapterId: targetScene.chapterId,
			title: `${targetScene.title} (Copy)`,
			content: targetScene.content,
			status: "drafting",
			sequence: maxSeq + 1,
			prevSceneId: targetScene.id, // Link to original as prev? Or just append?
		});

		revalidatePath(`/projects/${targetScene.projectId}`);
		return { success: true };
	} catch (error) {
		console.error("Failed to duplicate scene", error);
		return { success: false, error: "Failed to duplicate" };
	}
}

export async function deleteScene(sceneId: string) {
	try {
		const targetScene = await sceneRepository.findById(sceneId);
		if (!targetScene) throw new Error("Scene not found");

		await ensureProjectAccess(targetScene.projectId, true);

		await db.delete(scene).where(eq(scene.id, sceneId));

		revalidatePath(`/projects/${targetScene.projectId}`);
		return { success: true };
	} catch (error) {
		console.error("Failed to delete scene", error);
		return { success: false, error: "Failed to delete" };
	}
}
