import type {
	NewSourceMaterialChapter,
	NewSourceMaterialChunk,
} from "@/lib/db/schema";
import { deriveHeadings, normalizeTextContent } from "@/lib/ingestion/text";

import type {
	ExtractedContent,
	NormalizedExtraction,
} from "@/lib/ingestion/types";
import { generateUUID } from "@/lib/utils";

export const DEFAULT_CHUNK_SIZE = 1200;

export function splitIntoChunks(text: string, chunkSize: number): string[] {
	if (!text) return [];

	const normalized = normalizeTextContent(text);
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

export function buildChaptersAndChunks({
	text,
	headings,
	chunkSize,
}: {
	text: string;
	headings: string[];
	chunkSize: number;
}): { chapters: NewSourceMaterialChapter[]; chunks: NewSourceMaterialChunk[] } {
	const normalized = normalizeTextContent(text);

	if (!normalized) {
		return { chapters: [], chunks: [] };
	}

	const derivedHeadings =
		headings.length > 0 ? headings : deriveHeadings(normalized);

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

export function normalizeExtraction({
	bytes,
	content,
	chunkSize,
}: {
	bytes: ArrayBuffer;
	content: ExtractedContent;
	chunkSize: number;
}): NormalizedExtraction {
	const { chapters, chunks } = buildChaptersAndChunks({
		text: content.text,
		headings: content.headings,
		chunkSize,
	});

	const normalizedText = normalizeTextContent(content.text);

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
