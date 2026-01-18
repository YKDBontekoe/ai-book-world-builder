import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { type DbTransaction, db } from "@/lib/db";
import {
	chapter,
	chapterDraft,
	outline,
	scene,
	sceneCard,
	volume,
} from "@/lib/db/schema";
import type {
	BookPlan,
	StoryStyle,
} from "@/lib/services/schemas/story-schemas";

// Helper for chunked inserts
async function chunkedInsert<T extends Record<string, unknown>, TTable>(
	tx: any,
	table: TTable,
	items: T[],
	chunkSize = 1000,
) {
	for (let i = 0; i < items.length; i += chunkSize) {
		const chunk = items.slice(i, i + chunkSize);
		await tx.insert(table).values(chunk);
	}
}

export class StoryRepository {
	/**
	 * Transactional creation of the book structure (Outline -> Volume -> Chapters -> Initial Scene)
	 */
	async createBookFromPlan(
		projectId: string,
		plan: BookPlan,
		style?: StoryStyle,
	) {
		return await db.transaction(async (tx: DbTransaction) => {
			// 1. Create Outline
			const [newOutline] = await tx
				.insert(outline)
				.values({
					projectId,
					title: plan.title,
					summary: plan.summary,
					pov: style?.pov || "Third Person",
					tone: style?.tone || "Neutral",
					pacing: "Moderate",
					beats: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			// 2. Create Volume
			const [newVolume] = await tx
				.insert(volume)
				.values({
					projectId,
					outlineId: newOutline.id,
					title: "Volume 1",
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			// 3. Create Chapters (Batch Insert)
			const chaptersToInsert = plan.chapters.map((ch, i) => ({
				projectId,
				volumeId: newVolume.id,
				outlineId: newOutline.id,
				title: ch.title,
				notes: ch.summary,
				sequence: i + 1,
				status: "planned" as const, // Explicit cast to match enum if needed, or inferred string
				createdAt: new Date(),
				updatedAt: new Date(),
			}));

			if (chaptersToInsert.length > 0) {
				await tx.insert(chapter).values(chaptersToInsert);
			}

			// 4. Create Initial Scene for Chapter 1
			// We need to fetch the ID of the first chapter created.
			// Since we did a batch insert without returning (some drivers don't support returning all on batch easily, or we want to keep it simple),
			// we can query it back or use returning().
			// Drizzle supports returning() on batch inserts in Postgres.
			// Let's optimize step 3 to return IDs or just fetch Chapter 1 as before.
			// Since sequence is deterministic (1), fetching is safe and robust.

			const [chapter1] = await tx
				.select()
				.from(chapter)
				.where(eq(chapter.volumeId, newVolume.id))
				.orderBy(asc(chapter.sequence))
				.limit(1);

			if (chapter1) {
				await tx.insert(scene).values({
					projectId,
					chapterId: chapter1.id,
					title: "Scene 1",
					sequence: 1,
					content: "",
					status: "drafting",
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}

			return { outlineId: newOutline.id, volumeId: newVolume.id };
		});
	}

	async getChapterWithScenes(chapterId: string) {
		const [targetChapter] = await db
			.select()
			.from(chapter)
			.where(eq(chapter.id, chapterId))
			.limit(1);

		if (!targetChapter) throw new Error("Chapter not found");

		return targetChapter;
	}

	async getLastSceneInChapter(chapterId: string) {
		const [lastScene] = await db
			.select()
			.from(scene)
			.where(eq(scene.chapterId, chapterId))
			.orderBy(desc(scene.sequence))
			.limit(1);
		return lastScene;
	}

	async createScenesBatch(
		projectId: string,
		chapterId: string,
		scenesData: { title: string; sequence: number }[],
	) {
		if (scenesData.length === 0) return [];

		const scenesToInsert = scenesData.map((data) => ({
			projectId,
			chapterId,
			title: data.title,
			sequence: data.sequence,
			content: "",
			status: "planned" as const,
			createdAt: new Date(),
			updatedAt: new Date(),
		}));

		const createdScenes = await db
			.insert(scene)
			.values(scenesToInsert)
			.returning({ id: scene.id });

		return createdScenes.map((s: { id: string }) => s.id);
	}

	async getSceneContextData(sceneId: string) {
		const [targetScene] = await db
			.select()
			.from(scene)
			.where(eq(scene.id, sceneId))
			.limit(1);
		if (!targetScene) throw new Error("Scene not found");

		// Parallelize independent fetches
		const [targetChapterResult, scenesInChapter] = await Promise.all([
			db
				.select()
				.from(chapter)
				.where(eq(chapter.id, targetScene.chapterId))
				.limit(1),
			db
				.select()
				.from(scene)
				.where(eq(scene.chapterId, targetScene.chapterId))
				.orderBy(asc(scene.sequence)),
		]);

		const targetChapter = targetChapterResult[0];
		if (!targetChapter) throw new Error("Chapter not found");

		const [targetOutline] = await db
			.select()
			.from(outline)
			.where(eq(outline.id, targetChapter.outlineId))
			.limit(1);

		return {
			targetScene,
			targetChapter,
			targetOutline,
			scenesInChapter,
		};
	}

	async updateSceneContent(sceneId: string, content: string) {
		await db
			.update(scene)
			.set({
				content: content,
				status: "drafting",
				updatedAt: new Date(),
			})
			.where(eq(scene.id, sceneId));
	}

	/**
	 * Delete all structure data for multiple projects
	 */
	async deleteStructureByProjectIds(
		projectIds: string[],
		tx?: any,
	): Promise<void> {
		if (projectIds.length === 0) return;
		const executor = tx || db;

		await executor
			.delete(sceneCard)
			.where(inArray(sceneCard.projectId, projectIds));
		await executor.delete(scene).where(inArray(scene.projectId, projectIds));
		await executor
			.delete(chapterDraft)
			.where(inArray(chapterDraft.projectId, projectIds));
		await executor
			.delete(chapter)
			.where(inArray(chapter.projectId, projectIds));
		await executor.delete(volume).where(inArray(volume.projectId, projectIds));
		await executor.delete(outline).where(inArray(outline.projectId, projectIds));
	}

	/**
	 * Duplicate entire book structure for a new project.
	 * Handles Outlines, Volumes, Chapters, Drafts, Scenes, and Scene Cards.
	 */
	async duplicateStructureForProject(
		originalProjectId: string,
		newProjectId: string,
		tx?: any,
	): Promise<void> {
		const executor = tx || db;
		const outlineIdMap = new Map<string, string>();
		const volumeIdMap = new Map<string, string>();
		const chapterIdMap = new Map<string, string>();
		const sceneIdMap = new Map<string, string>();

		// 1. Clone Outlines
		const oldOutlines = await executor
			.select()
			.from(outline)
			.where(eq(outline.projectId, originalProjectId));

		if (oldOutlines.length > 0) {
			const newOutlines = oldOutlines.map((old: any) => {
				const newId = crypto.randomUUID();
				outlineIdMap.set(old.id, newId);
				const { id: _id, ...data } = old;
				return {
					...data,
					id: newId,
					projectId: newProjectId,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
			});
			await chunkedInsert(executor, outline, newOutlines);
		}

		// 2. Clone Volumes
		const oldVolumes = await executor
			.select()
			.from(volume)
			.where(eq(volume.projectId, originalProjectId));

		if (oldVolumes.length > 0) {
			const newVolumes = [];
			for (const old of oldVolumes) {
				const newOutlineId = outlineIdMap.get(old.outlineId);
				if (newOutlineId) {
					const newId = crypto.randomUUID();
					volumeIdMap.set(old.id, newId);
					const { id: _id, ...data } = old;
					newVolumes.push({
						...data,
						id: newId,
						outlineId: newOutlineId,
						projectId: newProjectId,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}
			}
			if (newVolumes.length > 0) {
				await chunkedInsert(executor, volume, newVolumes);
			}
		}

		// 3. Clone Chapters
		const oldChapters = await executor
			.select()
			.from(chapter)
			.where(eq(chapter.projectId, originalProjectId));

		if (oldChapters.length > 0) {
			const newChapters = [];
			for (const old of oldChapters) {
				const newVolumeId = volumeIdMap.get(old.volumeId);
				const newOutlineId = outlineIdMap.get(old.outlineId);
				if (newVolumeId && newOutlineId) {
					const newId = crypto.randomUUID();
					chapterIdMap.set(old.id, newId);
					const { id: _id, ...data } = old;
					newChapters.push({
						...data,
						id: newId,
						volumeId: newVolumeId,
						outlineId: newOutlineId,
						projectId: newProjectId,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}
			}
			if (newChapters.length > 0) {
				await chunkedInsert(executor, chapter, newChapters);
			}
		}

		// 4. Clone Chapter Drafts
		const oldChapterDrafts = await executor
			.select()
			.from(chapterDraft)
			.where(eq(chapterDraft.projectId, originalProjectId));

		if (oldChapterDrafts.length > 0) {
			const newDrafts = [];
			for (const old of oldChapterDrafts) {
				const newChapterId = chapterIdMap.get(old.chapterId);
				const newVolumeId = volumeIdMap.get(old.volumeId);
				const newOutlineId = outlineIdMap.get(old.outlineId);
				if (newChapterId && newVolumeId && newOutlineId) {
					const { id: _id, ...data } = old;
					newDrafts.push({
						...data,
						id: crypto.randomUUID(),
						chapterId: newChapterId,
						volumeId: newVolumeId,
						outlineId: newOutlineId,
						projectId: newProjectId,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}
			}
			if (newDrafts.length > 0) {
				await chunkedInsert(executor, chapterDraft, newDrafts);
			}
		}

		// 5. Clone Scenes (Two-Pass)
		// Pass 1: ID Mapping
		const allSceneMeta = await executor
			.select({
				id: scene.id,
			})
			.from(scene)
			.where(eq(scene.projectId, originalProjectId));

		for (const meta of allSceneMeta) {
			sceneIdMap.set(meta.id, crypto.randomUUID());
		}

		// Pass 2: Insert
		const limit = 50;
		let offset = 0;
		let hasMore = true;

		while (hasMore) {
			const batch = await executor
				.select()
				.from(scene)
				.where(eq(scene.projectId, originalProjectId))
				.limit(limit)
				.offset(offset);

			if (batch.length === 0) {
				hasMore = false;
				break;
			}

			const newScenesToInsert = [];
			for (const old of batch) {
				const newChapterId = chapterIdMap.get(old.chapterId);
				if (newChapterId) {
					const newId = sceneIdMap.get(old.id);
					const newPrevId = old.prevSceneId
						? (sceneIdMap.get(old.prevSceneId) ?? null)
						: null;

					const { id: _id, ...data } = old;
					newScenesToInsert.push({
						...data,
						id: newId,
						chapterId: newChapterId,
						prevSceneId: newPrevId,
						projectId: newProjectId,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}
			}

			if (newScenesToInsert.length > 0) {
				await chunkedInsert(executor, scene, newScenesToInsert);
			}
			offset += limit;
		}

		// 6. Clone Scene Cards
		const oldSceneCards = await executor
			.select()
			.from(sceneCard)
			.where(eq(sceneCard.projectId, originalProjectId));

		if (oldSceneCards.length > 0) {
			const newSceneCards = [];
			for (const old of oldSceneCards) {
				const newSceneId = sceneIdMap.get(old.sceneId);
				if (newSceneId) {
					const { id: _id, ...data } = old;
					newSceneCards.push({
						...data,
						id: crypto.randomUUID(),
						sceneId: newSceneId,
						projectId: newProjectId,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}
			}
			if (newSceneCards.length > 0) {
				await chunkedInsert(executor, sceneCard, newSceneCards);
			}
		}
	}
}

export const storyRepository = new StoryRepository();
