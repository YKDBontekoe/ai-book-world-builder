import { describe, expect, it } from "vitest";

import { DEFAULT_PROJECT_FOLDERS } from "@/lib/constants";
import {
  SourceMaterialWorker,
  type ExtractedContent,
  type IngestionRepository,
  type SourceMaterialExtractor,
  normalizeTextContent,
} from "@/lib/ingestion/worker";
import type { EntityExtractor } from "@/lib/ingestion/entity-extractor";
import { deriveEntitiesFromContent, type ExtractedEntity } from "@/lib/ingestion/entities";
import { generateUUID } from "@/lib/utils";
import type {
  Entity,
  EntityAttribute,
  NewSourceMaterialChapter,
  NewSourceMaterialChunk,
  ProjectFolder,
  Relationship,
  SourceMaterial,
  SourceMaterialProcessing,
} from "@/lib/db/schema";
import type {
  PersistedEntityAuditLog,
  SourceMaterialWithProcessing,
} from "@/lib/db/queries";

class InMemoryRepository implements IngestionRepository {
  materials: SourceMaterialWithProcessing[];

  chapters: NewSourceMaterialChapter[] = [];

  chunks: NewSourceMaterialChunk[] = [];

  processing = new Map<string, SourceMaterialProcessing>();

  projectFolders = new Map<string, ProjectFolder[]>();

  entities: Entity[] = [];

  attributes: EntityAttribute[] = [];

  relationships: Relationship[] = [];

  auditLog: PersistedEntityAuditLog | null = null;

