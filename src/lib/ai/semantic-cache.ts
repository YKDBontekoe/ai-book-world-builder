import { list, put } from "@vercel/blob";
import { cosineSimilarity } from "ai";
import { and, eq } from "drizzle-orm";

import { generateEmbeddings } from "@/lib/ai/rag";
import { db } from "@/lib/db";
import { chapter, entity, scene, sceneCard } from "@/lib/db/schema";

// Types
export interface CacheElement {
	id: string;
	type: "scene" | "character" | "plot_point";
	content: string; // The text that was embedded
	embedding: number[];
	metadata: Record<string, unknown>;
	updatedAt: string; // ISO timestamp
}

export interface SemanticCache {
	version: string;
	elements: CacheElement[];
	lastSynced: string;
}

const CACHE_VERSION = "1.0";

export class SemanticCacheService {
	private getCachePath(projectId: string): string {
		return `projects/${projectId}/semantic-cache.json`;
	}

	/**
	 * Fetches the semantic cache from Blob storage.
	 */
	async getCache(projectId: string): Promise<SemanticCache | null> {
		try {
			const path = this.getCachePath(projectId);
			const { blobs } = await list({ prefix: path, limit: 1 });

			if (blobs.length === 0) {
				return null;
			}

			const response = await fetch(blobs[0].url);
			if (!response.ok) {
				throw new Error("Failed to fetch cache file");
			}

			const cache = (await response.json()) as SemanticCache;
			return cache;
		} catch (error) {
			console.warn("Failed to retrieve semantic cache:", error);
			return null;
		}
	}

	/**
	 * Saves the semantic cache to Blob storage.
	 */
	async saveCache(projectId: string, cache: SemanticCache): Promise<void> {
		try {
			const path = this.getCachePath(projectId);
			await put(path, JSON.stringify(cache), {
				access: "public",
				addRandomSuffix: false, // Overwrite existing file
				contentType: "application/json",
			});
		} catch (error) {
			console.error("Failed to save semantic cache:", error);
			// Don't throw, just log. We don't want to break the app if cache fails.
		}
	}

