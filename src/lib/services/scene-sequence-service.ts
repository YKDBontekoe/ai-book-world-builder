import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { type DbTransaction } from "@/lib/db";
import { scene } from "@/lib/db/schema";

/**
 * Service to manage the doubly-linked list structure of Scenes.
 *
 * Scenes in this application maintain their order via two mechanisms:
 * 1. `sequence` (integer): A simple index for fast sorting and retrieval.
 * 2. `prevSceneId` (UUID): A pointer to the previous scene, forming a linked list.
 *
 * The `sequence` is primary for UI rendering, while `prevSceneId` is crucial for
 * resolving merge conflicts and maintaining logical flow during complex reorders.
 */
export class SceneSequenceService {
	/**
	 * Prepares for inserting a new scene by calculating its sequence and prevSceneId.
	 *
	 * This method ensures that the new scene fits into the linked list correctly.
	 * If inserting in the middle, it atomically shifts the `sequence` of all subsequent
	 * scenes to make room.
	 *
	 * @param chapterId - The chapter ID where the scene belongs.
	 * @param insertAfterSceneId - Optional ID of the scene to insert after.
	 *                             If undefined, the scene is appended to the end.
	 * @param tx - The database transaction (REQUIRED to prevent race conditions).
	 * @returns Object containing the new `sequence` number and `prevSceneId`.
	 */
	async prepareInsertion(
		chapterId: string,
		insertAfterSceneId: string | undefined,
		tx: DbTransaction,
	): Promise<{ sequence: number; prevSceneId: string | undefined }> {
		let newSequence = 1;
		let prevSceneId: string | undefined;

		if (insertAfterSceneId) {
			const [insertAfterScene] = await tx
				.select()
				.from(scene)
				.where(eq(scene.id, insertAfterSceneId));

			if (insertAfterScene) {
				newSequence = insertAfterScene.sequence + 1;
				prevSceneId = insertAfterScene.id;

				// Shift subsequent scenes atomically
				await tx
					.update(scene)
					.set({
						sequence: sql`${scene.sequence} + 1`,
						updatedAt: new Date(),
					})
					.where(
						and(
							eq(scene.chapterId, chapterId),
							sql`${scene.sequence} >= ${newSequence}`,
						),
					);
			} else {
				// Fallback: if specified scene not found, append to end
				const [maxSeq] = await tx
					.select({ max: sql<number>`max(${scene.sequence})` })
					.from(scene)
					.where(eq(scene.chapterId, chapterId));
				newSequence = (maxSeq?.max ?? 0) + 1;
				// If appending, prevSceneId needs to be the last one
				if (newSequence > 1) {
					const [lastScene] = await tx
						.select()
						.from(scene)
						.where(
							and(
								eq(scene.chapterId, chapterId),
								eq(scene.sequence, newSequence - 1),
							),
						);
					prevSceneId = lastScene?.id;
				}
			}
		} else {
			// Append to end
			const [maxSeq] = await tx
				.select({ max: sql<number>`max(${scene.sequence})` })
				.from(scene)
				.where(eq(scene.chapterId, chapterId));

			newSequence = (maxSeq?.max ?? 0) + 1;

			if (newSequence > 1) {
				// Find the ID of the scene with sequence = newSequence - 1 to set as prevSceneId
				const [lastScene] = await tx
					.select()
					.from(scene)
					.where(
						and(
							eq(scene.chapterId, chapterId),
							eq(scene.sequence, newSequence - 1),
						),
					);
				prevSceneId = lastScene?.id;
			}
		}

		return { sequence: newSequence, prevSceneId };
	}

	/**
	 * Reorders scenes within a chapter in a single atomic operation.
	 *
	 * This uses a SQL `CASE` statement to update all affected rows in one query,
	 * preventing "flicker" and ensuring data consistency.
	 *
	 * @param chapterId - The chapter ID.
	 * @param sceneIds - The ordered list of all scene IDs in the chapter.
	 * @param tx - The database transaction.
	 */
	async reorderScenes(
		chapterId: string,
		sceneIds: string[],
		tx: DbTransaction,
	): Promise<void> {
		if (sceneIds.length === 0) return;

		// Update sequences using a single SQL UPDATE with CASE statement
		// This is much more performant than N individual UPDATE queries.
		const sqlChunks = [];
		sqlChunks.push(sql`(case`);
		for (let i = 0; i < sceneIds.length; i++) {
			sqlChunks.push(sql`when ${scene.id} = ${sceneIds[i]} then ${i + 1}`);
		}
		sqlChunks.push(sql`else ${scene.sequence} end)`);

		const finalSql = sql.join(sqlChunks, sql` `);

		await tx
			.update(scene)
			.set({ sequence: finalSql, updatedAt: new Date() })
			.where(and(eq(scene.chapterId, chapterId), inArray(scene.id, sceneIds)));
	}
}

export const sceneSequenceService = new SceneSequenceService();
