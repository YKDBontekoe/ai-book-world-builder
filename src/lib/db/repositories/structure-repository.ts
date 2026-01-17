import "server-only";
import { inArray } from "drizzle-orm";
import type { DbTransaction } from "@/lib/db";
import {
	bookExport,
	chapter,
	chapterDraft,
	outline,
	scene,
	sceneCard,
	volume,
} from "@/lib/db/schema";
import { DatabaseError } from "@/lib/errors";

export class StructureRepository {
	/**
	 * Deletes all structure-related data (scenes, chapters, volumes, outlines, exports) for a set of projects.
	 */
	async deleteByProjectIds(tx: DbTransaction, projectIds: string[]) {
		try {
			// 1. Book Exports
			await tx
				.delete(bookExport)
				.where(inArray(bookExport.projectId, projectIds));

			// 2. Scene Cards
			await tx
				.delete(sceneCard)
				.where(inArray(sceneCard.projectId, projectIds));

			// 3. Scenes
			await tx.delete(scene).where(inArray(scene.projectId, projectIds));

			// 4. Chapter Drafts
			await tx
				.delete(chapterDraft)
				.where(inArray(chapterDraft.projectId, projectIds));

			// 5. Chapters
			await tx.delete(chapter).where(inArray(chapter.projectId, projectIds));

			// 6. Volumes
			await tx.delete(volume).where(inArray(volume.projectId, projectIds));

			// 7. Outlines
			await tx.delete(outline).where(inArray(outline.projectId, projectIds));
		} catch (error) {
			console.error("StructureRepository.deleteByProjectIds error:", error);
			throw new DatabaseError("Failed to delete structure data");
		}
	}
}

export const structureRepository = new StructureRepository();
