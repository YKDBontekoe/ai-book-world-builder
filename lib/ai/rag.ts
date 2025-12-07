import { gateway } from "@ai-sdk/gateway";
import { cosineSimilarity, embed, embedMany } from "ai";

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
    model: gateway.textEmbeddingModel("openai/text-embedding-3-small"),
    values: chunks,
  });
  return embeddings;
}

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
    model: gateway.textEmbeddingModel("openai/text-embedding-3-small"),
    value: query,
  });

  // 2. Embed candidates (caching strategies would be applied here in prod)
  // For this implementation, we assume candidates are already text.
  // Optimization: In a real scenario, we'd store pre-computed embeddings.
  const { embeddings: candidateEmbeddings } = await embedMany({
    model: gateway.textEmbeddingModel("openai/text-embedding-3-small"),
    values: candidates.map((c) => c.content),
  });

  // 3. Calculate similarity
  const results = candidates.map((candidate, i) => ({
    content: candidate.content,
    metadata: candidate.metadata || {},
    similarity: cosineSimilarity(queryEmbedding, candidateEmbeddings[i]),
  }));

  // 4. Sort and retrieval
  return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}
