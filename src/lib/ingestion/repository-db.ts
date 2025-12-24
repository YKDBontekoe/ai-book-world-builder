import {
	getSourceMaterialsReadyForProcessing,
	saveSourceMaterialExtraction,
	updateSourceMaterial,
	updateSourceMaterialProcessing,
	upsertSourceMaterialProcessing,
} from "@/lib/db/queries";
import type {
	NewSourceMaterialChapter,
	NewSourceMaterialChunk,
	SourceMaterial,
	SourceMaterialProcessing,
} from "@/lib/db/schema";

import type {
	IngestionRepository,
	SourceMaterialWithProcessing,
} from "@/lib/ingestion/repository";

export class DatabaseIngestionRepository implements IngestionRepository {
	async getReadyMaterials(
		limit: number,
	): Promise<SourceMaterialWithProcessing[]> {
		return getSourceMaterialsReadyForProcessing({ limit });
	}

	async markStatus(
		id: string,
		status: SourceMaterial["status"],
	): Promise<void> {
		await updateSourceMaterial({ id, status });
	}

	async saveProcessing(params: {
		sourceMaterialId: string;
		projectId: string;
		userId: string;
		status?: SourceMaterialProcessing["status"];
		attempts?: number;
		nextAttemptAt?: Date;
		lastError?: string | null;
		startedAt?: Date | null;
		completedAt?: Date | null;
		bytesProcessed?: number;
		chapters?: number;
		chunks?: number;
		normalizedCharacters?: number;
		durationMs?: number;
		metadata?: Record<string, unknown> | null;
	}): Promise<SourceMaterialProcessing> {
		return upsertSourceMaterialProcessing(params);
	}

	async updateProcessing(params: {
		sourceMaterialId: string;
		nextAttemptAt?: Date;
		attempts?: number;
		lastError?: string | null;
		status?: SourceMaterialProcessing["status"];
		metadata?: Record<string, unknown> | null;
	}): Promise<SourceMaterialProcessing | null> {
		return updateSourceMaterialProcessing(params);
	}

	async persistExtraction({
		material,
		chapters,
		chunks,
	}: {
		material: SourceMaterial;
		chapters: NewSourceMaterialChapter[];
		chunks: NewSourceMaterialChunk[];
	}): Promise<void> {
		await saveSourceMaterialExtraction({
			chapters,
			chunks,
			materialId: material.id,
			projectId: material.projectId,
			userId: material.userId,
		});
	}
}
