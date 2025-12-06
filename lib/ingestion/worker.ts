import { Buffer } from "node:buffer";

import JSZip from "jszip";

import {
  getSourceMaterialsReadyForProcessing,
  saveSourceMaterialExtraction,
  type SourceMaterialWithProcessing,
  type UpsertSourceMaterialProcessingArgs,
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
import { supportedSourceMaterialMimeTypes } from "@/lib/source-materials";
import { generateUUID } from "@/lib/utils";

type BlobFetcher = (url: string) => Promise<Response>;

type ExtractedContent = {
  text: string;
  headings: string[];
  metadata?: Record<string, unknown>;
};

type ExtractionResult = {
  chapters: NewSourceMaterialChapter[];
  chunks: NewSourceMaterialChunk[];
  metrics: {
    bytesProcessed: number;
    normalizedCharacters: number;
    chapterCount: number;
    chunkCount: number;
    metadata?: Record<string, unknown>;
  };
};

type SourceMaterialExtractor = {
  extract: (input: { material: SourceMaterial; bytes: ArrayBuffer }) => Promise<ExtractedContent>;
};

type IngestionRepository = {
  getReadyMaterials: (limit: number) => Promise<SourceMaterialWithProcessing[]>;
  markStatus: (id: string, status: SourceMaterial["status"]) => Promise<void>;
  saveProcessing: (params: UpsertSourceMaterialProcessingArgs) => Promise<SourceMaterialProcessing>;
  updateProcessing: (
    params: Parameters<typeof updateSourceMaterialProcessing>[0]
  ) => Promise<SourceMaterialProcessing | null>;
  persistExtraction: (args: {
    material: SourceMaterial;
    chapters: NewSourceMaterialChapter[];
    chunks: NewSourceMaterialChunk[];
  }) => Promise<void>;
};

const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_BATCH_SIZE = 5;
const BASE_BACKOFF_MS = 1000;
const DEFAULT_MAX_ATTEMPTS = 3;

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[\t ]+\n/g, "\n")
    .trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function splitIntoChunks(text: string, chunkSize: number): string[] {
  if (!text) return [];

  const normalized = cleanText(text);
  const parts: string[] = [];
  let cursor = 0;

  while (cursor < normalized.length) {
    const slice = normalized.slice(cursor, cursor + chunkSize);
    const lastSpace = slice.lastIndexOf(" ");
    const end = lastSpace > 0 ? cursor + lastSpace : cursor + slice.length;
    parts.push(normalized.slice(cursor, end).trim());
    cursor = end;
  }

  return parts.filter(Boolean);
}

function deriveHeadings(text: string): string[] {
  const headings = new Set<string>();
  const lines = cleanText(text).split("\n");
  const headingRegex = /^(?:#+\s+|chapter\s+\d+[:\-\s]*)(.+)/i;

  for (const line of lines) {
    const match = line.match(headingRegex);
    if (match?.[1]) {
      const heading = match[1].trim();
      if (heading) {
        headings.add(heading);
      }
    }
  }

  return [...headings];
}

async function extractFromPdf(bytes: ArrayBuffer): Promise<ExtractedContent> {
  const { default: pdfParse } = await import("pdf-parse");
  const parsed = await pdfParse(Buffer.from(bytes));
  const text = parsed.text ?? "";

  return {
    text,
    headings: deriveHeadings(text),
    metadata: {
      info: parsed.info ?? null,
      metadata: parsed.metadata ?? null,
      numberOfPages: parsed.numpages ?? null,
    },
  };
}

async function extractFromDocx(bytes: ArrayBuffer): Promise<ExtractedContent> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
  const text = result.value ?? "";

  return {
    text,
    headings: deriveHeadings(text),
    metadata: {
      warnings: result.messages,
    },
  };
}

async function extractFromEpub(bytes: ArrayBuffer): Promise<ExtractedContent> {
  const zip = await new JSZip().loadAsync(Buffer.from(bytes));
  const htmlFiles = Object.keys(zip.files).filter(
    (fileName) => fileName.toLowerCase().endsWith(".xhtml") || fileName.toLowerCase().endsWith(".html")
  );

  const segments: string[] = [];

  for (const fileName of htmlFiles) {
    const file = zip.files[fileName];
    if (!file) continue;
    const content = await file.async("string");
    segments.push(stripHtml(content));
  }

  const text = segments.join("\n\n");

  return {
    text,
    headings: deriveHeadings(text),
    metadata: {
      manifestEntries: htmlFiles.length,
    },
  };
}

function extractFromPlainText(bytes: ArrayBuffer): ExtractedContent {
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  return {
    text,
    headings: deriveHeadings(text),
  };
}

class DefaultSourceMaterialExtractor implements SourceMaterialExtractor {
  async extract({
    bytes,
    material,
  }: {
    bytes: ArrayBuffer;
    material: SourceMaterial;
  }): Promise<ExtractedContent> {
    const mimeType = material.mimeType.toLowerCase();

    if (!supportedSourceMaterialMimeTypes.has(mimeType)) {
      throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    if (mimeType === "application/pdf") {
      return extractFromPdf(bytes);
    }

    if (mimeType === "application/epub+zip") {
      return extractFromEpub(bytes);
    }

    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      return extractFromDocx(bytes);
    }

    return extractFromPlainText(bytes);
  }
}

class DatabaseIngestionRepository implements IngestionRepository {
  async getReadyMaterials(limit: number): Promise<SourceMaterialWithProcessing[]> {
    return getSourceMaterialsReadyForProcessing({ limit });
  }