	/**
	 * Updates the semantic cache by syncing with the database.
	 * Only generates embeddings for new or modified items.
	 */
	async updateCache(projectId: string): Promise<SemanticCache> {
		let currentCache = await this.getCache(projectId);

		// Optimization: Avoid frequent re-syncs.
		// If cache is fresh (less than 5 minutes old), return it immediately.
		if (
			currentCache &&
			currentCache.version === CACHE_VERSION &&
			currentCache.lastSynced
		) {
			const lastSyncTime = new Date(currentCache.lastSynced).getTime();
			// 5 minutes TTL
			if (Date.now() - lastSyncTime < 5 * 60 * 1000) {
				return currentCache;
			}
		}

		if (!currentCache || currentCache.version !== CACHE_VERSION) {
			currentCache = {
				version: CACHE_VERSION,
				elements: [],
				lastSynced: new Date().toISOString(),
			};
		}

		// 1. Fetch current data from DB
		const [scenes, entities, chapters] = await Promise.all([
			this.fetchScenes(projectId),
			this.fetchEntities(projectId),
			this.fetchChapters(projectId),
		]);

		const newElements: CacheElement[] = [];
		const elementsToEmbed: { text: string; index: number }[] = [];
		const existingMap = new Map(currentCache.elements.map((e) => [e.id, e]));

		// Helper to process items
		const processItem = (
			id: string,
			type: CacheElement["type"],
			content: string,
			updatedAt: Date,
			metadata: Record<string, unknown>,
		) => {
			const existing = existingMap.get(id);
			const updatedAtIso = updatedAt.toISOString();

			// If exists and not updated, reuse
			if (
				existing &&
				existing.updatedAt === updatedAtIso &&
				existing.content === content
			) {
				newElements.push(existing);
				existingMap.delete(id); // Mark as used
			} else {
				// New or updated
				const newElement: CacheElement = {
					id,
					type,
					content,
					embedding: [], // Will fill later
					metadata,
					updatedAt: updatedAtIso,
				};
				newElements.push(newElement);
				elementsToEmbed.push({
					text: content,
					index: newElements.length - 1,
				});
			}
		};

		// Process Scenes
		for (const s of scenes) {
			const contentParts = [`Title: ${s.title}`];
			if (s.content) {
				const truncated = s.content.substring(0, 1000);
				const suffix = s.content.length > 1000 ? "..." : "";
				contentParts.push(`Content: ${truncated}${suffix}`);
			}
			// Use summary/card info if available
			if (s.card) {
				if (s.card.purpose) contentParts.push(`Purpose: ${s.card.purpose}`);
				if (s.card.setting) contentParts.push(`Setting: ${s.card.setting}`);
			}

			const text = contentParts.join("\n");
			processItem(s.id, "scene", text, s.updatedAt, {
				title: s.title,
				sequence: s.sequence,
			});
		}

		// Process Entities (Characters)
		for (const e of entities) {
			const text = `Character: ${e.name}\nSummary: ${e.summary || ""}`;
			processItem(e.id, "character", text, e.updatedAt, { name: e.name });
		}

		// Process Chapters (Plot Points)
		for (const c of chapters) {
			const text = `Chapter: ${c.title}\nNotes: ${c.notes || ""}`;
			processItem(c.id, "plot_point", text, c.updatedAt, { title: c.title });
		}

		// 2. Generate embeddings for new/updated items
		if (elementsToEmbed.length > 0) {
			// Chunking to avoid API limits if necessary, but generateEmbeddings handles array
			try {
				const embeddings = await generateEmbeddings(
					elementsToEmbed.map((e) => e.text),
				);

				elementsToEmbed.forEach((item, i) => {
					newElements[item.index].embedding = embeddings[i];
				});
			} catch (error) {
				console.error("Failed to generate embeddings:", error);
				// If embedding fails, return old cache or partial?
				// Maybe just return current cache to avoid saving corrupted state
				return currentCache;
			}
		}

		// 3. Update cache object
		currentCache.elements = newElements;
		currentCache.lastSynced = new Date().toISOString();

		// 4. Save if changes occurred (elementsToEmbed > 0 or items removed)
		if (elementsToEmbed.length > 0 || existingMap.size > 0) {
			await this.saveCache(projectId, currentCache);
		}

		return currentCache;
	}

	/**
	 * Finds relevant elements in the cache based on semantic similarity.
	 */
	async findRelevant(
		query: string,
		cache: SemanticCache,
		topK = 5,
		minSimilarity = 0.3,
	): Promise<CacheElement[]> {
		if (!cache.elements.length) return [];

		try {
			// Generate embedding for query
			const [queryEmbedding] = await generateEmbeddings([query]);

			// Calculate similarity
			const scored = cache.elements
				.map((el) => ({
					...el,
					similarity: cosineSimilarity(queryEmbedding, el.embedding),
				}))
				.filter((el) => el.similarity >= minSimilarity)
				.sort((a, b) => b.similarity - a.similarity);

			return scored.slice(0, topK);
		} catch (error) {
			console.error("Failed to find relevant items:", error);
			return [];
		}
	}

	// --- DB Fetch Helpers ---

	private async fetchScenes(projectId: string) {
		const result = await db
			.select({
				id: scene.id,
				title: scene.title,
				content: scene.content,
				sequence: scene.sequence,
				updatedAt: scene.updatedAt,
				card: {
					purpose: sceneCard.purpose,
					setting: sceneCard.setting,
				},
			})
			.from(scene)
			.leftJoin(sceneCard, eq(scene.id, sceneCard.sceneId))
			.where(eq(scene.projectId, projectId));
		return result;
	}

	private async fetchEntities(projectId: string) {
		return await db
			.select()
			.from(entity)
			.where(
				and(eq(entity.projectId, projectId), eq(entity.kind, "character")),
			);
	}

	private async fetchChapters(projectId: string) {
		return await db
			.select()
			.from(chapter)
			.where(eq(chapter.projectId, projectId));
	}
}

export const semanticCache = new SemanticCacheService();
