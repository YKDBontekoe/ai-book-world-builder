"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { buildSceneGenerationContext } from "@/lib/ai/context-builder";
import { continueWriting } from "@/lib/ai/writer";
import { invalidateCache } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { sceneRepository } from "@/lib/db/repositories";
import { chapter, scene } from "@/lib/db/schema";

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

		// Handle prevSceneId chain in transaction
		await db.transaction(async (tx) => {
			// Find scene that points to this one
			const [nextScene] = await tx
				.select()
				.from(scene)
				.where(eq(scene.prevSceneId, sceneId))
				.limit(1);

			if (nextScene) {
				await tx
					.update(scene)
					.set({ prevSceneId: targetScene.prevSceneId, updatedAt: new Date() })
					.where(eq(scene.id, nextScene.id));
			}

			// Delete the scene
			await tx.delete(scene).where(eq(scene.id, sceneId));
		});

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

		// If inserted in middle, update the next scene's prevSceneId
		if (insertAfterSceneId) {
			const nextScene = scenes.find(
				(s) => s.prevSceneId === insertAfterSceneId,
			);
			if (nextScene) {
				await db
					.update(scene)
					.set({ prevSceneId: newScene.id, updatedAt: new Date() })
					.where(eq(scene.id, nextScene.id));
			}
		}

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

			// Also update prevSceneIds to match the new linear order
			// This is a simplification but keeps the linked list valid for linear view
			for (let i = 0; i < sceneIds.length; i++) {
				const currentId = sceneIds[i];
				const prevId = i > 0 ? sceneIds[i - 1] : null;
				await tx
					.update(scene)
					.set({ prevSceneId: prevId })
					.where(eq(scene.id, currentId));
			}
		});

		await invalidateCache(`project-structure:${currentChapter.projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to reorder scenes", error);
		return { success: false, error: "Failed to reorder scenes" };
	}
}

export async function duplicateScene(sceneId: string) {
	try {
		// 1. Get Scene
		const targetScene = await sceneRepository.findById(sceneId);
		if (!targetScene) {
			return { success: false, error: "Scene not found" };
		}

		// 2. Verify Access
		await ensureProjectAccess(targetScene.projectId, true);

		// 3. Prepare new data
		const scenes = await sceneRepository.findByChapter(targetScene.chapterId);
		const newSequence = targetScene.sequence + 1;

		// 4. Transaction: Shift others and Insert
		const newScene = await db.transaction(async (tx) => {
			// Shift subsequent scenes
			for (const s of scenes) {
				if (s.sequence >= newSequence) {
					await tx
						.update(scene)
						.set({ sequence: s.sequence + 1, updatedAt: new Date() })
						.where(eq(scene.id, s.id));
				}
			}

			// Insert duplicate
			const [created] = await tx
				.insert(scene)
				.values({
					projectId: targetScene.projectId,
					chapterId: targetScene.chapterId,
					title: `${targetScene.title} (Copy)`,
					content: targetScene.content,
					sequence: newSequence,
					status: targetScene.status, // Preserve status
					prevSceneId: targetScene.id, // Point to original
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			// Update the scene that used to follow original to point to new duplicate
			// Find scene where prevSceneId was targetScene.id (in the old state)
			const nextScene = scenes.find((s) => s.prevSceneId === targetScene.id);
			if (nextScene) {
				await tx
					.update(scene)
					.set({ prevSceneId: created.id, updatedAt: new Date() })
					.where(eq(scene.id, nextScene.id));
			}

			return created;
		});

		await invalidateCache(`project-structure:${targetScene.projectId}`);

		return { success: true, sceneId: newScene.id };
	} catch (error) {
		console.error("Failed to duplicate scene", error);
		return { success: false, error: "Failed to duplicate scene" };
	}
}

export async function moveSceneToChapter(
	sceneId: string,
	targetChapterId: string,
) {
	try {
		// 1. Get Scene & Verify
		const targetScene = await sceneRepository.findById(sceneId);
		if (!targetScene) return { success: false, error: "Scene not found" };

		// 2. Verify Access (Need write on project)
		// We assume chapters are in same project for now, but verify targetChapter too
		const [targetChapter] = await db
			.select()
			.from(chapter)
			.where(eq(chapter.id, targetChapterId))
			.limit(1);

		if (!targetChapter)
			return { success: false, error: "Target chapter not found" };

		// Ensure same project (security check)
		if (targetScene.projectId !== targetChapter.projectId) {
			return {
				success: false,
				error: "Cannot move scene to a different project",
			};
		}

		await ensureProjectAccess(targetScene.projectId, true);

		if (targetScene.chapterId === targetChapterId) {
			return { success: false, error: "Scene is already in this chapter" };
		}

		// 3. Move Logic
		await db.transaction(async (tx) => {
			// A. Heal source chain
			// Find scene that points to targetScene
			const [nextInSource] = await tx
				.select()
				.from(scene)
				.where(eq(scene.prevSceneId, sceneId))
				.limit(1);

			if (nextInSource) {
				await tx
					.update(scene)
					.set({ prevSceneId: targetScene.prevSceneId, updatedAt: new Date() })
					.where(eq(scene.id, nextInSource.id));
			}

			// B. Prepare target position (End of list)
			const [lastInTarget] = await tx
				.select()
				.from(scene)
				.where(eq(scene.chapterId, targetChapterId))
				.orderBy(desc(scene.sequence))
				.limit(1);

			const newSequence = (lastInTarget?.sequence ?? 0) + 1;
			const newPrevSceneId = lastInTarget?.id ?? null;

			// C. Update Scene
			await tx
				.update(scene)
				.set({
					chapterId: targetChapterId,
					sequence: newSequence,
					prevSceneId: newPrevSceneId,
					updatedAt: new Date(),
				})
				.where(eq(scene.id, sceneId));
		});

		await invalidateCache(`project-structure:${targetScene.projectId}`);
		return { success: true };
	} catch (error) {
		console.error("Failed to move scene", error);
		return { success: false, error: "Failed to move scene" };
	}
}