  async markStatus(id: string, status: SourceMaterial["status"]): Promise<void> {
    await updateSourceMaterial({ id, status });
  }

  async saveProcessing(
    params: UpsertSourceMaterialProcessingArgs
  ): Promise<SourceMaterialProcessing> {
    return upsertSourceMaterialProcessing(params);
  }

  async updateProcessing(
    params: Parameters<typeof updateSourceMaterialProcessing>[0]
  ): Promise<SourceMaterialProcessing | null> {
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

function buildChaptersAndChunks({
  text,
  headings,
  chunkSize,
}: {
  text: string;
  headings: string[];
  chunkSize: number;
}): { chapters: NewSourceMaterialChapter[]; chunks: NewSourceMaterialChunk[] } {
  const normalized = cleanText(text);

  if (!normalized) {
    return { chapters: [], chunks: [] };
  }

  const derivedHeadings = headings.length > 0 ? headings : deriveHeadings(normalized);

  const chapters: NewSourceMaterialChapter[] = [];
  const chunks: NewSourceMaterialChunk[] = [];

  const baseChapterId = generateUUID();
  const primaryChapter: NewSourceMaterialChapter = {
    id: baseChapterId,
    title: derivedHeadings[0] ?? "Imported Material",
    sequence: 0,
    headings: derivedHeadings,
  };

  chapters.push(primaryChapter);

  const chunkTexts = splitIntoChunks(normalized, chunkSize);
  chunkTexts.forEach((chunkText, index) => {
    chunks.push({
      id: generateUUID(),
      chapterId: baseChapterId,
      sequence: index,
      text: chunkText,
    });
  });

  return { chapters, chunks };
}

function normalizeExtraction({
  bytes,
  content,
  chunkSize,
}: {
  bytes: ArrayBuffer;
  content: ExtractedContent;
  chunkSize: number;
}): ExtractionResult {
  const { chapters, chunks } = buildChaptersAndChunks({
    text: content.text,
    headings: content.headings,
    chunkSize,
  });

  const normalizedText = cleanText(content.text);

  return {
    chapters,
    chunks,
    metrics: {
      bytesProcessed: bytes.byteLength,
      normalizedCharacters: normalizedText.length,
      chapterCount: chapters.length,
      chunkCount: chunks.length,
      metadata: content.metadata,
    },
  };
}

export class SourceMaterialWorker {
  private readonly repository: IngestionRepository;
  private readonly fetcher: BlobFetcher;
  private readonly extractor: SourceMaterialExtractor;
  private readonly chunkSize: number;
  private readonly batchSize: number;
  private readonly maxAttempts: number;

  constructor(options?: {
    repository?: IngestionRepository;
    fetcher?: BlobFetcher;
    extractor?: SourceMaterialExtractor;
    chunkSize?: number;
    batchSize?: number;
    maxAttempts?: number;
  }) {
    this.repository = options?.repository ?? new DatabaseIngestionRepository();
    this.fetcher = options?.fetcher ?? fetch;
    this.extractor = options?.extractor ?? new DefaultSourceMaterialExtractor();
    this.chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
    this.batchSize = options?.batchSize ?? DEFAULT_BATCH_SIZE;
    this.maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  }

  async runBatch(): Promise<void> {
    const materials = await this.repository.getReadyMaterials(this.batchSize);

    for (const item of materials) {
      // eslint-disable-next-line no-await-in-loop
      await this.processMaterial(item);
    }
  }

  private async processMaterial({
    material,
    processing,
  }: SourceMaterialWithProcessing): Promise<void> {
    const attempts = processing?.attempts ?? 0;
    const nextAttemptAt = processing?.nextAttemptAt ?? new Date();

    if (nextAttemptAt > new Date()) {
      return;
    }

    const startedAt = new Date();

    await this.repository.saveProcessing({
      attempts,
      nextAttemptAt: startedAt,
      projectId: material.projectId,
      sourceMaterialId: material.id,
      startedAt,
      status: "processing",
      userId: material.userId,
    });

    await this.repository.markStatus(material.id, "processing");

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
      const content = await this.extractor.extract({ material, bytes });
      const normalized = normalizeExtraction({
        bytes,
        content,
        chunkSize: this.chunkSize,
      });

      await this.repository.persistExtraction({
        material,
        chapters: normalized.chapters,
        chunks: normalized.chunks,
      });

      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();

      await this.repository.saveProcessing({
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

      await this.repository.markStatus(material.id, "processed");
    } catch (error) {
      await this.recordFailure({ material, attempts, error: error as Error });
    }
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
    const nextAttempts = attempts + 1;
    const shouldFail = nextAttempts >= this.maxAttempts;
    const delayMs = BASE_BACKOFF_MS * 2 ** attempts;
    const nextAttemptAt = shouldFail
      ? new Date()
      : new Date(Date.now() + delayMs);
    const status = shouldFail ? "failed" : "uploaded";

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

    await this.repository.saveProcessing({
      attempts: nextAttempts,
      lastError: error.message,
      nextAttemptAt,
      projectId: material.projectId,
      sourceMaterialId: material.id,
      status,
      userId: material.userId,
    });

    await this.repository.markStatus(material.id, status);
  }
}

export function createWorker(options?: {
  repository?: IngestionRepository;
  fetcher?: BlobFetcher;
  extractor?: SourceMaterialExtractor;
  chunkSize?: number;
  batchSize?: number;
  maxAttempts?: number;
}): SourceMaterialWorker {
  return new SourceMaterialWorker(options);
}

export { cleanText as normalizeTextContent };
export type { IngestionRepository, SourceMaterialExtractor, ExtractedContent };
