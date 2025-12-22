import type { SourceMaterial } from "@/lib/db/schema";

import { calculateBackoff, DEFAULT_BASE_BACKOFF_MS, DEFAULT_MAX_ATTEMPTS } from "@/lib/ingestion/backoff";
import { DEFAULT_CHUNK_SIZE, normalizeExtraction } from "@/lib/ingestion/chunking";
import { createDefaultExtractorRegistry, ExtractorRegistry } from "@/lib/ingestion/extractors";
import type { IngestionRepository, SourceMaterialWithProcessing } from "@/lib/ingestion/repository";
import type { BlobFetcher, SourceMaterialExtractor } from "@/lib/ingestion/types";
import { normalizeTextContent } from "@/lib/ingestion/text";

const DEFAULT_BATCH_SIZE = 5;

export class SourceMaterialWorker {
  private repository: IngestionRepository | null;

  private readonly fetcher: BlobFetcher;

  private readonly extractorRegistry: ExtractorRegistry;

  private readonly chunkSize: number;

  private readonly batchSize: number;

  private readonly baseDelayMs: number;

  private readonly maxAttempts: number;

  constructor(options?: {
    repository?: IngestionRepository;
    fetcher?: BlobFetcher;
    extractorRegistry?: ExtractorRegistry;
    chunkSize?: number;
    batchSize?: number;
    backoff?: { baseDelayMs?: number; maxAttempts?: number };
  }) {
    this.repository = options?.repository ?? null;
    this.fetcher = options?.fetcher ?? fetch;
    this.extractorRegistry =
      options?.extractorRegistry ?? createDefaultExtractorRegistry();
    this.chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
    this.batchSize = options?.batchSize ?? DEFAULT_BATCH_SIZE;
    this.baseDelayMs = options?.backoff?.baseDelayMs ?? DEFAULT_BASE_BACKOFF_MS;
    this.maxAttempts = options?.backoff?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  }

  async runBatch(): Promise<void> {
    const repository = await this.getRepository();
    const materials = await repository.getReadyMaterials(this.batchSize);

    for (const item of materials) {
      // eslint-disable-next-line no-await-in-loop
      await this.processMaterial(item);
    }
  }

  private async getRepository(): Promise<IngestionRepository> {
    if (this.repository) {
      return this.repository;
    }

    const { DatabaseIngestionRepository } = await import("@/lib/ingestion/repository-db");
    this.repository = new DatabaseIngestionRepository();
    return this.repository;
  }

  private async processMaterial({
    material,
    processing,
  }: SourceMaterialWithProcessing): Promise<void> {
    const repository = await this.getRepository();
    const attempts = processing?.attempts ?? 0;
    const nextAttemptAt = processing?.nextAttemptAt ?? new Date();

    if (nextAttemptAt > new Date()) {
      return;
    }

    const startedAt = new Date();

    await repository.saveProcessing({
      attempts,
      nextAttemptAt: startedAt,
      projectId: material.projectId,
      sourceMaterialId: material.id,
      startedAt,
      status: "processing",
      userId: material.userId,
    });

    await repository.markStatus(material.id, "processing");

    if (!material.blobUrl) {
      await this.recordFailure({
        material,
        attempts,
        error: new Error("Source material is missing a blob URL"),
      });
      return;
    }

    try {
      const response = await this.fetcher(material.blobUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${response.statusText}`);
      }

      const bytes = await response.arrayBuffer();
      const content = await this.extract(material.mimeType).extract({
        material,
        bytes,
      });
      const normalized = normalizeExtraction({
        bytes,
        content,
        chunkSize: this.chunkSize,
      });

      await repository.persistExtraction({
        material,
        chapters: normalized.chapters,
        chunks: normalized.chunks,
      });

      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();

      await repository.saveProcessing({
        attempts: attempts + 1,
        bytesProcessed: normalized.metrics.bytesProcessed,
        chapters: normalized.metrics.chapterCount,
        chunks: normalized.metrics.chunkCount,
        completedAt,
        durationMs,
        lastError: null,
        metadata: normalized.metrics.metadata ?? null,
        nextAttemptAt: completedAt,
        normalizedCharacters: normalized.metrics.normalizedCharacters,
        projectId: material.projectId,
        sourceMaterialId: material.id,
        startedAt,
        status: "processed",
        userId: material.userId,
      });

      await repository.markStatus(material.id, "processed");
    } catch (error) {
      await this.recordFailure({ material, attempts, error: error as Error });
    }
  }

  private extract(mimeType: string): SourceMaterialExtractor {
    return this.extractorRegistry.resolve(mimeType);
  }

  private async recordFailure({
    material,
    attempts,
    error,
  }: {
    material: SourceMaterial;
    attempts: number;
    error: Error;
  }): Promise<void> {
    const repository = await this.getRepository();
    const { nextAttempts, nextAttemptAt, status } = calculateBackoff({
      attempts,
      baseDelayMs: this.baseDelayMs,
      maxAttempts: this.maxAttempts,
    });

    console.error(
      "Failed to process source material",
      {
        materialId: material.id,
        projectId: material.projectId,
        userId: material.userId,
        status,
      },
      error
    );

    await repository.saveProcessing({
      attempts: nextAttempts,
      lastError: error.message,
      nextAttemptAt,
      projectId: material.projectId,
      sourceMaterialId: material.id,
      status,
      userId: material.userId,
    });

    await repository.markStatus(material.id, status);
  }
}

export function createWorker(options?: {
  repository?: IngestionRepository;
  fetcher?: BlobFetcher;
  extractorRegistry?: ExtractorRegistry;
  chunkSize?: number;
  batchSize?: number;
  backoff?: { baseDelayMs?: number; maxAttempts?: number };
}): SourceMaterialWorker {
  return new SourceMaterialWorker(options);
}

export { normalizeTextContent };
export type { IngestionRepository, SourceMaterialWithProcessing };
export type { SourceMaterialExtractor, ExtractedContent } from "@/lib/ingestion/types";
