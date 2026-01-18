import "server-only";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
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
	 * Delete all generation data for multiple projects
	 */
	async deleteByProjectIds(projectIds: string[], tx?: any): Promise<void> {
		if (projectIds.length === 0) return;
		const executor = tx || db;

		try {
			// Find generation IDs first to delete cascaded data
			const generations = await executor
				.select({ id: bookGeneration.id })
				.from(bookGeneration)
				.where(inArray(bookGeneration.projectId, projectIds));

			const generationIds = generations.map((g: any) => g.id);

			if (generationIds.length > 0) {
				await executor
					.delete(generationNote)
					.where(inArray(generationNote.generationId, generationIds));
				await executor
					.delete(bookGenerationAsset)
					.where(inArray(bookGenerationAsset.generationId, generationIds));
				await executor
					.delete(bookGenerationStep)
					.where(inArray(bookGenerationStep.generationId, generationIds));
				await executor
					.delete(storyState)
					.where(inArray(storyState.generationId, generationIds));
				await executor
					.delete(chapterVersion)
					.where(inArray(chapterVersion.generationId, generationIds));
			}

			// Delete generations
			await executor
				.delete(bookGeneration)
				.where(inArray(bookGeneration.projectId, projectIds));
		} catch (error) {
			console.error("GenerationRepository.deleteByProjectIds error:", error);
			throw new DatabaseError("Failed to delete project generations");
		}
	}
}

export const generationRepository = new GenerationRepository();
