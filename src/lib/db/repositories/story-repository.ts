import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { type DbTransaction, db } from "@/lib/db";
import {
	chapter,
	chapterDraft,
	outline,
	scene,
	sceneCard,
	volume,
} from "@/lib/db/schema";
import { DatabaseError } from "@/lib/errors";
import type {
	BookPlan,
	StoryStyle,
} from "@/lib/services/schemas/story-schemas";

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

	async updateSceneContent(
		sceneId: string,
		content: string,
		projectId?: string,
	) {
		const updated = await db
			.update(scene)
			.set({
				content: content,
				status: "drafting",
				updatedAt: new Date(),
			})
			.where(
				projectId
					? and(eq(scene.id, sceneId), eq(scene.projectId, projectId))
					: eq(scene.id, sceneId),
			)
			.returning({ id: scene.id });

		if (updated.length === 0) {
			throw new Error("Scene not found or access denied");
		}
	}

	/**
	 * Deletes all story structure data for the given projects.
	 * Can run within an existing transaction.
	 */
	async deleteByProjectIds(projectIds: string[], tx?: any) {
		const executor = tx || db;
		try {
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
			await executor
				.delete(volume)
				.where(inArray(volume.projectId, projectIds));
			await executor
				.delete(outline)
				.where(inArray(outline.projectId, projectIds));
		} catch (error) {
			console.error("StoryRepository.deleteByProjectIds error:", error);
			throw new DatabaseError("Failed to delete story data");
		}
	}
}

export const storyRepository = new StoryRepository();
