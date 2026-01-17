import "server-only";
import { inArray } from "drizzle-orm";
import type { DbTransaction } from "@/lib/db";
import {
	bookGeneration,
	bookGenerationAsset,
	bookGenerationStep,
	chapterVersion,
	generationNote,
	storyState,
} from "@/lib/db/schema";
import { DatabaseError } from "@/lib/errors";

export class GenerationRepository {
	/**
	 * Deletes all generation-related data for a set of projects.
	 * Returns true if successful, throws error otherwise.
	 */
	async deleteByProjectIds(tx: DbTransaction, projectIds: string[]) {
		try {
			// Find all generations linked to these projects
			const generations = await tx
				.select({ id: bookGeneration.id })
				.from(bookGeneration)
				.where(inArray(bookGeneration.projectId, projectIds));

			const generationIds = generations.map((g) => g.id);

			if (generationIds.length > 0) {
				await tx
					.delete(generationNote)
					.where(inArray(generationNote.generationId, generationIds));
				await tx
					.delete(bookGenerationAsset)
					.where(inArray(bookGenerationAsset.generationId, generationIds));
				await tx
					.delete(bookGenerationStep)
					.where(inArray(bookGenerationStep.generationId, generationIds));
				await tx
					.delete(storyState)
					.where(inArray(storyState.generationId, generationIds));
				await tx
					.delete(chapterVersion)
					.where(inArray(chapterVersion.generationId, generationIds));
			}

			// Delete generations themselves
			await tx
				.delete(bookGeneration)
				.where(inArray(bookGeneration.projectId, projectIds));
		} catch (error) {
			console.error("GenerationRepository.deleteByProjectIds error:", error);
			throw new DatabaseError("Failed to delete generation data");
		}
	}
}

export const generationRepository = new GenerationRepository();
