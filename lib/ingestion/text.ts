import { supportedSourceMaterialMimeTypes } from "@/lib/source-materials";

export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[\t ]+\n/g, "\n")
    .trim();
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function splitIntoChunks(text: string, chunkSize: number): string[] {
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

export function deriveHeadings(text: string): string[] {
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

export function assertSupportedMimeType(mimeType: string): void {
  const normalizedMime = mimeType.toLowerCase();

  if (!supportedSourceMaterialMimeTypes.has(normalizedMime)) {
    throw new Error(`Unsupported MIME type: ${normalizedMime}`);
  }
}
