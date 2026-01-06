"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { checkUsageQuota } from "@/lib/quota";
import { buildSceneGenerationContext } from "@/lib/ai/context-builder";
import { continueWriting } from "@/lib/ai/writer";
import { invalidateCache } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { sceneRepository } from "@/lib/db/repositories";
import { chapter, scene } from "@/lib/db/schema";
import {
	createSceneInChapterSchema,
	updateSceneContentSchema,
	updateSceneTitleSchema,
} from "@/lib/validation";

export async function getSceneContent(sceneId: string) {
	try {
		// 1. Get Scene using repository
		const targetScene = await sceneRepository.findById(sceneId);

		if (!targetScene) {
			throw new Error("Scene not found");
		}

		// 2. Verify Access (Read is sufficient)
		await ensureProjectAccess(targetScene.projectId);

		return { success: true, content: targetScene.content };
	} catch (error) {
		console.error("Failed to fetch scene content", error);
		return { success: false, error: "Failed to load content" };
	}
}

export async function updateSceneContent(sceneId: string, content: string) {
	const validation = updateSceneContentSchema.safeParse({ sceneId, content });
	if (!validation.success) {
		return { success: false, error: validation.error.errors[0].message };
	}

	try {
		// 1. Get Scene using repository
		const targetScene = await sceneRepository.findById(sceneId);

		if (!targetScene) {
			throw new Error("Scene not found");
		}

		// 2. Verify Access (Write requires ownership)
		await ensureProjectAccess(targetScene.projectId, true);

		// 3. Update using repository
		await sceneRepository.updateContent(sceneId, content, "drafting");

		// Note: Content updates do not invalidate structure, only titles/ordering do.

		return { success: true };
	} catch (error) {
		console.error("Failed to update scene content", error);
		return { success: false };
	}
}

export async function generateScene(chapterId: string, prevSceneId?: string) {
	try {
		// 1. Fetch Context & Verify Access
		const [currentChapter] = await db
			.select()
			.from(chapter)
			.where(eq(chapter.id, chapterId))
			.limit(1);

		if (!currentChapter) throw new Error("Chapter not found");

		// Write access required
		const { project } = await ensureProjectAccess(currentChapter.projectId, true);

		// Find previous scenes using repository
		const scenes = await sceneRepository.findByChapter(chapterId);

		// Use shared context builder
		const { context, prevContent, newSequence } = buildSceneGenerationContext(
			currentChapter,
			scenes,
			prevSceneId,
		);

		// Get preferred model from cookie
		const cookieStore = await cookies();
		const modelId = cookieStore.get("chat-model")?.value;

		// 2. Rate Limiting Check
		const hasQuota = await checkUsageQuota(project.userId);
		if (!hasQuota) {
			return { success: false, error: "Usage quota exceeded" };
		}

		// 3. Generate Content
		const generation = await continueWriting(context, prevContent, { modelId });

		if (generation.error || !generation.text) {
			throw new Error(generation.error || "No text generated");
		}

		// 3. Create New Scene using repository
		const newScene = await sceneRepository.create({
			projectId: currentChapter.projectId,
			chapterId,
			title: "AI Generated Scene",
			sequence: newSequence,
			content: generation.text,
			status: "drafted",
			prevSceneId,
		});

		await invalidateCache(`project-structure:${currentChapter.projectId}`);

		return { success: true, sceneId: newScene.id };
	} catch (error) {
		console.error("Failed to generate scene", error);
		return { success: false, error: "Generation failed" };
	}
}

export async function updateSceneTitle(sceneId: string, title: string) {
	const validation = updateSceneTitleSchema.safeParse({ sceneId, title });
	if (!validation.success) {
		return { success: false, error: validation.error.errors[0].message };
	}

	try {
		const targetScene = await sceneRepository.findById(sceneId);

		if (!targetScene) {
			return { success: false, error: "Scene not found" };
		}

		await ensureProjectAccess(targetScene.projectId, true);

		await sceneRepository.update(sceneId, { title });

		await invalidateCache(`project-structure:${targetScene.projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to update scene title", error);
		return { success: false, error: "Failed to update scene title" };
	}
}

export async function deleteScene(
	sceneId: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const targetScene = await sceneRepository.findById(sceneId);

		if (!targetScene) {
			return { success: false, error: "Scene not found" };
		}

		await ensureProjectAccess(targetScene.projectId, true);

		await sceneRepository.delete(sceneId);

		await invalidateCache(`project-structure:${targetScene.projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to delete scene", error);
		return { success: false, error: "Failed to delete scene" };
	}
}

export async function createSceneInChapter(
	chapterId: string,
	title: string,
	insertAfterSceneId?: string,
) {
	const validation = createSceneInChapterSchema.safeParse({
		chapterId,
		title,
		insertAfterSceneId,
	});
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

		const scenes = await sceneRepository.findByChapter(chapterId);
		let newSequence = scenes.length + 1;
		let prevSceneId: string | undefined;

		if (insertAfterSceneId) {
			const insertAfterScene = scenes.find((s) => s.id === insertAfterSceneId);
			if (insertAfterScene) {
				newSequence = insertAfterScene.sequence + 1;
				prevSceneId = insertAfterScene.id;
				// Shift subsequent scenes
				await db.transaction(async (tx) => {
					for (const s of scenes) {
						if (s.sequence >= newSequence) {
							await tx
								.update(scene)
								.set({ sequence: s.sequence + 1, updatedAt: new Date() })
								.where(eq(scene.id, s.id));
						}
					}
				});
			}
		} else if (scenes.length > 0) {
			prevSceneId = scenes[scenes.length - 1].id;
		}

		const newScene = await sceneRepository.create({
			projectId: currentChapter.projectId,
			chapterId,
			title,
			sequence: newSequence,
			content: "",
			status: "planned",
			prevSceneId,
		});

		await invalidateCache(`project-structure:${currentChapter.projectId}`);

		return { success: true, sceneId: newScene.id };
	} catch (error) {
		console.error("Failed to create scene", error);
		return { success: false, error: "Failed to create scene" };
	}
}

export async function reorderScenes(sceneIds: string[], chapterId: string) {
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

		// Verify all scenes belong to this chapter
		if (sceneIds.length > 0) {
			const scenesInChapter = await db
				.select({ id: scene.id })
				.from(scene)
				.where(
					and(eq(scene.chapterId, chapterId), inArray(scene.id, sceneIds)),
				);

			if (scenesInChapter.length !== sceneIds.length) {
				return {
					success: false,
					error: "One or more scenes do not belong to this chapter",
				};
			}
		}

		// Update sequences using a single SQL UPDATE with CASE statement
		// This avoids N+1 database round-trips.
		const sqlChunks = [];
		sqlChunks.push(sql`(case`);
		for (let i = 0; i < sceneIds.length; i++) {
			sqlChunks.push(sql`when ${scene.id} = ${sceneIds[i]} then ${i + 1}`);
		}
		sqlChunks.push(sql`else ${scene.sequence} end)`);

		const finalSql = sql.join(sqlChunks, sql` `);

		await db
			.update(scene)
			.set({ sequence: finalSql, updatedAt: new Date() })
			.where(
				and(eq(scene.chapterId, chapterId), inArray(scene.id, sceneIds)),
			);

		await invalidateCache(`project-structure:${currentChapter.projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to reorder scenes", error);
		return { success: false, error: "Failed to reorder scenes" };
	}
}
