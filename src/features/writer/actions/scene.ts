"use server";

import { and, eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { buildSceneGenerationContext } from "@/lib/ai/context-builder";
import { generationService } from "@/lib/ai/services";
import { invalidateCache } from "@/lib/cache";
import { type DbTransaction, db } from "@/lib/db";
import { sceneRepository } from "@/lib/db/repositories";
import { chapter, scene } from "@/lib/db/schema";
import { checkUsageQuota } from "@/lib/quota";
import {
	generateEpubFromContent,
	generatePdfFromContent,
} from "@/lib/services/book-exporter";
import { sceneSequenceService } from "@/lib/services/scene-sequence-service";
import {
	bulkDeleteScenesSchema,
	bulkExportScenesSchema,
	createSceneInChapterSchema,
	deleteSceneSchema,
	generateSceneSchema,
	getSceneContentSchema,
	reorderScenesSchema,
	updateSceneContentSchema,
	updateSceneTitleSchema,
} from "@/lib/validation";

export async function getSceneContent(projectId: string, sceneId: string) {
	const validation = getSceneContentSchema.safeParse({ projectId, sceneId });
	if (!validation.success) {
		return { success: false, error: validation.error.errors[0].message };
	}

	try {
		// 1. Verify Access (Read is sufficient)
		await ensureProjectAccess(projectId);

		// 2. Get Scene using secure, project-scoped repository method
		const targetScene = await sceneRepository.findByIdInProject(
			sceneId,
			projectId,
		);

		if (!targetScene) {
			throw new Error("Scene not found in this project");
		}

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
		await sceneRepository.updateContent(
			sceneId,
			content,
			"drafting",
			targetScene.projectId,
		);

		// Note: Content updates do not invalidate structure, only titles/ordering do.

		return { success: true };
	} catch (error) {
		console.error("Failed to update scene content", error);
		return { success: false };
	}
}

/**
 * Generates a new scene using AI based on context from the chapter and previous scenes.
 *
 * @param chapterId - The ID of the chapter to generate the scene in.
 * @param prevSceneId - Optional ID of the preceding scene to maintain continuity.
 * @returns A promise resolving to an object indicating success/failure and the new scene ID or error.
 */
export async function generateScene(
	chapterId: string,
	prevSceneId?: string,
): Promise<{ success: boolean; sceneId?: string; error?: string }> {
	const validation = generateSceneSchema.safeParse({ chapterId, prevSceneId });
	if (!validation.success) {
		return { success: false, error: validation.error.errors[0].message };
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
		const { project } = await ensureProjectAccess(
			currentChapter.projectId,
			true,
		);

		// Find previous scenes using repository
		const scenes = await sceneRepository.findByChapter(chapterId);

		// Use shared context builder
		const { context, prevContent } = await buildSceneGenerationContext(
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
		const generation = await generationService.continueWriting(
			context,
			prevContent,
			{ modelId },
		);

		if (generation.error || !generation.text) {
			throw new Error(generation.error || "No text generated");
		}

		// 4. Create New Scene using transaction to prevent race conditions on sequence
		// Note: We bypass repository here to use transaction
		const newSceneId = crypto.randomUUID();

		await db.transaction(async (tx: DbTransaction) => {
			const { sequence, prevSceneId: finalPrevSceneId } =
				await sceneSequenceService.prepareInsertion(chapterId, prevSceneId, tx);

			await tx.insert(scene).values({
				id: newSceneId,
				projectId: currentChapter.projectId,
				chapterId,
				title: "AI Generated Scene",
				sequence,
				content: generation.text,
				status: "drafted",
				prevSceneId: finalPrevSceneId,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		});

		await invalidateCache(`project-structure:${currentChapter.projectId}`);

		return { success: true, sceneId: newSceneId };
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
	const validation = deleteSceneSchema.safeParse({ sceneId });
	if (!validation.success) {
		return { success: false, error: validation.error.errors[0].message };
	}

	try {
		const targetScene = await sceneRepository.findById(sceneId);

		if (!targetScene) {
			return { success: false, error: "Scene not found" };
		}

		await ensureProjectAccess(targetScene.projectId, true);

		await sceneRepository.delete(sceneId, targetScene.projectId);

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

		// Use a transaction to ensure atomic sequence calculation and insertion
		const newSceneId = crypto.randomUUID();

		await db.transaction(async (tx: DbTransaction) => {
			const { sequence, prevSceneId } =
				await sceneSequenceService.prepareInsertion(
					chapterId,
					insertAfterSceneId,
					tx,
				);

			await tx.insert(scene).values({
				id: newSceneId,
				projectId: currentChapter.projectId,
				chapterId,
				title,
				sequence,
				content: "",
				status: "planned",
				prevSceneId,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		});

		await invalidateCache(`project-structure:${currentChapter.projectId}`);

		return { success: true, sceneId: newSceneId };
	} catch (error) {
		console.error("Failed to create scene", error);
		return { success: false, error: "Failed to create scene" };
	}
}

export async function reorderScenes(sceneIds: string[], chapterId: string) {
	if (sceneIds.length === 0) {
		return { success: true };
	}

	const validation = reorderScenesSchema.safeParse({ sceneIds, chapterId });
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

		await db.transaction(async (tx: DbTransaction) => {
			await sceneSequenceService.reorderScenes(chapterId, sceneIds, tx);
		});

		await invalidateCache(`project-structure:${currentChapter.projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to reorder scenes", error);
		return { success: false, error: "Failed to reorder scenes" };
	}
}

export async function bulkExportScenes(sceneIds: string[]) {
	const validation = bulkExportScenesSchema.safeParse({ sceneIds });
	if (!validation.success) {
		return { success: false, error: validation.error.errors[0].message };
	}

	try {
		if (sceneIds.length === 0) return { success: true, content: "" };

		// 1. Get first scene to verify project access
		const firstScene = await sceneRepository.findById(sceneIds[0]);
		if (!firstScene) {
			return { success: false, error: "One or more scenes not found" };
		}

		await ensureProjectAccess(firstScene.projectId);

		// 2. Fetch all scenes
		const scenes = await db
			.select({
				id: scene.id,
				title: scene.title,
				content: scene.content,
				projectId: scene.projectId,
			})
			.from(scene)
			.where(inArray(scene.id, sceneIds));

		// Security check
		const unauthorized = scenes.some(
			(s) => s.projectId !== firstScene.projectId,
		);
		if (unauthorized) {
			return {
				success: false,
				error: "Security violation: Scenes from multiple projects",
			};
		}

		// 3. Sort scenes based on input array order
		const sceneMap = new Map(scenes.map((s) => [s.id, s]));
		const sortedScenes = sceneIds.map((id) => sceneMap.get(id)).filter(Boolean);

		// 4. Concatenate
		const exportText = sortedScenes
			.map((s) => `## ${s?.title}\n\n${s?.content || ""}`)
			.join("\n\n***\n\n");

		return { success: true, content: exportText };
	} catch (error) {
		console.error("Failed to export scenes", error);
		return { success: false, error: "Failed to export scenes" };
	}
}

export async function bulkDeleteScenes(sceneIds: string[]) {
	const validation = bulkDeleteScenesSchema.safeParse({ sceneIds });
	if (!validation.success) {
		return { success: false, error: validation.error.errors[0].message };
	}

	try {
		if (sceneIds.length === 0) return { success: true };

		// 1. Check access (using first scene)
		const firstScene = await sceneRepository.findById(sceneIds[0]);
		if (!firstScene) {
			return { success: false, error: "Scene not found" };
		}
		await ensureProjectAccess(firstScene.projectId, true);

		// 2. Perform deletions sequentially
		for (const id of sceneIds) {
			const result = await deleteScene(id);
			if (!result.success) {
				return {
					success: false,
					error: `Failed to delete scene ${id}: ${result.error}`,
				};
			}
		}

		return { success: true };
	} catch (error) {
		console.error("Failed to bulk delete scenes", error);
		return { success: false, error: "Failed to bulk delete scenes" };
	}
}

export async function bulkExportScenesFormatted(
	sceneIds: string[],
	format: "md" | "txt" | "pdf" | "epub",
) {
	const validation = bulkExportScenesSchema.safeParse({ sceneIds });
	if (!validation.success) {
		return { success: false, error: validation.error.errors[0].message };
	}

	try {
		if (sceneIds.length === 0)
			return { success: true, content: "", filename: "", contentType: "" };

		// 1. Get first scene to verify project access
		const firstScene = await sceneRepository.findById(sceneIds[0]);
		if (!firstScene) {
			return { success: false, error: "One or more scenes not found" };
		}

		const { project } = await ensureProjectAccess(firstScene.projectId);

		// 2. Fetch all scenes
		const scenes = await db
			.select({
				id: scene.id,
				title: scene.title,
				content: scene.content,
				projectId: scene.projectId,
			})
			.from(scene)
			.where(inArray(scene.id, sceneIds));

		// Security check
		const unauthorized = scenes.some(
			(s) => s.projectId !== firstScene.projectId,
		);
		if (unauthorized) {
			return {
				success: false,
				error: "Security violation: Scenes from multiple projects",
			};
		}

		// 3. Sort scenes based on input array order
		const sceneMap = new Map(scenes.map((s) => [s.id, s]));
		const sortedScenes = sceneIds.map((id) => sceneMap.get(id)).filter(Boolean);

		const sanitizedTitle = project.name
			.replace(/[^a-z0-9]/gi, "_")
			.toLowerCase();
		const timestamp = new Date().toISOString().split("T")[0];
		const filenameBase = `${sanitizedTitle}_scenes_${timestamp}`;

		// 4. Handle different formats
		if (format === "pdf" || format === "epub") {
			const bookContent = {
				title: `${project.name} - Selected Scenes`,
				chapters: sortedScenes.map((s) => ({
					title: s?.title || "Untitled",
					content: s?.content || "",
				})),
			};

			let buffer: Buffer;
			let extension: string;
			let contentType: string;

			if (format === "pdf") {
				buffer = await generatePdfFromContent(bookContent);
				extension = "pdf";
				contentType = "application/pdf";
			} else {
				buffer = await generateEpubFromContent(bookContent);
				extension = "epub";
				contentType = "application/epub+zip";
			}

			return {
				success: true,
				content: buffer.toString("base64"),
				filename: `${filenameBase}.${extension}`,
				contentType,
			};
		}

		// Default to Text/Markdown
		const exportText = sortedScenes
			.map((s) => `## ${s?.title}\n\n${s?.content || ""}`)
			.join("\n\n***\n\n");

		return {
			success: true,
			content: exportText,
			filename: `${filenameBase}.${format === "md" ? "md" : "txt"}`,
			contentType: "text/plain",
		};
	} catch (error) {
		console.error("Failed to export scenes", error);
		return { success: false, error: "Failed to export scenes" };
	}
}
