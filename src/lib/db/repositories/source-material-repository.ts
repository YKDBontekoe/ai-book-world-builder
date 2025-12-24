import "server-only";
import { and, asc, count, eq, inArray, isNull, lte, or } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import {
	type NewSourceMaterialChapter,
	type NewSourceMaterialChunk,
	project,
	type SourceMaterial,
	type SourceMaterialChapter,
	type SourceMaterialChunk,
	type SourceMaterialProcessing,
	type SourceMaterialStatus,
	sourceMaterial,
	sourceMaterialChapter,
	sourceMaterialChunk,
	sourceMaterialProcessing,
} from "@/lib/db/schema";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import { BaseRepository, type FindOptions } from "./base-repository";

// ============================================================================
// Types
// ============================================================================

export interface CreateSourceMaterialInput {
	blobUrl?: string | null;
	filename: string;
	mimeType: string;
	projectId: string;
	size: number;
	status: SourceMaterialStatus;
	userId: string;
}

export interface UpdateSourceMaterialInput {
	blobUrl?: string | null;
	status?: SourceMaterialStatus;
}

export type SourceMaterialWithProcessing = {
	material: SourceMaterial;
	processing: SourceMaterialProcessing | null;
};

export interface UpsertProcessingInput {
	attempts?: number;
	bytesProcessed?: number;
	chapters?: number;
	chunks?: number;
	completedAt?: Date | null;
	durationMs?: number;
	lastError?: string | null;
	metadata?: Record<string, unknown> | null;
	nextAttemptAt?: Date;
	normalizedCharacters?: number;
	projectId: string;
	sourceMaterialId: string;
	startedAt?: Date | null;
	status?: SourceMaterialStatus;
	userId: string;
}

export interface ExtractionInput {
	chapters: NewSourceMaterialChapter[];
	chunks: NewSourceMaterialChunk[];
	materialId: string;
	projectId: string;
	userId: string;
}

// ============================================================================
// Repository Implementation
// ============================================================================

export class SourceMaterialRepository extends BaseRepository<
	SourceMaterial,
	CreateSourceMaterialInput,
	UpdateSourceMaterialInput
