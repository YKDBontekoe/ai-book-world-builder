import { cosineSimilarity, embed, embedMany } from "ai";
import { openrouter } from "@/lib/ai/providers";

export type RAGChunk = {
	content: string;
	metadata: Record<string, unknown>;
	similarity: number;
};

/**
 * Generates embeddings for a list of text chunks.
 */
export async function generateEmbeddings(chunks: string[]) {
	const { embeddings } = await embedMany({
		model: openrouter.embedding("openai/text-embedding-3-small"),
		values: chunks,
	});
	return embeddings;
}

const embeddingCache = new Map<string, number[]>();

/**
 * Simple in-memory RAG for the current session context.
 * In a production app, this would query a vector DB.
 * For now, we "flood" the context window of long-context models (Gemini 3 Pro).
 */
export async function retrieveContext({
	query,
	candidates,
	topK = 5,
}: {
	query: string;
	candidates: { content: string; metadata?: Record<string, unknown> }[];
	topK?: number;
}): Promise<RAGChunk[]> {
	// 1. Embed query
	const { embedding: queryEmbedding } = await embed({
		model: openrouter.embedding("openai/text-embedding-3-small"),
		value: query,
	});

	// 2. Embed candidates with caching
	const embeddings: number[][] = [];
	const missIndices: number[] = [];
	const missValues: string[] = [];

	// Check cache first
	candidates.forEach((candidate, index) => {
		const cached = embeddingCache.get(candidate.content);
		if (cached) {
			embeddings[index] = cached;
		} else {
			missIndices.push(index);
			missValues.push(candidate.content);
		}
	});

	// Fetch missing embeddings in one batch
	if (missValues.length > 0) {
		const { embeddings: newEmbeddings } = await embedMany({
			model: openrouter.embedding("openai/text-embedding-3-small"),
			values: missValues,
		});

		newEmbeddings.forEach((emb, i) => {
			const originalIndex = missIndices[i];
			const content = missValues[i];
			embeddingCache.set(content, emb);
			embeddings[originalIndex] = emb;
		});
	}

	// 3. Calculate similarity
	const results = candidates.map((candidate, i) => ({
		content: candidate.content,
		metadata: candidate.metadata || {},
		similarity: cosineSimilarity(queryEmbedding, embeddings[i]),
	}));

	// 4. Sort and retrieval
	return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}
