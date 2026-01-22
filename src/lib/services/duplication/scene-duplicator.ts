import { eq, type InferSelectModel } from "drizzle-orm";

import type { DbTransaction } from "@/lib/db";
import { scene, sceneCard } from "@/lib/db/schema";
import { chunkedInsert } from "./utils";

type SceneRow = InferSelectModel<typeof scene>;
type SceneCardRow = InferSelectModel<typeof sceneCard>;

export class SceneDuplicator {
	constructor(private tx: DbTransaction) {}

	async cloneScenes(
		originalProjectId: string,
		newProjectId: string,
		chapterIdMap: Map<string, string>,
		sceneIdMap: Map<string, string>,
	) {
		const limit = 50;
		let offset = 0;
		let hasMore = true;

		// 1. Light fetch for ID Mapping
		const allSceneMeta = (await this.tx
			.select()
			.from(scene as any)
			.where(eq(scene.projectId, originalProjectId))) as SceneRow[];

		for (const meta of allSceneMeta) {
			sceneIdMap.set(meta.id, crypto.randomUUID());
		}

		// 2. Heavy fetch and insert in batches
		while (hasMore) {
			const batch = (await this.tx
				.select()
				.from(scene as any)
				.where(eq(scene.projectId, originalProjectId))
				.limit(limit)
				.offset(offset)) as SceneRow[];

			if (batch.length === 0) {
				hasMore = false;
				break;
			}

			const newScenesToInsert = [];
			for (const old of batch) {
				const newChapterId = chapterIdMap.get(old.chapterId);
				if (newChapterId) {
					const newId = sceneIdMap.get(old.id);
					// Resolve prevSceneId using the pre-filled map
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
				await chunkedInsert(this.tx, scene, newScenesToInsert);
			}
			offset += limit;
		}
	}

	async cloneSceneCards(
		originalProjectId: string,
		newProjectId: string,
		sceneIdMap: Map<string, string>,
	) {
		const oldSceneCards = (await this.tx
			.select()
			.from(sceneCard as any)
			.where(eq(sceneCard.projectId, originalProjectId))) as SceneCardRow[];

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
				await chunkedInsert(this.tx, sceneCard, newSceneCards);
			}
		}
	}
}