> {
	/**
	 * Find a source material by ID
	 */
	async findById(id: string): Promise<SourceMaterial | null> {
		try {
			const [result] = await db
				.select()
				.from(sourceMaterial)
				.where(eq(sourceMaterial.id, id));
			return result ?? null;
		} catch (error) {
			console.error("SourceMaterialRepository.findById error:", error);
			throw new DatabaseError("Failed to find source material");
		}
	}

	/**
	 * Find source material by ID with processing status
	 */
	async findByIdWithProcessing(
		id: string,
	): Promise<SourceMaterialWithProcessing | null> {
		try {
			const [result] = await db
				.select({
					material: sourceMaterial,
					processing: sourceMaterialProcessing,
				})
				.from(sourceMaterial)
				.leftJoin(
					sourceMaterialProcessing,
					eq(sourceMaterialProcessing.sourceMaterialId, sourceMaterial.id),
				)
				.where(eq(sourceMaterial.id, id));

			return result ?? null;
		} catch (error) {
			console.error(
				"SourceMaterialRepository.findByIdWithProcessing error:",
				error,
			);
			throw new DatabaseError("Failed to load source material");
		}
	}

	/**
	 * Find all source materials
	 */
	async findAll(_options?: FindOptions): Promise<SourceMaterial[]> {
		try {
			return await db
				.select()
				.from(sourceMaterial)
				.orderBy(asc(sourceMaterial.createdAt));
		} catch (error) {
			console.error("SourceMaterialRepository.findAll error:", error);
			throw new DatabaseError("Failed to list source materials");
		}
	}

	/**
	 * Find source materials by user with processing status
	 */
	async findByUserWithProcessing(userId: string): Promise<
		Array<
			SourceMaterial & {
				projectName: string;
				processingStatus: SourceMaterialProcessing | null;
			}
		>
	> {
		try {
			const results = await db
				.select({
					material: sourceMaterial,
					processing: sourceMaterialProcessing,
					projectName: project.name,
				})
				.from(sourceMaterial)
				.leftJoin(
					sourceMaterialProcessing,
					eq(sourceMaterialProcessing.sourceMaterialId, sourceMaterial.id),
				)
				.innerJoin(project, eq(project.id, sourceMaterial.projectId))
				.where(eq(sourceMaterial.userId, userId))
				.orderBy(asc(sourceMaterial.createdAt));

			return results.map((r) => ({
				...r.material,
				projectName: r.projectName,
				processingStatus: r.processing,
			}));
		} catch (error) {
			console.error(
				"SourceMaterialRepository.findByUserWithProcessing error:",
				error,
			);
			throw new DatabaseError("Failed to load source materials");
		}
	}

	/**
	 * Find source materials ready for processing
	 */
	async findReadyForProcessing(
		limit: number,
		now?: Date,
	): Promise<SourceMaterialWithProcessing[]> {
		const currentDate = now ?? new Date();

		try {
			return await db
				.select({
					material: sourceMaterial,
					processing: sourceMaterialProcessing,
				})
				.from(sourceMaterial)
				.leftJoin(
					sourceMaterialProcessing,
					eq(sourceMaterialProcessing.sourceMaterialId, sourceMaterial.id),
				)
				.where(
					and(
						inArray(sourceMaterial.status, [
							"uploaded",
							"processing",
						] as SourceMaterialStatus[]),
						or(
							isNull(sourceMaterialProcessing.nextAttemptAt),
							lte(sourceMaterialProcessing.nextAttemptAt, currentDate),
							isNull(sourceMaterialProcessing.id),
						),
					),
				)
				.orderBy(asc(sourceMaterial.createdAt))
				.limit(limit);
		} catch (error) {
			console.error(
				"SourceMaterialRepository.findReadyForProcessing error:",
				error,
			);
			throw new DatabaseError("Failed to load source materials for processing");
		}
	}

	/**
	 * Create a new source material
	 */
	async create(data: CreateSourceMaterialInput): Promise<SourceMaterial> {
		try {
			const [created] = await db
				.insert(sourceMaterial)
				.values({
					...data,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			return created;
		} catch (error) {
			console.error("SourceMaterialRepository.create error:", error);
			throw new DatabaseError("Failed to create source material");
		}
	}

	/**
	 * Update an existing source material
	 */
	async update(
		id: string,
		data: UpdateSourceMaterialInput,
	): Promise<SourceMaterial> {
		try {
			const [updated] = await db
				.update(sourceMaterial)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(sourceMaterial.id, id))
				.returning();

			if (!updated) {
				throw NotFoundError.forResource("SourceMaterial", id);
			}

			return updated;
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			console.error("SourceMaterialRepository.update error:", error);
			throw new DatabaseError("Failed to update source material");
		}
	}

	/**
	 * Delete a source material by ID
	 */
	async delete(id: string): Promise<void> {
		try {
			await db
				.delete(sourceMaterialChunk)
				.where(eq(sourceMaterialChunk.sourceMaterialId, id));
			await db
				.delete(sourceMaterialChapter)
				.where(eq(sourceMaterialChapter.sourceMaterialId, id));
			await db
				.delete(sourceMaterialProcessing)
				.where(eq(sourceMaterialProcessing.sourceMaterialId, id));
			await db.delete(sourceMaterial).where(eq(sourceMaterial.id, id));
		} catch (error) {
			console.error("SourceMaterialRepository.delete error:", error);
			throw new DatabaseError("Failed to delete source material");
		}
	}

	// ============================================================================
	// Processing Operations
	// ============================================================================

	/**
	 * Upsert processing record
	 */
	async upsertProcessing(
		data: UpsertProcessingInput,
	): Promise<SourceMaterialProcessing> {
		try {
			const now = new Date();

			return await db.transaction(async (tx) => {
				const [existing] = await tx
					.select()
					.from(sourceMaterialProcessing)
					.where(
						eq(
							sourceMaterialProcessing.sourceMaterialId,
							data.sourceMaterialId,
						),
					)
					.limit(1);

				if (existing) {
					const [updated] = await tx
						.update(sourceMaterialProcessing)
						.set({
							attempts: data.attempts ?? existing.attempts,
							bytesProcessed: data.bytesProcessed ?? existing.bytesProcessed,
							chapters: data.chapters ?? existing.chapters,
							chunks: data.chunks ?? existing.chunks,
							completedAt: data.completedAt ?? existing.completedAt,
							durationMs: data.durationMs ?? existing.durationMs,
							lastError: data.lastError ?? existing.lastError,
							metadata: data.metadata ?? existing.metadata,
							nextAttemptAt: data.nextAttemptAt ?? existing.nextAttemptAt,
							normalizedCharacters:
								data.normalizedCharacters ?? existing.normalizedCharacters,
							startedAt: data.startedAt ?? existing.startedAt,
							status: data.status ?? existing.status,
							updatedAt: now,
						})
						.where(eq(sourceMaterialProcessing.id, existing.id))
						.returning();

					return updated;
				}

				const [inserted] = await tx
					.insert(sourceMaterialProcessing)
					.values({
						attempts: data.attempts ?? 0,
						bytesProcessed: data.bytesProcessed ?? 0,
						chapters: data.chapters ?? 0,
						chunks: data.chunks ?? 0,
						completedAt: data.completedAt ?? null,
						createdAt: now,
						durationMs: data.durationMs ?? 0,
						lastError: data.lastError ?? null,
						metadata: data.metadata ?? null,
						nextAttemptAt: data.nextAttemptAt ?? now,
						normalizedCharacters: data.normalizedCharacters ?? 0,
						projectId: data.projectId,
						sourceMaterialId: data.sourceMaterialId,
						startedAt: data.startedAt ?? null,
						status: data.status ?? "pending",
						updatedAt: now,
						userId: data.userId,
					})
					.returning();

				return inserted;
			});
		} catch (error) {
			console.error("SourceMaterialRepository.upsertProcessing error:", error);
			throw new DatabaseError("Failed to upsert processing record");
		}
	}

	/**
	 * Update processing record
	 */
	async updateProcessing(
		sourceMaterialId: string,
		updates: Partial<SourceMaterialProcessing>,
	): Promise<SourceMaterialProcessing | null> {
		try {
			const [updated] = await db
				.update(sourceMaterialProcessing)
				.set({ ...updates, updatedAt: new Date() })
				.where(eq(sourceMaterialProcessing.sourceMaterialId, sourceMaterialId))
				.returning();

			return updated ?? null;
		} catch (error) {
			console.error("SourceMaterialRepository.updateProcessing error:", error);
			throw new DatabaseError("Failed to update processing record");
		}
	}

	// ============================================================================
	// Chunk Operations
	// ============================================================================

	/**
	 * Save extraction (chapters and chunks)
	 */
	async saveExtraction(data: ExtractionInput): Promise<{
		chapters: SourceMaterialChapter[];
		chunks: SourceMaterialChunk[];
	}> {
		try {
			const now = new Date();

			return await db.transaction(async (tx) => {
				await tx
					.delete(sourceMaterialChunk)
					.where(eq(sourceMaterialChunk.sourceMaterialId, data.materialId));
				await tx
					.delete(sourceMaterialChapter)
					.where(eq(sourceMaterialChapter.sourceMaterialId, data.materialId));

				const preparedChapters = data.chapters.map((chapter) => ({
					id: chapter.id,
					createdAt: now,
					updatedAt: now,
					title: chapter.title,
					sequence: chapter.sequence,
					headings: chapter.headings,
					metadata: chapter.metadata ?? null,
					sourceMaterialId: data.materialId,
					projectId: data.projectId,
					userId: data.userId,
				}));

				const insertedChapters = preparedChapters.length
					? await tx
							.insert(sourceMaterialChapter)
							.values(preparedChapters)
							.returning()
					: [];

				const insertedChunks = data.chunks.length
					? await tx
							.insert(sourceMaterialChunk)
							.values(
								data.chunks.map((chunk) => ({
									id: chunk.id,
									createdAt: now,
									updatedAt: now,
									sequence: chunk.sequence,
									text: chunk.text,
									metadata: chunk.metadata ?? null,
									chapterId: chunk.chapterId,
									sourceMaterialId: data.materialId,
									projectId: data.projectId,
									userId: data.userId,
								})),
							)
							.returning()
					: [];

				return { chapters: insertedChapters, chunks: insertedChunks };
			});
		} catch (error) {
			console.error("SourceMaterialRepository.saveExtraction error:", error);
			throw new DatabaseError("Failed to save extraction");
		}
	}

	/**
	 * Get chunks for a source material
	 */
	async getChunks(
		sourceMaterialId: string,
		limit?: number,
		offset = 0,
	): Promise<SourceMaterialChunk[]> {
		try {
			let query = db
				.select()
				.from(sourceMaterialChunk)
				.where(eq(sourceMaterialChunk.sourceMaterialId, sourceMaterialId))
				.orderBy(asc(sourceMaterialChunk.sequence))
				.offset(offset);

			if (limit) {
				query = query.limit(limit) as typeof query;
			}

			return await query;
		} catch (error) {
			console.error("SourceMaterialRepository.getChunks error:", error);
			throw new DatabaseError("Failed to load chunks");
		}
	}

	/**
	 * Get sampled chunks (every Nth chunk)
	 */
	async getSampledChunks(
		sourceMaterialId: string,
		sampleRate = 5,
	): Promise<SourceMaterialChunk[]> {
		try {
			const allChunks = await db
				.select()
				.from(sourceMaterialChunk)
				.where(eq(sourceMaterialChunk.sourceMaterialId, sourceMaterialId))
				.orderBy(asc(sourceMaterialChunk.sequence));

			return allChunks.filter((_, index) => index % sampleRate === 0);
		} catch (error) {
			console.error("SourceMaterialRepository.getSampledChunks error:", error);
			throw new DatabaseError("Failed to load sampled chunks");
		}
	}

	/**
	 * Get chunk count
	 */
	async getChunkCount(sourceMaterialId: string): Promise<number> {
		try {
			const [result] = await db
				.select({ count: count() })
				.from(sourceMaterialChunk)
				.where(eq(sourceMaterialChunk.sourceMaterialId, sourceMaterialId));

			return result?.count ?? 0;
		} catch (error) {
			console.error("SourceMaterialRepository.getChunkCount error:", error);
			throw new DatabaseError("Failed to count chunks");
		}
	}
}

// Export singleton instance
export const sourceMaterialRepository = new SourceMaterialRepository();
