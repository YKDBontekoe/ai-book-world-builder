import "server-only";
import { eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { BaseRepository } from "@/lib/db/repositories/base-repository";
import {
	type BookGeneration,
	bookGeneration,
	bookGenerationAsset,
	bookGenerationStep,
	chapterVersion,
	generationNote,
	storyState,
} from "@/lib/db/schema";
import { DatabaseError } from "@/lib/errors";

export class GenerationRepository extends BaseRepository<BookGeneration> {
	async findById(id: string): Promise<BookGeneration | null> {
		try {
			const [result] = await db
				.select()
				.from(bookGeneration)
				.where(eq(bookGeneration.id, id));
			return result ?? null;
		} catch (error) {
			console.error("GenerationRepository.findById error:", error);
			throw new DatabaseError("Failed to find generation");
		}
	}

	async findAll(): Promise<BookGeneration[]> {
		throw new Error("Method not implemented.");
	}

	async create(data: any): Promise<BookGeneration> {
		throw new Error("Method not implemented.");
	}

	async update(id: string, data: any): Promise<BookGeneration> {
		throw new Error("Method not implemented.");
	}

	async delete(id: string): Promise<void> {
		throw new Error("Use deleteByProjectIds for now.");
	}

	/**
	 * Deletes all generation data associated with the given project IDs.
	 * Can run within an existing transaction.
	 */
	async deleteByProjectIds(projectIds: string[], tx?: any) {
		const executor = tx || db;
		try {
			const generations = await executor
				.select({ id: bookGeneration.id })
				.from(bookGeneration)
				.where(inArray(bookGeneration.projectId, projectIds));

			const generationIds = generations.map((g: { id: string }) => g.id);

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
			throw new DatabaseError("Failed to delete generation data");
		}
	}
}

export const generationRepository = new GenerationRepository();
