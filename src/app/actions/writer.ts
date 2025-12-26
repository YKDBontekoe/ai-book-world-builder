"use server";

import { asc, desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { buildSceneGenerationContext } from "@/lib/ai/context-builder";
import { continueWriting } from "@/lib/ai/writer";
import { getCached, invalidateCache } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { createOutline, getOutlinesForProject } from "@/lib/db/queries/outline";
import {
	createVolumePlan,
	getVolumePlansForProject,
} from "@/lib/db/queries/volume";
import {
	chapterRepository,
	sceneRepository,
} from "@/lib/db/repositories";
import { chapter, chapterVersion, project, scene } from "@/lib/db/schema";

export async function getProjectStructure(projectId: string) {
	try {
		// 1. Verify Access (Read is sufficient)
		await ensureProjectAccess(projectId);

		return getCached(
			`project-structure:${projectId}`,
			async () => {
				// 2. Fetch all data in parallel
				const [chapters, allScenes] = await Promise.all([
					db
						.select()
						.from(chapter)
						.where(eq(chapter.projectId, projectId))
						.orderBy(asc(chapter.sequence)),
					sceneRepository.findByProject(projectId, true), // excludeContent for efficiency
				]);

				// 3. Map scenes to chapters in memory
				const scenesByChapter = allScenes.reduce(
					(acc, s) => {
						if (!acc[s.chapterId]) {
							acc[s.chapterId] = [];
						}
						acc[s.chapterId].push(s);
						return acc;
					},
					{} as Record<string, typeof allScenes>,
				);

				const structure = chapters.map((ch) => ({
					...ch,
					scenes: scenesByChapter[ch.id] || [],
				}));

				// 4. Generate text representation
				const structureText = formatStructure(structure);

				return { structure, structureText };
			},
			3600, // Cache for 1 hour (invalidated on mutation)
		);
	} catch (error) {
		console.error("Failed to fetch project structure", error);
		return { structure: [], structureText: "" };
	}
}

function formatStructure(
	structure: {
		sequence: number;
		title: string;
		scenes: { sequence: number; title: string }[];
	}[],
) {
	return structure
		.map((ch) => {
			const chHeader = `Chapter ${ch.sequence}: ${ch.title}`;
			const scenesText = ch.scenes
				.map((s) => `  Scene ${s.sequence}: ${s.title}`)
				.join("\n");
			return `${chHeader}\n${scenesText}`;
		})
		.join("\n\n");
}

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

export async function createChapterSnapshot(chapterId: string) {
	try {
		// 1. Fetch current chapter
		const [currentChapter] = await db
			.select()
			.from(chapter)
			.where(eq(chapter.id, chapterId))
			.limit(1);

		if (!currentChapter) return { success: false };

		// 2. Verify Access (Write requires ownership)
		await ensureProjectAccess(currentChapter.projectId, true);

		// 3. Get scenes using repository
		const scenes = await sceneRepository.findByChapter(chapterId);

		const fullContent = scenes
			.map((s) => `## ${s.title}\n\n${s.content || ""}`)
			.join("\n\n");

		// 4. Determine next version number
		const [lastVersion] = await db
			.select()
			.from(chapterVersion)
			.where(eq(chapterVersion.chapterId, chapterId))
			.orderBy(desc(chapterVersion.version))
			.limit(1);

		const nextVersion = (lastVersion?.version || 0) + 1;

		// 5. Save snapshot
		await db.insert(chapterVersion).values({
			chapterId,
			content: fullContent,
			version: nextVersion,
			createdAt: new Date(),
		});

		return { success: true };
	} catch (error) {
		console.error("Failed to create chapter snapshot", error);
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

export async function saveProjectStructure(
	projectId: string,
	_structureText: string,
) {
	try {
		// Verify Access (Write)
		await ensureProjectAccess(projectId, true);

		// Placeholder implementation for StructureEditorDialog

		await invalidateCache(`project-structure:${projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to save project structure", error);
		return { success: false };
	}
}

export async function createNewChapter(projectId: string) {
	try {
		await ensureProjectAccess(projectId, true);

		// 1. Get or Create Outline/Volume (Basic Check)
		const outlines = await getOutlinesForProject({ projectId });
		let outlineId = outlines[0]?.id;
		if (!outlineId) {
			const newOutline = await createOutline({
				projectId,
				title: "Project Outline",
				pov: "Third Person",
				tone: "Neutral",
				pacing: "Moderate",
				beats: [],
			});
			outlineId = newOutline.id;
		}

		const volumes = await getVolumePlansForProject({ projectId });
		let volumeId = volumes[0]?.id;
		if (!volumeId) {
			const newVolume = await createVolumePlan({
				projectId,
				outlineId,
				title: "Volume 1",
				chapters: [],
			});
			volumeId = newVolume.id;
		}

		// 2. Determine sequence
		const existingChapters = await db
			.select()
			.from(chapter)
			.where(eq(chapter.volumeId, volumeId))
			.orderBy(desc(chapter.sequence));

		const nextSequence = (existingChapters[0]?.sequence ?? 0) + 1;

		// 3. Create Chapter
		const [newChapter] = await db
			.insert(chapter)
			.values({
				projectId,
				volumeId,
				outlineId,
				title: `Chapter ${nextSequence}`,
				sequence: nextSequence,
				status: "planned",
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		await invalidateCache(`project-structure:${projectId}`);

		return { success: true, chapterId: newChapter.id };
	} catch (error) {
		console.error("Failed to create new chapter", error);
		return { success: false };
	}
}

export async function initializeProject(projectId: string) {
	try {
		await ensureProjectAccess(projectId, true);

		// 1. Check/Create Structure
		const outlines = await getOutlinesForProject({ projectId });
		let outlineId = outlines[0]?.id;
		if (!outlineId) {
			const newOutline = await createOutline({
				projectId,
				title: "Project Outline",
				pov: "Third Person",
				tone: "Neutral",
				pacing: "Moderate",
				beats: [],
			});
			outlineId = newOutline.id;
		}

		const volumes = await getVolumePlansForProject({ projectId });
		let volumeId = volumes[0]?.id;
		let chapterId: string | null = null;

		if (!volumeId) {
			// Create Volume AND Chapter 1
			const newVolume = await createVolumePlan({
				projectId,
				outlineId,
				title: "Volume 1",
				chapters: [{ title: "Chapter 1", sequence: 1 }],
			});
			volumeId = newVolume.id;
			chapterId = newVolume.chapters[0]?.id;
		} else {
			// Volume exists, check for chapters
			const chapters = await db
				.select()
				.from(chapter)
				.where(eq(chapter.volumeId, volumeId))
				.orderBy(asc(chapter.sequence));

			if (chapters.length > 0) {
				chapterId = chapters[0].id;
			} else {
				// Create Chapter 1
				const [newChapter] = await db
					.insert(chapter)
					.values({
						projectId,
						volumeId,
						outlineId,
						title: "Chapter 1",
						sequence: 1,
						status: "planned",
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();
				chapterId = newChapter.id;
			}
		}

		if (!chapterId) throw new Error("Failed to resolve chapter");

		// 2. Check/Create Scene 1 using repository
		const scenes = await sceneRepository.findByChapter(chapterId);

		let sceneId = scenes[0]?.id;

		if (!sceneId) {
			const newScene = await sceneRepository.create({
				projectId,
				chapterId,
				title: "Scene 1",
				sequence: 1,
				content: "",
				status: "drafting",
			});
			sceneId = newScene.id;
		}

		await invalidateCache(`project-structure:${projectId}`);

		return { success: true, sceneId };
	} catch (error) {
		console.error("Failed to initialize project", error);
		return { success: false, error: "Initialization failed" };
	}
}

export async function updateLastViewedScene(
	projectId: string,
	sceneId: string,
) {
	try {
		await ensureProjectAccess(projectId, true);

		await db
			.update(project)
			.set({ lastViewedSceneId: sceneId })
			.where(eq(project.id, projectId));

		// Does not affect structure

		return { success: true };
	} catch (error) {
		console.error("Failed to update last viewed scene", error);
		return { success: false };
	}
}

export async function updateChapterTitle(
	chapterId: string,
	title: string,
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

		await chapterRepository.update(chapterId, { title });

		await invalidateCache(`project-structure:${currentChapter.projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to update chapter title", error);
		return { success: false, error: "Failed to update chapter title" };
	}
}

export async function reorderScenes(
	sceneIds: string[],
	chapterId: string,
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

		// Update sequences in a transaction
		await db.transaction(async (tx) => {
			for (let i = 0; i < sceneIds.length; i++) {
				await tx
					.update(scene)
					.set({ sequence: i + 1, updatedAt: new Date() })
					.where(eq(scene.id, sceneIds[i]));
			}
		});

		await invalidateCache(`project-structure:${currentChapter.projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to reorder scenes", error);
		return { success: false, error: "Failed to reorder scenes" };
	}
}

export async function reorderChapters(
	chapterIds: string[],
	volumeId: string,
) {
	try {
		const [firstChapter] = await db
			.select()
			.from(chapter)
			.where(eq(chapter.id, chapterIds[0]))
			.limit(1);

		if (!firstChapter || firstChapter.volumeId !== volumeId) {
			return { success: false, error: "Invalid chapter or volume" };
		}

		await ensureProjectAccess(firstChapter.projectId, true);

		// Update sequences in a transaction
		await db.transaction(async (tx) => {
			for (let i = 0; i < chapterIds.length; i++) {
				await tx
					.update(chapter)
					.set({ sequence: i + 1, updatedAt: new Date() })
					.where(eq(chapter.id, chapterIds[i]));
			}
		});

		await invalidateCache(`project-structure:${firstChapter.projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to reorder chapters", error);
		return { success: false, error: "Failed to reorder chapters" };
	}
}

export async function updateSceneTitle(
	sceneId: string,
	title: string,
) {
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

export async function deleteScene(sceneId: string) {
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

export async function deleteChapter(chapterId: string) {
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

		await chapterRepository.delete(chapterId);

		await invalidateCache(`project-structure:${currentChapter.projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to delete chapter", error);
		return { success: false, error: "Failed to delete chapter" };
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
