import "server-only";
import { and, asc, count, eq, inArray, isNull, lte, or } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { safeQuery } from "@/lib/db/safe-query";
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

export async function createSourceMaterial({
	blobUrl,
	filename,
	mimeType,
	projectId,
	size,
	status,
	userId,
}: {
	blobUrl?: string | null;
	filename: string;
	mimeType: string;
	projectId: string;
	size: number;
	status: SourceMaterialStatus;
	userId: string;
}): Promise<SourceMaterial> {
	return safeQuery(
		async () => {
			const [material] = await db
				.insert(sourceMaterial)
				.values({
					blobUrl,
					createdAt: new Date(),
					updatedAt: new Date(),
					filename,
					mimeType,
					projectId,
					size,
					status,
					userId,
				})
				.returning();

			return material;
		},
		{ errorMessage: "Failed to create source material record" },
	);
}

export async function updateSourceMaterial({
	blobUrl,
	id,
	status,
}: {
	blobUrl?: string | null;
	id: string;
	status: SourceMaterialStatus;
}): Promise<SourceMaterial | null> {
	return safeQuery(
		async () => {
			const [material] = await db
				.update(sourceMaterial)
				.set({
					blobUrl,
					status,
					updatedAt: new Date(),
				})
				.where(eq(sourceMaterial.id, id))
				.returning();

			return material ?? null;
		},
		{ errorMessage: "Failed to update source material record" },
	);
}

export type SourceMaterialWithProcessing = {
	material: SourceMaterial;
	processing: SourceMaterialProcessing | null;
};

export async function getSourceMaterialsReadyForProcessing({
	limit,
	now,
}: {
	limit: number;
	now?: Date;
}): Promise<SourceMaterialWithProcessing[]> {
	const currentDate = now ?? new Date();

	return safeQuery(
		async () => {
			const results = await db
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
						] satisfies SourceMaterialStatus[]),
						or(
							isNull(sourceMaterialProcessing.nextAttemptAt),
							lte(sourceMaterialProcessing.nextAttemptAt, currentDate),
							isNull(sourceMaterialProcessing.id),
						),
					),
				)
				.orderBy(asc(sourceMaterial.createdAt))
				.limit(limit);

			return results;
		},
		{ errorMessage: "Failed to load source materials for processing" },
	);
}

export type UpsertSourceMaterialProcessingArgs = {
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
};

export async function upsertSourceMaterialProcessing({
	attempts,
	bytesProcessed,
	chapters,
	chunks,
	completedAt,
	durationMs,
	lastError,
	metadata,
	nextAttemptAt,
	normalizedCharacters,
	projectId,
	sourceMaterialId,
	startedAt,
	status,
	userId,
}: UpsertSourceMaterialProcessingArgs): Promise<SourceMaterialProcessing> {
	return safeQuery(
		async () => {
			const now = new Date();

			return await db.transaction(async (tx) => {
				const [existing] = await tx
					.select()
					.from(sourceMaterialProcessing)
					.where(
						eq(sourceMaterialProcessing.sourceMaterialId, sourceMaterialId),
					)
					.limit(1);

				if (existing) {
					const [updated] = await tx
						.update(sourceMaterialProcessing)
						.set({
							attempts: attempts ?? existing.attempts,
							bytesProcessed: bytesProcessed ?? existing.bytesProcessed,
							chapters: chapters ?? existing.chapters,
							chunks: chunks ?? existing.chunks,
							completedAt: completedAt ?? existing.completedAt,
							durationMs: durationMs ?? existing.durationMs,
							lastError: lastError ?? existing.lastError,
							metadata: metadata ?? existing.metadata,
							nextAttemptAt: nextAttemptAt ?? existing.nextAttemptAt,
							normalizedCharacters:
								normalizedCharacters ?? existing.normalizedCharacters,
							startedAt: startedAt ?? existing.startedAt,
							status: status ?? existing.status,
							updatedAt: now,
						})
						.where(eq(sourceMaterialProcessing.id, existing.id))
						.returning();

					return updated;
				}

				const [inserted] = await tx
					.insert(sourceMaterialProcessing)
					.values({
						attempts: attempts ?? 0,
						bytesProcessed: bytesProcessed ?? 0,
						chapters: chapters ?? 0,
						chunks: chunks ?? 0,
						completedAt: completedAt ?? null,
						createdAt: now,
						durationMs: durationMs ?? 0,
						lastError: lastError ?? null,
						metadata: metadata ?? null,
						nextAttemptAt: nextAttemptAt ?? now,
						normalizedCharacters: normalizedCharacters ?? 0,
						projectId,
						sourceMaterialId,
						startedAt: startedAt ?? null,
						status: status ?? "pending",
						updatedAt: now,
						userId,
					})
					.returning();

				return inserted;
			});
		},
		{ errorMessage: "Failed to upsert source material processing record" },
	);
}

export type UpdateSourceMaterialProcessingArgs = {
	sourceMaterialId: string;
} & Partial<
	Pick<
		SourceMaterialProcessing,
		| "attempts"
		| "bytesProcessed"
		| "chapters"
		| "chunks"
		| "completedAt"
		| "durationMs"
		| "lastError"
		| "metadata"
		| "nextAttemptAt"
		| "normalizedCharacters"
		| "startedAt"
		| "status"
	>
