"use server";

import { asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { getCached, invalidateCache } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { sceneRepository } from "@/lib/db/repositories";
import { chapter, outline, type Scene, scene, volume } from "@/lib/db/schema";

// ============================================================================
// Validation Schemas
// ============================================================================

const projectIdSchema = z.string();
const saveStructureSchema = z.object({
	projectId: z.string(),
	structureText: z.string().trim().min(1, "Structure text cannot be empty"),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get the structure of a project (chapters and scenes)
 */
export const getProjectStructure = createUserAction({
	input: z.object({ projectId: z.string() }),
	handler: async ({
		input: { projectId },
	}): Promise<{
		structure: (typeof chapter.$inferSelect & {
			scenes: (typeof scene.$inferSelect)[];
		})[];
		structureText: string;
	}> => {
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
	},
});

/**
 * Save the project structure from manual text input
 */
export const saveProjectStructure = createUserAction({
	input: saveStructureSchema,
	handler: async ({ input: { projectId, structureText } }) => {
		// 1. Verify Access (Write)
		await ensureProjectAccess(projectId, true);

		// 2. Parse Text
		const newStructure = parseStructureText(structureText);

		// 3. Sync with DB (Smart Sync)
		await db.transaction(async (tx) => {
			// A. Get existing structure
			const [existingChapters, existingScenes] = await Promise.all([
				tx
					.select()
					.from(chapter)
					.where(eq(chapter.projectId, projectId))
					.orderBy(asc(chapter.sequence)),
				tx
					.select()
					.from(scene)
					.where(eq(scene.projectId, projectId))
					.orderBy(asc(scene.sequence)),
			]);

			// Group Scenes by ChapterId
			const dbScenesByChapter = existingScenes.reduce(
				(acc, s) => {
					if (!acc[s.chapterId]) acc[s.chapterId] = [];
					acc[s.chapterId].push(s);
					return acc;
				},
				{} as Record<string, Scene[]>,
			);

			// Helper to normalize titles for matching
			const normalize = (s: string) =>
				s
					.toLowerCase()
					.normalize("NFKD")
					.replace(/[\u0300-\u036f]/g, "")
					.replace(/\s+/g, " ")
					.trim();

			// Prepare Outline/Volume IDs
			let outlineId = existingChapters[0]?.outlineId;
			let volumeId = existingChapters[0]?.volumeId;

			if (!outlineId || !volumeId) {
				const outlines = await tx
					.select()
					.from(outline)
					.where(eq(outline.projectId, projectId))
					.limit(1);
				if (outlines.length > 0) {
					outlineId = outlines[0].id;
					const volumes = await tx
						.select()
						.from(volume)
						.where(eq(volume.outlineId, outlineId))
						.limit(1);
					if (volumes.length > 0) {
						volumeId = volumes[0].id;
					} else {
						const [newVol] = await tx
							.insert(volume)
							.values({
								title: "Volume 1",
								projectId,
								outlineId,
								createdAt: new Date(),
								updatedAt: new Date(),
							})
							.returning();
						volumeId = newVol.id;
					}
				} else {
					const [newOutline] = await tx
						.insert(outline)
						.values({
							title: "Book Outline",
							projectId,
							pov: "third_limited",
							tone: "neutral",
							pacing: "medium",
							createdAt: new Date(),
							updatedAt: new Date(),
						})
						.returning();
					outlineId = newOutline.id;

					const [newVol] = await tx
						.insert(volume)
						.values({
							title: "Volume 1",
							projectId,
							outlineId,
							createdAt: new Date(),
							updatedAt: new Date(),
						})
						.returning();
					volumeId = newVol.id;
				}
			}

			const chapterIdsToKeep = new Set<string>();
			const sceneIdsToKeep = new Set<string>();
			const updatePromises: Promise<unknown>[] = [];
			const insertPromises: Promise<unknown>[] = [];

			// B. Process Chapters
			for (const newCh of newStructure) {
				const match = existingChapters.find(
					(c) =>
						normalize(c.title) === normalize(newCh.title) &&
						!chapterIdsToKeep.has(c.id),
				);

				let currentChapterId: string;
				let isNewChapter = false;

				if (match) {
					currentChapterId = match.id;
					chapterIdsToKeep.add(match.id);
					updatePromises.push(
						tx
							.update(chapter)
							.set({
								sequence: newCh.sequence,
								updatedAt: new Date(),
								title: newCh.title,
							})
							.where(eq(chapter.id, match.id)),
					);
				} else {
					const [created] = await tx
						.insert(chapter)
						.values({
							projectId,
							outlineId,
							volumeId,
							title: newCh.title,
							sequence: newCh.sequence,
							status: "planned",
							createdAt: new Date(),
							updatedAt: new Date(),
						})
						.returning();
					currentChapterId = created.id;
					isNewChapter = true;
				}

				// C. Process Scenes for this Chapter
				const existingChScenes =
					!isNewChapter && match ? dbScenesByChapter[match.id] || [] : [];

				for (const newSc of newCh.scenes) {
					const scMatch = existingChScenes.find(
						(s) =>
							normalize(s.title) === normalize(newSc.title) &&
							!sceneIdsToKeep.has(s.id),
					);

					if (scMatch) {
						sceneIdsToKeep.add(scMatch.id);
						updatePromises.push(
							tx
								.update(scene)
								.set({
									sequence: newSc.sequence,
									updatedAt: new Date(),
									title: newSc.title,
									chapterId: currentChapterId,
								})
								.where(eq(scene.id, scMatch.id)),
						);
					} else {
						insertPromises.push(
							tx.insert(scene).values({
								projectId,
								chapterId: currentChapterId,
								title: newSc.title,
								sequence: newSc.sequence,
								status: "planned",
								content: "",
								createdAt: new Date(),
								updatedAt: new Date(),
							}),
						);
					}
				}
			}

			// D. Cleanup (Delete unmatched)
			const chaptersToDeleteIds = existingChapters
				.filter((c) => !chapterIdsToKeep.has(c.id))
				.map((c) => c.id);

			const scenesToDeleteIds: string[] = [];
			for (const ch of existingChapters) {
				if (chapterIdsToKeep.has(ch.id)) {
					const chScenes = dbScenesByChapter[ch.id] || [];
					for (const s of chScenes) {
						if (!sceneIdsToKeep.has(s.id)) {
							scenesToDeleteIds.push(s.id);
						}
					}
				}
			}

			await Promise.all([...updatePromises, ...insertPromises]);

			if (scenesToDeleteIds.length > 0) {
				await tx.delete(scene).where(inArray(scene.id, scenesToDeleteIds));
			}

			if (chaptersToDeleteIds.length > 0) {
				await tx
					.delete(scene)
					.where(inArray(scene.chapterId, chaptersToDeleteIds));
				await tx
					.delete(chapter)
					.where(inArray(chapter.id, chaptersToDeleteIds));
			}
		});

		await invalidateCache(`project-structure:${projectId}`);
		revalidatePath(`/projects/${projectId}`);

		return { success: true };
	},
});

// ============================================================================
// Helper Functions
// ============================================================================

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

interface ParsedChapter {
	title: string;
	sequence: number;
	scenes: { title: string; sequence: number }[];
}

function parseStructureText(text: string): ParsedChapter[] {
	const lines = text.split("\n");
	const chapters: ParsedChapter[] = [];
	let currentChapter: ParsedChapter | null = null;
	let chapterCount = 0;
	let sceneCount = 0;

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		const isChapter =
			trimmed.toLowerCase().startsWith("chapter") ||
			/^\d+\./.test(trimmed) ||
			(trimmed.endsWith(":") && !trimmed.toLowerCase().includes("scene"));

		if (isChapter) {
			chapterCount++;
			sceneCount = 0;
			const title =
				trimmed
					.replace(/^chapter\s*\d*[:.]?\s*/i, "")
					.replace(/^\d+\.\s*/, "")
					.replace(/:$/, "")
					.trim() || "Untitled Chapter";

			currentChapter = {
				title,
				sequence: chapterCount,
				scenes: [],
			};
			chapters.push(currentChapter);
		} else {
			if (!currentChapter) {
				chapterCount++;
				currentChapter = {
					title: "Prologue",
					sequence: chapterCount,
					scenes: [],
				};
				chapters.push(currentChapter);
			}

			sceneCount++;
			const title =
				trimmed
					.replace(/^[-*]\s*/, "")
					.replace(/^scene\s*\d*[:.]?\s*/i, "")
					.trim() || "Untitled Scene";

			currentChapter.scenes.push({
				title,
				sequence: sceneCount,
			});
		}
	}

	return chapters;
}
