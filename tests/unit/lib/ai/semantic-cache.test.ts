import * as blob from "@vercel/blob";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as rag from "@/lib/ai/rag";
import { type SemanticCache, semanticCache } from "@/lib/ai/semantic-cache";
import { db } from "@/lib/db";

// Mock dependencies
vi.mock("@vercel/blob");
vi.mock("@/lib/ai/rag");
vi.mock("@/lib/db", () => {
	const mockChain = {
		from: vi.fn().mockReturnThis(),
		leftJoin: vi.fn().mockReturnThis(),
		where: vi.fn().mockResolvedValue([]),
	};
	return {
		db: {
			select: vi.fn(() => mockChain),
		},
	};
});

describe("SemanticCacheService", () => {
	const projectId = "project-123";

	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("getCache", () => {
		it("should return null if no cache exists", async () => {
			(blob.list as any).mockResolvedValue({ blobs: [] });

			const result = await semanticCache.getCache(projectId);
			expect(result).toBeNull();
		});

		it("should fetch and parse cache if it exists", async () => {
			const mockCache: SemanticCache = {
				version: "1.0",
				elements: [],
				lastSynced: new Date().toISOString(),
			};

			(blob.list as any).mockResolvedValue({
				blobs: [{ url: "https://blob.url/cache.json" }],
			});

			(global.fetch as any).mockResolvedValue({
				ok: true,
				json: async () => mockCache,
			});

			const result = await semanticCache.getCache(projectId);
			expect(result).toEqual(mockCache);
			expect(global.fetch).toHaveBeenCalledWith("https://blob.url/cache.json");
		});
	});

	describe("saveCache", () => {
		it("should call put with correct arguments", async () => {
			const mockCache: SemanticCache = {
				version: "1.0",
				elements: [],
				lastSynced: new Date().toISOString(),
			};

			await semanticCache.saveCache(projectId, mockCache);

			expect(blob.put).toHaveBeenCalledWith(
				`projects/${projectId}/semantic-cache.json`,
				JSON.stringify(mockCache),
				expect.objectContaining({
					access: "public",
					contentType: "application/json",
				}),
			);
		});
	});

	describe("updateCache", () => {
		it("should create new cache if none exists", async () => {
			// Mock getCache returning null
			(blob.list as any).mockResolvedValue({ blobs: [] });

			// Mock DB returns
			const mockScenes = [
				{
					id: "s1",
					title: "S1",
					updatedAt: new Date(),
					content: "Scene content",
				},
			];
			const mockEntities = [
				{ id: "c1", name: "Char1", updatedAt: new Date(), kind: "character" },
			];
			const mockChapters = [
				{ id: "ch1", title: "Chap1", updatedAt: new Date() },
			];

			// Mock DB chain logic specifically for this test
			// We can use a spy or just rely on the order of calls if we knew them,
			// but since they run in Promise.all, order is not guaranteed.
			// Instead, we can inspect the `from` calls if we care, but simpler is to mock the `where` return values based on call.
			// Since `vi.mock` factory is hoisted, we access the chain object via the mock.

			// Actually, let's just make `where` return all of them combined or use `mockImplementationOnce` on the chain object if possible.
			// But `db.select()` returns the *same* chain object in our simple mock.
			// So `where` will be called 3 times.

			const chain = (db.select as any)();
			chain.where
				.mockResolvedValueOnce(mockScenes)
				.mockResolvedValueOnce(mockEntities)
				.mockResolvedValueOnce(mockChapters);

			// Mock embeddings
			(rag.generateEmbeddings as any).mockResolvedValue([
				[0.1, 0.2], // For Scene
				[0.3, 0.4], // For Entity
				[0.5, 0.6], // For Chapter
			]);

			const result = await semanticCache.updateCache(projectId);

			expect(result.elements).toHaveLength(3);
			expect(result.elements[0].type).toBe("scene");
			expect(result.elements[0].embedding).toEqual([0.1, 0.2]);

			expect(blob.put).toHaveBeenCalled();
		});

		it("should not re-embed if item is unchanged", async () => {
			const now = new Date();
			const existingElement = {
				id: "s1",
				type: "scene" as const,
				content: "Title: S1\nContent: Scene content...",
				embedding: [0.1, 0.2],
				metadata: { title: "S1" },
				updatedAt: now.toISOString(),
			};

			const mockCache: SemanticCache = {
				version: "1.0",
				elements: [existingElement],
				// Set lastSynced to > 5 minutes ago to bypass TTL check
				lastSynced: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
			};

			// Mock getCache
			(blob.list as any).mockResolvedValue({
				blobs: [{ url: "url" }],
			});
			(global.fetch as any).mockResolvedValue({
				ok: true,
				json: async () => mockCache,
			});

			// Mock DB returns same data
			const mockScenes = [
				{
					id: "s1",
					title: "S1",
					updatedAt: now,
					content: "Scene content...",
					sequence: 1,
				},
			];

			const chain = (db.select as any)();
			chain.where
				.mockResolvedValueOnce(mockScenes) // Scenes
				.mockResolvedValueOnce([]) // Entities
				.mockResolvedValueOnce([]); // Chapters

			await semanticCache.updateCache(projectId);

			// Should not generate embeddings
			expect(rag.generateEmbeddings).not.toHaveBeenCalled();
			// Should not save since nothing changed (assuming logic optimization)
			// Wait, my implementation saves if `elementsToEmbed.length > 0 || existingMap.size > 0`.
			// If existingMap.size > 0, it means some items were REMOVED.
			// Here existingMap will be empty because 's1' was found and reused.
			expect(blob.put).not.toHaveBeenCalled();
		});
	});

	describe("findRelevant", () => {
		it("should return relevant items", async () => {
			const cache: SemanticCache = {
				version: "1.0",
				lastSynced: "",
				elements: [
					{
						id: "1",
						type: "scene",
						content: "A",
						embedding: [1, 0],
						metadata: {},
						updatedAt: "",
					},
					{
						id: "2",
						type: "scene",
						content: "B",
						embedding: [0, 1],
						metadata: {},
						updatedAt: "",
					},
				],
			};

			// Query embedding close to [1, 0]
			(rag.generateEmbeddings as any).mockResolvedValue([[0.9, 0.1]]);

			const result = await semanticCache.findRelevant("query", cache, 1);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe("1");
		});
	});
});
