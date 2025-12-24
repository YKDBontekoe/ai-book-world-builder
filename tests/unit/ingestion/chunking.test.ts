import { describe, expect, it } from "vitest";

import {
	buildChaptersAndChunks,
	splitIntoChunks,
} from "@/lib/ingestion/chunking";
import { deriveHeadings, normalizeTextContent } from "@/lib/ingestion/text";

const sampleText = `# Chapter 1
This is a paragraph that should be split into smaller chunks for processing.`;

describe("chunking utilities", () => {
	it("splits text into bounded chunks", () => {
		const chunks = splitIntoChunks("hello world from the worker", 10);
		expect(chunks).toHaveLength(4);
		expect(chunks.every((chunk) => chunk.length <= 10)).toBe(true);
		expect(chunks[0]).toBe("hello");
	});

	it("produces chapters and chunks with derived headings", () => {
		const { chapters, chunks } = buildChaptersAndChunks({
			text: sampleText,
			headings: [],
			chunkSize: 30,
		});

		expect(chapters).toHaveLength(1);
		expect(chapters[0]?.title).toBe("Chapter 1");
		expect(chapters[0]?.headings).toContain("Chapter 1");
		expect(chunks.length).toBeGreaterThan(1);
	});
});

describe("text normalization", () => {
	it("cleans control characters and trailing whitespace", () => {
		const dirty = "Line one\r\nLine two\u0000\n\n";
		expect(normalizeTextContent(dirty)).toBe("Line one\nLine two");
	});

	it("extracts headings from markdown and numbered chapters", () => {
		const headings = deriveHeadings("## Intro\nChapter 2: Basics\nBody");
		expect(headings).toEqual(["Intro", "Basics"]);
	});
});
