import { Buffer } from "node:buffer";

import type { ExtractionStrategy } from "@/lib/ingestion/types";
import { deriveHeadings } from "@/lib/ingestion/text";

export const pdfExtractor: ExtractionStrategy = {
  mimeTypes: ["application/pdf"],
  async extract({ bytes }) {
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
  },
};
