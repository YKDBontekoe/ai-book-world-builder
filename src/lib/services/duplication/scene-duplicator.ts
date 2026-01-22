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
	): Promise<void> {
		const limit = 50;
		let offset = 0;
		let hasMore = true;

		// Fetch and insert in batches, building the map as we go
		while (hasMore) {
			const batch = (await this.tx
				.select()
				.from(scene)
				.where(eq(scene.projectId, originalProjectId))
				.limit(limit)
				.offset(offset)) as SceneRow[];

			if (batch.length === 0) {
				hasMore = false;
				break;
			}

			// Refined Single-Pass Strategy:
			// Iterate batch.
			// For each scene:
			// 1. Ensure IT has a new ID (check map, if not, generate).
			// 2. Ensure its PREV has a new ID (check map, if not, generate).
			// 3. Insert.

			const currentBatchInserts = [];
			for (const old of batch) {
				const newChapterId = chapterIdMap.get(old.chapterId);
				if (newChapterId) {
					// 1. Ensure current scene ID
					if (!sceneIdMap.has(old.id)) {
						sceneIdMap.set(old.id, crypto.randomUUID());
					}
					const newId = sceneIdMap.get(old.id);

					// 2. Resolve prevSceneId
					let newPrevId = null;
					if (old.prevSceneId) {
						if (!sceneIdMap.has(old.prevSceneId)) {
							sceneIdMap.set(old.prevSceneId, crypto.randomUUID());
						}
						newPrevId = sceneIdMap.get(old.prevSceneId) ?? null;
					}

					const { id: _id, ...data } = old;
					currentBatchInserts.push({
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

			if (currentBatchInserts.length > 0) {
				await chunkedInsert(this.tx, scene, currentBatchInserts);
			}
			offset += limit;
		}
	}

	async cloneSceneCards(
		originalProjectId: string,
		newProjectId: string,
		sceneIdMap: Map<string, string>,
	): Promise<void> {
		const oldSceneCards = (await this.tx
			.select()
			.from(sceneCard)
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
