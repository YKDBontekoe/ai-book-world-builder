import { describe, expect, it } from "vitest";

import {
  SourceMaterialWorker,
  type ExtractedContent,
  type IngestionRepository,
  type SourceMaterialExtractor,
  normalizeTextContent,
} from "@/lib/ingestion/worker";
import { generateUUID } from "@/lib/utils";
import type {
  NewSourceMaterialChapter,
  NewSourceMaterialChunk,
  SourceMaterial,
  SourceMaterialProcessing,
} from "@/lib/db/schema";
import type { SourceMaterialWithProcessing } from "@/lib/db/queries";

class InMemoryRepository implements IngestionRepository {
  materials: SourceMaterialWithProcessing[];

  chapters: NewSourceMaterialChapter[] = [];

  chunks: NewSourceMaterialChunk[] = [];

  processing = new Map<string, SourceMaterialProcessing>();

  constructor(materials: SourceMaterialWithProcessing[]) {
    this.materials = materials;
  }

  async getReadyMaterials(limit: number): Promise<SourceMaterialWithProcessing[]> {
    return this.materials.slice(0, limit);
  }

  async markStatus(id: string, status: SourceMaterial["status"]): Promise<void> {
    this.materials = this.materials.map((entry) =>
      entry.material.id === id
        ? { ...entry, material: { ...entry.material, status } }
        : entry
    );

    const existing = this.processing.get(id);
    if (existing) {
      this.processing.set(id, { ...existing, status });
    }
  }

  async saveProcessing(
    params: Parameters<IngestionRepository["saveProcessing"]>[0]
  ): Promise<SourceMaterialProcessing> {
    const now = new Date();
    const existing = this.processing.get(params.sourceMaterialId);

    const base: SourceMaterialProcessing = existing ?? {
      id: generateUUID(),
      createdAt: now,
      updatedAt: now,
      status: params.status ?? "pending",
      attempts: params.attempts ?? 0,
      nextAttemptAt: params.nextAttemptAt ?? now,
      lastError: params.lastError ?? null,
      startedAt: params.startedAt ?? null,
      completedAt: params.completedAt ?? null,
      bytesProcessed: params.bytesProcessed ?? 0,
      chapters: params.chapters ?? 0,
      chunks: params.chunks ?? 0,
      normalizedCharacters: params.normalizedCharacters ?? 0,
      durationMs: params.durationMs ?? 0,
      metadata: params.metadata ?? null,
      sourceMaterialId: params.sourceMaterialId,
      projectId: params.projectId,
      userId: params.userId,
    };

    const merged: SourceMaterialProcessing = {
      ...base,
      ...params,
      updatedAt: now,
      lastError: params.lastError ?? base.lastError,
      completedAt: params.completedAt ?? base.completedAt,
      startedAt: params.startedAt ?? base.startedAt,
      metadata: params.metadata ?? base.metadata,
      nextAttemptAt: params.nextAttemptAt ?? base.nextAttemptAt,
    };

    this.processing.set(params.sourceMaterialId, merged);
    this.materials = this.materials.map((entry) =>
      entry.material.id === params.sourceMaterialId
        ? { ...entry, processing: merged }
        : entry
    );

    return merged;
  }

  async updateProcessing(
    params: Parameters<IngestionRepository["updateProcessing"]>[0]
  ): Promise<SourceMaterialProcessing | null> {
    if (!this.processing.has(params.sourceMaterialId)) {
      return null;
    }

    return this.saveProcessing(params);
  }

  async persistExtraction({
    chapters,
    chunks,
  }: {
    material: SourceMaterial;
    chapters: NewSourceMaterialChapter[];
    chunks: NewSourceMaterialChunk[];
  }): Promise<void> {
    this.chapters = chapters;
    this.chunks = chunks;
  }
}

const baseMaterial: SourceMaterial = {
  id: generateUUID(),
  createdAt: new Date(),
  updatedAt: new Date(),
  filename: "sample.txt",
  mimeType: "text/plain",
  size: 128,
  status: "uploaded",
  blobUrl: "https://example.com/blob",
  projectId: generateUUID(),
  userId: generateUUID(),
};

const textFetcher = async (body: string) =>
  new Response(body, {
    status: 200,
    headers: { "content-type": "text/plain" },
  });

const extractor: SourceMaterialExtractor = {
  extract: async ({ bytes }): Promise<ExtractedContent> => {
    const text = new TextDecoder().decode(bytes);
    return {
      text,
      headings: ["Introduction"],
      metadata: { bytes: bytes.byteLength },
    };
  },
};

describe("SourceMaterialWorker", () => {
  it("processes uploaded materials and persists normalized chunks", async () => {
    const repo = new InMemoryRepository([
      { material: baseMaterial, processing: null },
    ]);

    const worker = new SourceMaterialWorker({
      repository: repo,
      extractor,
      fetcher: () => textFetcher("Intro\nBody content that spans multiple chunks."),
      chunkSize: 20,
      batchSize: 1,
    });

    await worker.runBatch();

    const processing = repo.processing.get(baseMaterial.id);

    expect(repo.materials[0].material.status).toBe("processed");
    expect(repo.chapters).toHaveLength(1);
    expect(repo.chunks.length).toBeGreaterThan(1);
    expect(processing?.status).toBe("processed");
    expect(processing?.attempts).toBe(1);
    expect(processing?.chunks).toBeGreaterThan(0);
    expect(processing?.normalizedCharacters).toBeGreaterThan(0);
    expect(processing?.lastError).toBeNull();
  });

  it("backs off on failures and marks the material as failed after max attempts", async () => {
    const material: SourceMaterial = { ...baseMaterial, id: generateUUID() };

    const repo = new InMemoryRepository([{ material, processing: null }]);
    const failingExtractor: SourceMaterialExtractor = {
      extract: async () => {
        throw new Error("Unable to parse file");
      },
    };

    const worker = new SourceMaterialWorker({
      repository: repo,
      extractor: failingExtractor,
      fetcher: () => textFetcher("irrelevant"),
      batchSize: 1,
      maxAttempts: 2,
    });

    await worker.runBatch();

    const firstProcessing = repo.processing.get(material.id);

    expect(firstProcessing?.status).toBe("uploaded");
    expect(firstProcessing?.attempts).toBe(1);
    expect(firstProcessing?.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());

    await worker.runBatch();

    const finalProcessing = repo.processing.get(material.id);
    expect(repo.materials[0].material.status).toBe("failed");
    expect(finalProcessing?.status).toBe("failed");
    expect(finalProcessing?.attempts).toBe(2);
    expect(finalProcessing?.lastError).toBe("Unable to parse file");
  });
});

describe("normalizeTextContent", () => {
  it("normalizes new lines and removes control characters", () => {
    const dirty = "Line one\r\nLine two\u0000\n";
    expect(normalizeTextContent(dirty)).toBe("Line one\nLine two");
  });
});
