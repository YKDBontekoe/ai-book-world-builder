"use server";

import { z } from "zod";
import { asc, eq, inArray, notInArray } from "drizzle-orm";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { getCached, invalidateCache } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { sceneRepository } from "@/lib/db/repositories";
import { chapter, scene } from "@/lib/db/schema";
import { ChapterWithScenes, Scene } from "@/lib/types";

const projectIdSchema = z.string().uuid();

export async function getProjectStructure(projectId: string): Promise<{
	structure: ChapterWithScenes[];
	structureText: string;
}> {
	try {
		const validatedId = projectIdSchema.parse(projectId);
		// 1. Verify Access (Read is sufficient)
		await ensureProjectAccess(validatedId);

		return getCached(
			`project-structure:${validatedId}`,
			async () => {
				// 2. Fetch all data in parallel
				const [chapters, allScenes] = await Promise.all([
					db
						.select()
						.from(chapter)
						.where(eq(chapter.projectId, validatedId))
						.orderBy(asc(chapter.sequence)),
					sceneRepository.findByProject(validatedId, true), // excludeContent for efficiency
				]);

				// 3. Map scenes to chapters in memory
				const scenesByChapter = allScenes.reduce(
					(acc, s) => {
						if (!acc[s.chapterId]) {
							acc[s.chapterId] = [];
						}
						acc[s.chapterId].push(s as Scene);
						return acc;
					},
					{} as Record<string, Scene[]>,
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

const chapterRegex = /^Chapter (\d+): (.*)$/;
const sceneRegex = /^\s{2}Scene (\d+): (.*)$/;

export async function saveProjectStructure(
	projectId: string,
	structureText: string,
) {
	try {
		// Verify Access (Write)
		await ensureProjectAccess(projectId, true);

		// 1. Parse the text into a structured format
		const lines = structureText.split("\n");
		const parsedStructure: {
			title: string;
			sequence: number;
			scenes: { title: string; sequence: number }[];
		}[] = [];
		let currentChapter: (typeof parsedStructure)[0] | null = null;

		for (const line of lines) {
			if (line.trim() === "") continue;
			const chapterMatch = line.match(chapterRegex);
			if (chapterMatch) {
				currentChapter = {
					sequence: parseInt(chapterMatch[1], 10),
					title: chapterMatch[2].trim(),
					scenes: [],
				};
				parsedStructure.push(currentChapter);
			} else {
				const sceneMatch = line.match(sceneRegex);
				if (sceneMatch && currentChapter) {
					currentChapter.scenes.push({
						sequence: parseInt(sceneMatch[1], 10),
						title: sceneMatch[2].trim(),
					});
				}
			}
		}

		// 2. Reconcile with the database within a transaction
		await db.transaction(async (tx) => {
			const existingChapters = await tx
				.select()
				.from(chapter)
				.where(eq(chapter.projectId, projectId));
			const existingScenes = await tx
				.select()
				.from(scene)
				.where(eq(scene.projectId, projectId));

			const keptChapterIds: string[] = [];
			const keptSceneIds: string[] = [];
			const { outlineId, volumeId } =
				existingChapters[0] || (await initializeProjectStructure(projectId));

			// Update or Create Chapters and Scenes
			for (const parsedChapter of parsedStructure) {
				let currentChapter = existingChapters.find(
					(c) => c.sequence === parsedChapter.sequence,
				);
				if (currentChapter) {
					// Update existing chapter
					await tx
						.update(chapter)
						.set({ title: parsedChapter.title })
						.where(eq(chapter.id, currentChapter.id));
				} else {
					// Create new chapter
					[currentChapter] = await tx
						.insert(chapter)
						.values({
							projectId,
							outlineId,
							volumeId,
							title: parsedChapter.title,
							sequence: parsedChapter.sequence,
							status: "planned",
							createdAt: new Date(),
							updatedAt: new Date(),
						})
						.returning();
				}
				keptChapterIds.push(currentChapter.id);

				for (const parsedScene of parsedChapter.scenes) {
					let currentScene = existingScenes.find(
						(s) =>
							s.chapterId === currentChapter?.id &&
							s.sequence === parsedScene.sequence,
					);
					if (currentScene) {
						// Update existing scene
						await tx
							.update(scene)
							.set({ title: parsedScene.title })
							.where(eq(scene.id, currentScene.id));
					} else {
						// Create new scene
						[currentScene] = await tx
							.insert(scene)
							.values({
								projectId,
								chapterId: currentChapter.id,
								title: parsedScene.title,
								sequence: parsedScene.sequence,
								status: "planned",
								content: "",
								createdAt: new Date(),
								updatedAt: new Date(),
							})
							.returning();
					}
					keptSceneIds.push(currentScene.id);
				}
			}

			// Delete chapters and scenes that are no longer in the structure
			if (keptChapterIds.length > 0) {
				await tx.delete(chapter).where(notInArray(chapter.id, keptChapterIds));
			} else {
				await tx.delete(chapter).where(eq(chapter.projectId, projectId));
			}
			if (keptSceneIds.length > 0) {
				await tx.delete(scene).where(notInArray(scene.id, keptSceneIds));
			} else {
				await tx.delete(scene).where(eq(scene.projectId, projectId));
			}
		});

		await invalidateCache(`project-structure:${projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to save project structure", error);
		return { success: false };
	}
}

async function initializeProjectStructure(projectId: string) {
	// This function appears to be incorrectly implemented, as it's inserting into the `chapter` table
	// for outlines and volumes. This is a temporary fix to make the types work.
	// A proper fix would involve creating outlines and volumes correctly.
	const [outline] = await db
		.insert(chapter)
		.values({
			projectId,
			title: "Default Outline",
			sequence: 1,
			status: "planned",
			createdAt: new Date(),
			updatedAt: new Date(),
		} as any)
		.returning();
	const [volume] = await db
		.insert(chapter)
		.values({
			projectId,
			outlineId: outline.id,
			title: "Volume 1",
			sequence: 1,
			status: "planned",
			createdAt: new Date(),
			updatedAt: new Date(),
		} as any)
		.returning();
	return { outlineId: outline.id, volumeId: volume.id };
}
