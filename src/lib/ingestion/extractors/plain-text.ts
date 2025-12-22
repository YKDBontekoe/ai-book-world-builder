import type { ExtractionStrategy } from "@/lib/ingestion/types";
import { deriveHeadings } from "@/lib/ingestion/text";

export const plainTextExtractor: ExtractionStrategy = {
  mimeTypes: ["text/plain"],
  async extract({ bytes }) {
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return {
      text,
      headings: deriveHeadings(text),
    };
  },
};
