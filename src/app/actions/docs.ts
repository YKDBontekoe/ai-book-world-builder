"use server";

import fs from "fs/promises";
import path from "path";
import { createAdminAction } from "@/lib/action-middleware";
import { retrieveContext } from "@/lib/ai/rag";
import { getMarkdownFiles } from "@/lib/docs-utils";
import { z } from "zod";

const searchDocsSchema = z.object({
	query: z.string().trim().min(3).max(100),
});

/**
 * Searches the documentation folder using in-memory RAG.
 */
export const searchDocsAction = createAdminAction({
	input: searchDocsSchema,
	handler: async ({
		input: { query },
	}): Promise<{ file: string; content: string; similarity: number }[]> => {
		const docsDir = path.join(process.cwd(), "docs");
		let mdFiles: string[] = [];
		try {
			mdFiles = await getMarkdownFiles(docsDir);
		} catch (error) {
			console.warn("Docs directory not found or inaccessible:", error);
			return [];
		}

		const chunks: { content: string; metadata: { file: string } }[] = [];

		for (const file of mdFiles) {
			const content = await fs.readFile(file, "utf-8");
			// Split by headers or paragraphs. Simple split by double newline for now.
			const fileChunks = content
				.split("\n\n")
				.filter((c) => c.trim().length > 50);

			const relativePath = path.relative(process.cwd(), file);

			for (const chunk of fileChunks) {
				chunks.push({
					content: chunk,
					metadata: { file: relativePath },
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
