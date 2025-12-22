import type { ExtractionStrategy } from "../types";
import { deriveHeadings } from "../text";

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
