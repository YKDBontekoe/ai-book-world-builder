import type {
  NewSourceMaterialChapter,
  NewSourceMaterialChunk,
  SourceMaterial,
  SourceMaterialProcessing,
} from "@/lib/db/schema";

export type SourceMaterialWithProcessing = {
  material: SourceMaterial;
  processing: SourceMaterialProcessing | null;
};

export type IngestionRepository = {
  getReadyMaterials: (limit: number) => Promise<SourceMaterialWithProcessing[]>;
  markStatus: (id: string, status: SourceMaterial["status"]) => Promise<void>;
  saveProcessing: (params: {
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
  }) => Promise<SourceMaterialProcessing>;
  updateProcessing: (params: {
    sourceMaterialId: string;
    nextAttemptAt?: Date;
    attempts?: number;
    lastError?: string | null;
    status?: SourceMaterialProcessing["status"];
    metadata?: Record<string, unknown> | null;
  }) => Promise<SourceMaterialProcessing | null>;
  persistExtraction: (args: {
    material: SourceMaterial;
    chapters: NewSourceMaterialChapter[];
    chunks: NewSourceMaterialChunk[];
  }) => Promise<void>;
};