>;

export async function updateSourceMaterialProcessing({
	sourceMaterialId,
	...updates
}: UpdateSourceMaterialProcessingArgs): Promise<SourceMaterialProcessing | null> {
	return safeQuery(
		async () => {
			const [updated] = await db
				.update(sourceMaterialProcessing)
				.set({ ...updates, updatedAt: new Date() })
				.where(eq(sourceMaterialProcessing.sourceMaterialId, sourceMaterialId))
				.returning();

			return updated ?? null;
		},
		{ errorMessage: "Failed to update source material processing record" },
	);
}

export async function saveSourceMaterialExtraction({
	chapters,
	chunks,
	materialId,
	projectId,
	userId,
}: {
	chapters: NewSourceMaterialChapter[];
	chunks: NewSourceMaterialChunk[];
	materialId: string;
	projectId: string;
	userId: string;
}): Promise<{
	chapters: SourceMaterialChapter[];
	chunks: SourceMaterialChunk[];
}> {
	return safeQuery(
		async () => {
			const now = new Date();

			return await db.transaction(async (tx) => {
				await tx
					.delete(sourceMaterialChunk)
					.where(eq(sourceMaterialChunk.sourceMaterialId, materialId));

				await tx
					.delete(sourceMaterialChapter)
					.where(eq(sourceMaterialChapter.sourceMaterialId, materialId));

				const preparedChapters = chapters.map((chapter) => ({
					id: chapter.id,
					createdAt: now,
					updatedAt: now,
					title: chapter.title,
					sequence: chapter.sequence,
					headings: chapter.headings,
					metadata: chapter.metadata ?? null,
					sourceMaterialId: materialId,
					projectId,
					userId,
				}));

				const insertedChapters = preparedChapters.length
					? await tx
							.insert(sourceMaterialChapter)
							.values(preparedChapters)
							.returning()
					: [];

				const insertedChunks = chunks.length
					? await tx
							.insert(sourceMaterialChunk)
							.values(
								chunks.map((chunk) => ({
									id: chunk.id,
									createdAt: now,
									updatedAt: now,
									sequence: chunk.sequence,
									text: chunk.text,
									metadata: chunk.metadata ?? null,
									chapterId: chunk.chapterId,
									sourceMaterialId: materialId,
									projectId,
									userId,
								})),
							)
							.returning()
					: [];

				return { chapters: insertedChapters, chunks: insertedChunks };
			});
		},
		{ errorMessage: "Failed to persist extracted source material content" },
	);
}

/**
 * Get all chunks for a source material, optionally with pagination
 */
export async function getChunksForSourceMaterial({
	sourceMaterialId,
	limit,
	offset = 0,
}: {
	sourceMaterialId: string;
	limit?: number;
	offset?: number;
}): Promise<SourceMaterialChunk[]> {
	return safeQuery(
		async () => {
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
		},
		{ errorMessage: "Failed to load chunks for source material" },
	);
}

/**
 * Get sampled chunks from a source material (e.g., every Nth chunk)
 * Useful for fast entity detection without processing entire book
 */
export async function getSampledChunks({
	sourceMaterialId,
	sampleRate = 5,
}: {
	sourceMaterialId: string;
	sampleRate?: number;
}): Promise<SourceMaterialChunk[]> {
	return safeQuery(
		async () => {
			// Get all chunks and filter by sequence
			const allChunks = await db
				.select()
				.from(sourceMaterialChunk)
				.where(eq(sourceMaterialChunk.sourceMaterialId, sourceMaterialId))
				.orderBy(asc(sourceMaterialChunk.sequence));

			// Sample every Nth chunk
			return allChunks.filter((_, index) => index % sampleRate === 0);
		},
		{ errorMessage: "Failed to load sampled chunks for source material" },
	);
}

/**
 * Get the total count of chunks for a source material
 */
export async function getChunkCount({
	sourceMaterialId,
}: {
	sourceMaterialId: string;
}): Promise<number> {
	return safeQuery(
		async () => {
			const [result] = await db
				.select({ count: count() })
				.from(sourceMaterialChunk)
				.where(eq(sourceMaterialChunk.sourceMaterialId, sourceMaterialId));

			return result?.count ?? 0;
		},
		{ errorMessage: "Failed to count chunks for source material" },
	);
}

/**
 * Get source material by ID with its processing status
 */
export async function getSourceMaterialById({
	id,
}: {
	id: string;
}): Promise<SourceMaterialWithProcessing | null> {
	return safeQuery(
		async () => {
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
		},
		{ errorMessage: "Failed to load source material by id" },
	);
}

/**
 * Get all source materials for a user across all projects
 */
export async function getSourceMaterialsForUser({
	userId,
}: {
	userId: string;
}): Promise<
	Array<
		SourceMaterial & {
			projectName: string;
			processingStatus: SourceMaterialProcessing | null;
		}
	>
> {
	return safeQuery(
		async () => {
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
		},
		{ errorMessage: "Failed to load source materials for user" },
	);
}
