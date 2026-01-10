import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chapter, outline, scene, volume } from "@/lib/db/schema";
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
		return await db.transaction(async (tx) => {
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

		return createdScenes.map((s) => s.id);
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
}

export const storyRepository = new StoryRepository();
