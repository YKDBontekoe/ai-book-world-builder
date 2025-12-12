import type {
  NewSourceMaterialChapter,
  NewSourceMaterialChunk,
  SourceMaterial,
} from "@/lib/db/schema";

export type BlobFetcher = (url: string) => Promise<Response>;

export type ExtractedContent = {
  text: string;
  headings: string[];
  metadata?: Record<string, unknown>;
};

export type ExtractionMetrics = {
  bytesProcessed: number;
  normalizedCharacters: number;
  chapterCount: number;
  chunkCount: number;
  metadata?: Record<string, unknown>;
};

export type NormalizedExtraction = {
  chapters: NewSourceMaterialChapter[];
  chunks: NewSourceMaterialChunk[];
  metrics: ExtractionMetrics;
};

export type ExtractionInput = {
  material: SourceMaterial;
  bytes: ArrayBuffer;
};

export type SourceMaterialExtractor = {
  extract: (input: ExtractionInput) => Promise<ExtractedContent>;
};

export type ExtractionStrategy = SourceMaterialExtractor & {
  mimeTypes: string[];
};
