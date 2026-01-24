"use server";

import fs from "fs/promises";
import path from "path";
import { createAdminAction } from "@/lib/action-middleware";
import { retrieveContext } from "@/lib/ai/rag";
import { z } from "zod";

const searchDocsSchema = z.object({
	query: z.string(),
});

/**
 * Searches the documentation folder using in-memory RAG.
 */
export const searchDocsAction = createAdminAction({
	input: searchDocsSchema,
	handler: async ({ input: { query } }) => {
		const docsDir = path.join(process.cwd(), "docs");
		const files = await fs.readdir(docsDir);
		const mdFiles = files.filter((f) => f.endsWith(".md"));

		const chunks: { content: string; metadata: { file: string } }[] = [];

		for (const file of mdFiles) {
			const content = await fs.readFile(path.join(docsDir, file), "utf-8");
			// Split by headers or paragraphs. Simple split by double newline for now.
			const fileChunks = content.split("\n\n").filter((c) => c.trim().length > 50);
			
			for (const chunk of fileChunks) {
				chunks.push({
					content: chunk,
					metadata: { file },
				});
			}
		}

		const results = await retrieveContext({
			query,
			candidates: chunks,
			topK: 5,
		});

		return results.map((r) => ({
			file: r.metadata.file,
			content: r.content,
			similarity: r.similarity,
		}));
	},
});
