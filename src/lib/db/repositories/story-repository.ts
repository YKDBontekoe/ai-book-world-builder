import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { createScene } from "@/lib/db/queries/scene";
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

			// 3. Create Chapters
			for (let i = 0; i < plan.chapters.length; i++) {
				const ch = plan.chapters[i];
				await tx.insert(chapter).values({
					projectId,
					volumeId: newVolume.id,
					outlineId: newOutline.id,
					title: ch.title,
					notes: ch.summary,
					sequence: i + 1,
					status: "planned",
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}

			// 4. Create Initial Scene for Chapter 1
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
		const createdIds: string[] = [];
		for (const data of scenesData) {
			const newScene = await createScene({
				projectId: projectId,
				chapterId,
				title: data.title,
				sequence: data.sequence,
				content: "", // Start empty
				status: "planned",
			});
			createdIds.push(newScene.id);
		}
		return createdIds;
	}

	async getSceneContextData(sceneId: string) {
		const [targetScene] = await db
			.select()
			.from(scene)
			.where(eq(scene.id, sceneId))
			.limit(1);
		if (!targetScene) throw new Error("Scene not found");

		const [targetChapter] = await db
			.select()
			.from(chapter)
			.where(eq(chapter.id, targetScene.chapterId))
			.limit(1);
		const [targetOutline] = await db
			.select()
			.from(outline)
			.where(eq(outline.id, targetChapter.outlineId))
			.limit(1);

		const scenes = await db
			.select()
			.from(scene)
			.where(eq(scene.chapterId, targetScene.chapterId))
			.orderBy(asc(scene.sequence));

		return {
			targetScene,
			targetChapter,
			targetOutline,
			scenesInChapter: scenes,
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
