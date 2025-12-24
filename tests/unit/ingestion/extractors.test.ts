import { describe, expect, it } from "vitest";

import {
	createDefaultExtractorRegistry,
	ExtractorRegistry,
} from "@/lib/ingestion/extractors";
import type { ExtractionStrategy } from "@/lib/ingestion/types";

const fakeStrategy: ExtractionStrategy = {
	mimeTypes: ["text/plain"],
	async extract() {
		return { text: "content", headings: [] };
	},
};

describe("ExtractorRegistry", () => {
	it("returns a registered strategy by mime type", async () => {
		const registry = new ExtractorRegistry();
		registry.register(fakeStrategy);

		const extractor = registry.resolve("text/plain");
		const result = await extractor.extract({
			bytes: new ArrayBuffer(0),
			material: {
				id: "material-1",
				createdAt: new Date(),
				updatedAt: new Date(),
				filename: "file.txt",
				mimeType: "text/plain",
				size: 1,
				status: "uploaded",
				blobUrl: "http://example.com/blob",
				projectId: "project-1",
				userId: "user-1",
			},
		});

		expect(result.text).toBe("content");
	});

	it("throws for unsupported mime types", () => {
		const registry = createDefaultExtractorRegistry();
		expect(() => registry.resolve("application/unknown" as any)).toThrow(
			/Unsupported MIME type/,
		);
	});
});
