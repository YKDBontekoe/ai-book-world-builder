import { del, list, put } from "@vercel/blob";
import { cosineSimilarity } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { generateEmbeddings } from "@/lib/ai/rag";
import { db } from "@/lib/db";
import { chapter, entity, scene, sceneCard } from "@/lib/db/schema";

// Constants
const CACHE_VERSION = "1.0";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Zod Schemas
export const CacheElementSchema = z.object({
	id: z.string(),
	type: z.enum(["scene", "character", "plot_point"]),
	content: z.string(),
	embedding: z.array(z.number()),
	metadata: z.record(z.string(), z.unknown()),
	updatedAt: z.string(),
});

export const SemanticCacheSchema = z.object({
	version: z.string(),
	elements: z.array(CacheElementSchema),
	lastSynced: z.string(),
});

export type CacheElement = z.infer<typeof CacheElementSchema>;
export type SemanticCache = z.infer<typeof SemanticCacheSchema>;

/**
 * Manages the persistent semantic cache for a project using Vercel Blob storage.
 *
 * Architecture:
 * - **Storage**: JSON file stored in Blob (`projects/{projectId}/semantic-cache.json`).
 * - **Content**: Embeddings for Scenes, Characters, and Chapters.
 * - **Sync Strategy**: "Lazy Sync". Checks `updatedAt` timestamps in DB against the cache
 *   to only re-embed modified items.
 * - **Obscurity**: Uses `addRandomSuffix: true` for Blob URLs to prevent enumeration,
 *   relying on `list()` to find the latest version.
 */
export class SemanticCacheService {
	private getCachePrefix(projectId: string): string {
		return `projects/${projectId}/semantic-cache.json`;
	}

	/**
	 * Fetches the semantic cache from Blob storage.
	 * Returns the latest cache if multiple exist.
	 */
	async getCache(projectId: string): Promise<SemanticCache | null> {
		try {
			const path = this.getCachePrefix(projectId);
			// List all blobs with this prefix
			const { blobs } = await list({ prefix: path });

			if (blobs.length === 0) {
				return null;
			}

			// Sort by uploadedAt descending (newest first)
			const sortedBlobs = blobs.sort(
				(a, b) =>
					new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
			);
			const latestBlob = sortedBlobs[0];

			const response = await fetch(latestBlob.url);
			if (!response.ok) {
				throw new Error("Failed to fetch cache file");
			}

			const raw = await response.json();
			const parsed = SemanticCacheSchema.safeParse(raw);

			if (!parsed.success) {
				console.warn(
					"Semantic cache schema mismatch:",
					JSON.stringify(parsed.error.issues, null, 2),
				);
				return null;
			}

			return parsed.data;
		} catch (error) {
			console.warn("Failed to retrieve semantic cache:", error);
			return null;
		}
	}

	/**
	 * Saves the semantic cache to Blob storage.
	 * Uses addRandomSuffix: true for obscurity.
	 * Cleans up old blobs to prevent clutter.
	 */
	async saveCache(projectId: string, cache: SemanticCache): Promise<void> {
		try {
			const path = this.getCachePrefix(projectId);
			const cacheString = JSON.stringify(cache);

			// 1. Upload new cache with random suffix for obscurity
			await put(path, cacheString, {
				access: "public",
				addRandomSuffix: true, // Non-deterministic URL
				contentType: "application/json",
			});

			// 2. Clean up old blobs (fire and forget)
			// We list again to find everything except the one we just uploaded?
			// Actually put returns the new blob.
			// Let's do it simply: list all, sort, keep latest 1 or 2, delete rest.
			this.cleanupOldCaches(projectId).catch((err) =>
				console.error("Failed to cleanup old caches:", err),
			);
		} catch (error) {
			console.error("Failed to save semantic cache:", error);
		}
	}

	private async cleanupOldCaches(projectId: string) {
		const path = this.getCachePrefix(projectId);
		const { blobs } = await list({ prefix: path });

		if (blobs.length <= 1) return;

		// Sort by date descending
		const sortedBlobs = blobs.sort(
			(a, b) =>
				new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
		);

		// Keep the newest one, delete the rest
		const toDelete = sortedBlobs.slice(1).map((b) => b.url);

		if (toDelete.length > 0) {
			await del(toDelete);
		}
	}

	/**
	 * Updates the semantic cache by syncing with the database.
	 * Only generates embeddings for new or modified items.
	 */
	async updateCache(projectId: string): Promise<SemanticCache> {
		let currentCache = await this.getCache(projectId);

		// Optimization: Avoid frequent re-syncs.
		if (
			currentCache &&
			currentCache.version === CACHE_VERSION &&
			currentCache.lastSynced
		) {
			const lastSyncTime = new Date(currentCache.lastSynced).getTime();
			if (Date.now() - lastSyncTime < CACHE_TTL_MS) {
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
