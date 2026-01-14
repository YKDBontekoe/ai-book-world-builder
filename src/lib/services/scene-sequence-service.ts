import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { type DbTransaction, db } from "@/lib/db";
import { scene } from "@/lib/db/schema";

export class SceneSequenceService {
	/**
	 * Prepares for inserting a new scene by calculating its sequence and prevSceneId,
	 * and shifting subsequent scenes if necessary.
	 *
	 * @param chapterId - The chapter ID.
	 * @param insertAfterSceneId - Optional ID of the scene to insert after. If not provided, appends to the end.
	 * @param tx - The database transaction.
	 * @returns Object containing the new sequence and prevSceneId.
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
                     const [lastScene] = await tx.select().from(scene).where(and(eq(scene.chapterId, chapterId), eq(scene.sequence, newSequence - 1)));
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
	 * Reorders scenes within a chapter.
	 */
	async reorderScenes(
		chapterId: string,
		sceneIds: string[],
		tx: DbTransaction,
	): Promise<void> {
		if (sceneIds.length === 0) return;

		// Update sequences using a single SQL UPDATE with CASE statement
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
