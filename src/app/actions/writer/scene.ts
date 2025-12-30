"use server";

import { and, eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
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

const bulkDeleteScenesSchema = z.object({
	sceneIds: z.array(z.string().uuid()).max(100), // Add reasonable limit
});

export async function bulkDeleteScenes(
	sceneIds: string[],
): Promise<{
	success: boolean;
	deletedScenes?: (typeof scene.$inferSelect)[];
	error?: string;
}> {
	try {
		const parsed = bulkDeleteScenesSchema.safeParse({ sceneIds });
		if (!parsed.success) {
			return { success: false, error: "Invalid input" };
		}
		if (parsed.data.sceneIds.length === 0)
			return { success: true, deletedScenes: [] };

		const { scenesToDelete, projectId } = await db.transaction(async (tx) => {
			// 1. Fetch scenes to verify ownership and store for undo
			const scenesToDelete = await tx
				.select()
				.from(scene)
				.where(inArray(scene.id, parsed.data.sceneIds));

			if (scenesToDelete.length === 0) {
				return { scenesToDelete: [], projectId: undefined };
			}

			const projectId = scenesToDelete[0].projectId;

			// Verify all scenes belong to the same project
			const allSameProject = scenesToDelete.every(
				(s) => s.projectId === projectId,
			);
			if (!allSameProject) {
				throw new Error("Cannot delete scenes from multiple projects");
			}

			await ensureProjectAccess(projectId, true);

			// 2. Delete scenes
			await tx.delete(scene).where(inArray(scene.id, parsed.data.sceneIds));

			return { scenesToDelete, projectId };
		});

		if (projectId) {
			await invalidateCache(`project-structure:${projectId}`);
		}

		return { success: true, deletedScenes: scenesToDelete };
	} catch (error) {
		console.error("Failed to bulk delete scenes", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to delete scenes",
		};
	}
}

export async function restoreScenes(
	scenesToRestore: (typeof scene.$inferSelect)[],
): Promise<{ success: boolean; error?: string }> {
	try {
		if (scenesToRestore.length === 0) return { success: true };

		// Verify all scenes belong to the same project
		const projectIds = new Set(scenesToRestore.map((s) => s.projectId));
		if (projectIds.size !== 1) {
			return {
				success: false,
				error: "Cannot restore scenes from multiple projects",
			};
		}

		const projectId = scenesToRestore[0].projectId;
		await ensureProjectAccess(projectId, true);

		// Validate scene IDs don't already exist (prevent overwrites)
		const existingScenes = await db
			.select({ id: scene.id })
			.from(scene)
			.where(
				inArray(
					scene.id,
					scenesToRestore.map((s) => s.id),
				),
			);

		if (existingScenes.length > 0) {
			console.warn(
				"Attempt to restore existing scene IDs:",
				existingScenes.map((s) => s.id),
			);
			return { success: false, error: "Some scenes already exist" };
		}

		// Restore scenes (insert with ID)
		await db.insert(scene).values(scenesToRestore).onConflictDoNothing();

		await invalidateCache(`project-structure:${projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to restore scenes", error);
		return { success: false, error: "Failed to restore scenes" };
	}
}
