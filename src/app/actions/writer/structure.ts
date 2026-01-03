"use server";

import { asc, eq, inArray } from "drizzle-orm";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { getCached, invalidateCache } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { sceneRepository } from "@/lib/db/repositories";
import {
	type Scene,
	chapter,
	outline,
	scene,
	volume,
} from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

		// Simple regex-based parsing matching the format logic in UI
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
			// Assume Scene
			if (!currentChapter) {
				// Implicit first chapter if text starts with scenes
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

const structureSchema = z.string().trim().min(1, "Structure text cannot be empty");

export async function saveProjectStructure(
	projectId: string,
	structureText: string,
) {
	try {
		// 1. Validation
		const validation = structureSchema.safeParse(structureText);
		if (!validation.success) {
			return { success: false, error: validation.error.message };
		}
		const validText = validation.data;

		// 2. Verify Access (Write)
		await ensureProjectAccess(projectId, true);

		// 3. Parse Text
		const newStructure = parseStructureText(validText);

		// 4. Sync with DB (Smart Sync)
		// Strategy:
		// - Match Chapters by Title (normalized) to preserve IDs.
		// - If unmatched, Create new Chapter.
		// - If DB Chapter not in Text, Delete it (and its scenes).
		// - Within matched Chapter, Match Scenes by Title.
		// - If unmatched, Create new Scene.
		// - If DB Scene not in Text, Delete it.

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

			// Helper to normalize titles for matching: Lowercase, collapse whitespace, strip diacritics
			const normalize = (s: string) =>
				s.toLowerCase()
				 .normalize("NFKD")
				 .replace(/[\u0300-\u036f]/g, "")
				 .replace(/\s+/g, " ")
				 .trim();

			// Prepare Outline/Volume IDs (Assuming single default Outline/Volume for now)
			// In a real app, we might need to fetch or create them.
			// For this "Simple" structure editor, we assume they exist or we reuse the first one.
			let outlineId = existingChapters[0]?.outlineId;
			let volumeId = existingChapters[0]?.volumeId;

			if (!outlineId || !volumeId) {
				// Fetch existing or create default
				const outlines = await tx
					.select()
					.from(outline)
					.where(eq(outline.projectId, projectId))
					.limit(1);
				if (outlines.length > 0) {
					outlineId = outlines[0].id;
					// Fetch volume
					const volumes = await tx
						.select()
						.from(volume)
						.where(eq(volume.outlineId, outlineId))
						.limit(1);
					if (volumes.length > 0) {
						volumeId = volumes[0].id;
					} else {
						// Create default volume
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
					// Create default outline and volume
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

			// Track IDs to KEEP (matched). All others will be deleted.
			const chapterIdsToKeep = new Set<string>();
			const sceneIdsToKeep = new Set<string>();

			// Batching Promises for Parallel Execution
			const updatePromises: Promise<unknown>[] = [];
			const insertPromises: Promise<unknown>[] = [];

			// B. Process Chapters
			for (const newCh of newStructure) {
				// Try to find match by Title
				const match = existingChapters.find(
					(c) =>
						normalize(c.title) === normalize(newCh.title) &&
						!chapterIdsToKeep.has(c.id),
				);

				let currentChapterId: string;
				let isNewChapter = false;

				if (match) {
					// Update existing
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
						.where(eq(chapter.id, match.id))
					);
				} else {
					// Create new (must await to get ID for scenes)
					// We cannot batch this easily if we need the ID for child scenes immediately.
					// So we keep this sequential for inserts.
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
				const existingChScenes = !isNewChapter && match ? dbScenesByChapter[match.id] || [] : [];

				for (const newSc of newCh.scenes) {
					// Try to find match by Title within this Chapter
					const scMatch = existingChScenes.find(
						(s) =>
							normalize(s.title) === normalize(newSc.title) &&
							!sceneIdsToKeep.has(s.id),
					);

					if (scMatch) {
						// Update
						sceneIdsToKeep.add(scMatch.id);
						updatePromises.push(
							tx
							.update(scene)
							.set({
								sequence: newSc.sequence,
								updatedAt: new Date(),
								title: newSc.title,
								chapterId: currentChapterId, // Should be same
							})
							.where(eq(scene.id, scMatch.id))
						);
					} else {
						// Create new
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
							})
						);
					}
				}
			}

			// D. Cleanup (Delete unmatched)
			// Delete Scenes first
			const chaptersToDelete = existingChapters.filter(
				(c) => !chapterIdsToKeep.has(c.id),
			);
			const chaptersToDeleteIds = chaptersToDelete.map((c) => c.id);

			// Find scenes that are in matched chapters but weren't kept (deleted from text)
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

			// Wait for all updates and inserts (inserts that didn't need parent ID wait)
			await Promise.all([...updatePromises, ...insertPromises]);

			// We also need to delete scenes belonging to deleted chapters (cascade usually handles this, but explicit is safer)
			if (scenesToDeleteIds.length > 0) {
				await tx.delete(scene).where(inArray(scene.id, scenesToDeleteIds));
			}

			if (chaptersToDeleteIds.length > 0) {
				// Delete scenes of these chapters first if no cascade
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
	} catch (error) {
		console.error("Failed to save project structure", error);
		if (error instanceof z.ZodError) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to save structure" };
	}
}
