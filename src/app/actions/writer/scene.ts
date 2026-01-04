"use server";

import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { buildSceneGenerationContext } from "@/lib/ai/context-builder";
import { continueWriting } from "@/lib/ai/writer";
import { invalidateCache } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { sceneRepository } from "@/lib/db/repositories";
import { chapter, scene } from "@/lib/db/schema";

// Validation Schemas
const updateContentSchema = z.object({
	sceneId: z.string().uuid(),
	content: z.string().max(200000, "Scene content exceeds 200k characters"),
});

const updateTitleSchema = z.object({
	sceneId: z.string().uuid(),
	title: z.string().min(1).max(255, "Title exceeds 255 characters"),
});

const createSceneSchema = z.object({
	chapterId: z.string().uuid(),
	title: z.string().min(1).max(255),
	insertAfterSceneId: z.string().uuid().optional(),
});

const generateSceneSchema = z.object({
	chapterId: z.string().uuid(),
	prevSceneId: z.string().uuid().optional(),
});

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
	const validation = updateContentSchema.safeParse({ sceneId, content });
	if (!validation.success) {
		return { success: false, error: validation.error.message };
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

		return { success: true };
	} catch (error) {
		console.error("Failed to update scene content", error);
		return { success: false, error: "Failed to update content" };
	}
}

export async function generateScene(chapterId: string, prevSceneId?: string) {
	const validation = generateSceneSchema.safeParse({ chapterId, prevSceneId });
	if (!validation.success) {
		return { success: false, error: validation.error.message };
	}

	try {
		// 1. Fetch Context & Verify Access
		const [currentChapter] = await db
			.select()
			.from(chapter)
			.where(eq(chapter.id, chapterId))
			.limit(1);

		if (!currentChapter) throw new Error("Chapter not found");

		// Write access required
		await ensureProjectAccess(currentChapter.projectId, true);

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

		// 2. Generate Content
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
	const validation = updateTitleSchema.safeParse({ sceneId, title });
	if (!validation.success) {
		return { success: false, error: validation.error.message };
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
	// Simple UUID check is implicitly handled by DB query, but good to have
	if (!z.string().uuid().safeParse(sceneId).success) {
		return { success: false, error: "Invalid ID format" };
	}

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
	const validation = createSceneSchema.safeParse({
		chapterId,
		title,
		insertAfterSceneId,
	});
	if (!validation.success) {
		return { success: false, error: validation.error.message };
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

		let newSequence = 1;
		let prevSceneId: string | undefined;

		const result = await db.transaction(async (tx) => {
			// Find insertion point
			if (insertAfterSceneId) {
				const [insertAfterScene] = await tx
					.select()
					.from(scene)
					.where(eq(scene.id, insertAfterSceneId))
					.limit(1);

				if (insertAfterScene) {
					newSequence = insertAfterScene.sequence + 1;
					prevSceneId = insertAfterScene.id;

					// Atomic Shift: Increment sequence for all subsequent scenes in this chapter
					await tx
						.update(scene)
						.set({
							sequence: sql`${scene.sequence} + 1`,
							updatedAt: new Date(),
						})
						.where(
							and(
								eq(scene.chapterId, chapterId),
								gte(scene.sequence, newSequence),
							),
						);
				} else {
					// Fallback if ID invalid: append to end
					const scenes = await sceneRepository.findByChapter(chapterId);
					if (scenes.length > 0) {
						newSequence = scenes.length + 1;
						prevSceneId = scenes[scenes.length - 1].id;
					}
				}
			} else {
				// Append to end
				const scenes = await sceneRepository.findByChapter(chapterId);
				if (scenes.length > 0) {
					newSequence = scenes.length + 1;
					prevSceneId = scenes[scenes.length - 1].id;
				}
			}

			// Create the new scene
			const [newScene] = await tx
				.insert(scene)
				.values({
					id: crypto.randomUUID(),
					projectId: currentChapter.projectId,
					chapterId,
					title,
					sequence: newSequence,
					content: "",
					status: "planned",
					prevSceneId,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			return newScene;
		});

		await invalidateCache(`project-structure:${currentChapter.projectId}`);

		return { success: true, sceneId: result.id };
	} catch (error) {
		console.error("Failed to create scene", error);
		return { success: false, error: "Failed to create scene" };
	}
}

export async function reorderScenes(sceneIds: string[], chapterId: string) {
	if (!z.array(z.string().uuid()).safeParse(sceneIds).success) {
		return { success: false, error: "Invalid input" };
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

		// Update sequences in a transaction
		await db.transaction(async (tx) => {
			for (let i = 0; i < sceneIds.length; i++) {
				await tx
					.update(scene)
					.set({ sequence: i + 1, updatedAt: new Date() })
					.where(
						and(eq(scene.id, sceneIds[i]), eq(scene.chapterId, chapterId)),
					);
			}
		});

		await invalidateCache(`project-structure:${currentChapter.projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to reorder scenes", error);
		return { success: false, error: "Failed to reorder scenes" };
	}
}
