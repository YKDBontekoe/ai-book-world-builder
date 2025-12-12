import { Buffer } from "node:buffer";

import JSZip from "jszip";

import type { ExtractionStrategy } from "../types";
import { deriveHeadings, stripHtml } from "../text";

export const epubExtractor: ExtractionStrategy = {
  mimeTypes: ["application/epub+zip"],
  async extract({ bytes }) {
    const zip = await new JSZip().loadAsync(Buffer.from(bytes));
    const htmlFiles = Object.keys(zip.files).filter(
      (fileName) =>
        fileName.toLowerCase().endsWith(".xhtml") ||
        fileName.toLowerCase().endsWith(".html")
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
  },
};