  constructor(materials: SourceMaterialWithProcessing[]) {
    this.materials = materials;
    materials.forEach((entry) => {
      this.projectFolders.set(entry.material.projectId, DEFAULT_PROJECT_FOLDERS);
    });
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

  async getProjectFolders({
    projectId,
  }: {
    projectId: string;
    userId: string;
  }): Promise<ProjectFolder[]> {
    return this.projectFolders.get(projectId) ?? DEFAULT_PROJECT_FOLDERS;
  }

  async persistEntities({
    material,
    entities,
  }: {
    material: SourceMaterial;
    entities: ExtractedEntity[];
  }) {
    if (entities.length === 0) {
      this.auditLog = null;
      return null;
    }

    const now = new Date();
    const existingByName = new Map(
      this.entities
        .filter((entityItem) => entityItem.projectId === material.projectId)
        .map((entry) => [entry.name.toLowerCase(), entry])
    );
    const created: Entity[] = [];
    const updated: Entity[] = [];
    let attributesUpserted = 0;
    let relationshipsUpserted = 0;

    for (const entityDef of entities) {
      const existing = existingByName.get(entityDef.name.toLowerCase());

      if (existing) {
        existing.kind = entityDef.kind;
        existing.summary = entityDef.summary ?? existing.summary;
        existing.updatedAt = now;
        entityDef.id = existing.id;
        updated.push(existing);
        continue;
      }

      const record: Entity = {
        id: generateUUID(),
        createdAt: now,
        updatedAt: now,
        name: entityDef.name,
        kind: entityDef.kind,
        summary: entityDef.summary ?? null,
        startDate: null,
        endDate: null,
        projectId: material.projectId,
      };

      this.entities.push(record);
      existingByName.set(record.name.toLowerCase(), record);
      entityDef.id = record.id;
      created.push(record);
    }

    for (const entityDef of entities) {
      const parent = existingByName.get(entityDef.name.toLowerCase());

      if (!parent) continue;

      const attributeKeys = new Set(
        this.attributes
          .filter((attribute) => attribute.entityId === parent.id)
          .map((attribute) => attribute.name.toLowerCase())
      );

      for (const attribute of entityDef.attributes ?? []) {
        const record: EntityAttribute = {
          id: generateUUID(),
          createdAt: now,
          name: attribute.name,
          value: attribute.value,
          dataType: attribute.dataType ?? "text",
          startDate: null,
          endDate: null,
          entityId: parent.id,
          projectId: material.projectId,
        };

        if (attributeKeys.has(attribute.name.toLowerCase())) {
          const index = this.attributes.findIndex(
            (attributeItem) =>
              attributeItem.entityId === parent.id &&
              attributeItem.name.toLowerCase() === attribute.name.toLowerCase()
          );

          this.attributes[index] = record;
          attributesUpserted += 1;
        } else {
          this.attributes.push(record);
          attributesUpserted += 1;
        }
      }

      const relationshipKeys = new Set(
        this.relationships
          .filter((relation) => relation.projectId === material.projectId)
          .map(
            (relation) =>
              `${relation.sourceEntityId}:${relation.targetEntityId}:${relation.type}`
          )
      );

      for (const relation of entityDef.relationships ?? []) {
        const target = existingByName.get(relation.targetName.toLowerCase());
        if (!target || target.id === parent.id) continue;

        const key = `${parent.id}:${target.id}:${relation.type}`;
        const record: Relationship = {
          id: generateUUID(),
          createdAt: now,
          type: relation.type,
          description: relation.description ?? null,
          startDate: null,
          endDate: null,
          projectId: material.projectId,
          sourceEntityId: parent.id,
          targetEntityId: target.id,
        };

        if (relationshipKeys.has(key)) {
          const index = this.relationships.findIndex(
            (candidate) =>
              candidate.sourceEntityId === parent.id &&
              candidate.targetEntityId === target.id &&
              candidate.type === relation.type
          );

          this.relationships[index] = record;
          relationshipsUpserted += 1;
        } else {
          this.relationships.push(record);
          relationshipsUpserted += 1;
        }
      }
    }

    this.auditLog = {
      created,
      updated,
      attributesUpserted,
      relationshipsUpserted,
    } satisfies PersistedEntityAuditLog;

    return { entities, audit: this.auditLog };
  }
}

class DeterministicEntityExtractor implements EntityExtractor {
  async extract({
    text,
    projectFolders,
    headings,
  }: {
    text: string;
    projectFolders?: ProjectFolder[];
    headings?: string[];
  }): Promise<ExtractedEntity[]> {
    return deriveEntitiesFromContent({
      text,
      projectFolders,
      headings,
    });
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
      entityExtractor: new DeterministicEntityExtractor(),
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

  it("extracts and upserts entities, attributes, and relationships", async () => {
    const repo = new InMemoryRepository([
      { material: baseMaterial, processing: null },
    ]);

    let currentText = [
      "Characters:",
      "- Aria (Guardian): Protector of the realm | Attributes: Virtue=Loyal, Home=Skyhold | Relationships: Cassian=Allies",
      "- Cassian (Prince): Reluctant heir keeping secrets",
      "",
      "Locations:",
      "- Skyhold (City): Mountain capital where the guardian serves | Relationships: Aria=Protector",
    ].join("\n");

    const worker = new SourceMaterialWorker({
      repository: repo,
      extractor,
      fetcher: () => textFetcher(currentText),
      batchSize: 1,
      entityExtractor: new DeterministicEntityExtractor(),
      chunkSize: 200,
    });

    await worker.runBatch();

    expect(repo.entities).toHaveLength(3);
    expect(repo.attributes.length).toBeGreaterThanOrEqual(5);
    expect(repo.relationships).toHaveLength(2);
    expect(repo.auditLog?.created.length).toBe(3);

    currentText = [
      "Characters:",
      "- Aria (Guardian): Protector of the realm and the skies",
      "- Cassian (Prince): Determined ally | Relationships: Aria=Allies",
    ].join("\n");

    await worker.runBatch();

    expect(repo.entities).toHaveLength(3);
    expect(repo.auditLog?.created.length).toBe(0);
    expect(repo.auditLog?.updated.length).toBeGreaterThan(0);
    expect(new Set(
      repo.relationships.map(
        (relation) =>
          `${relation.sourceEntityId}:${relation.targetEntityId}:${relation.type}`
      )
    ).size).toBe(repo.relationships.length);
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
      entityExtractor: new DeterministicEntityExtractor(),
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
