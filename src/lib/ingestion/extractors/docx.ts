import { Buffer } from "node:buffer";
import { deriveHeadings } from "@/lib/ingestion/text";
import type { ExtractionStrategy } from "@/lib/ingestion/types";

export const docxExtractor: ExtractionStrategy = {
	mimeTypes: [
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	],
	async extract({ bytes }) {
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
	},
};
