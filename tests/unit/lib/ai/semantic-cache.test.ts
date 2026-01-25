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
		vi.stubGlobal("fetch", vi.fn());
		vi.spyOn(console, "warn").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	describe("getCache", () => {
		it("should return null if no cache exists", async () => {
			vi.mocked(blob.list).mockResolvedValue({
				blobs: [],
				cursor: "",
				hasMore: false,
			});

			const result = await semanticCache.getCache(projectId);
			expect(result).toBeNull();
		});

		it("should fetch and parse cache if it exists, picking the latest", async () => {
			const mockCache: SemanticCache = {
				version: "1.0",
				elements: [],
				lastSynced: new Date().toISOString(),
			};

			// Mock multiple blobs
			vi.mocked(blob.list).mockResolvedValue({
				blobs: [
					{
						url: "old_url",
						uploadedAt: new Date(Date.now() - 10000),
						pathname: "",
						size: 0,
						downloadUrl: "",
					},
					{
						url: "new_url",
						uploadedAt: new Date(Date.now()),
						pathname: "",
						size: 0,
						downloadUrl: "",
					},
				],
				cursor: "",
				hasMore: false,
			});

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: async () => mockCache,
			} as Response);

			const result = await semanticCache.getCache(projectId);
			expect(result).toEqual(mockCache);
			expect(fetch).toHaveBeenCalledWith("new_url");
		});

		it("should return null if schema validation fails", async () => {
			vi.mocked(blob.list).mockResolvedValue({
				blobs: [
					{
						url: "url",
						uploadedAt: new Date(),
						pathname: "",
						size: 0,
						downloadUrl: "",
					},
				],
				cursor: "",
				hasMore: false,
			});

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: async () => ({ invalid: "data" }),
			} as Response);

			const result = await semanticCache.getCache(projectId);
			expect(result).toBeNull();
		});
	});

	describe("saveCache", () => {
		it("should call put with correct arguments and clean up old blobs", async () => {
			const mockCache: SemanticCache = {
				version: "1.0",
				elements: [],
				lastSynced: new Date().toISOString(),
			};

			// Mock list for cleanup
			vi.mocked(blob.list).mockResolvedValue({
				blobs: [
					{
						url: "keep_me",
						uploadedAt: new Date(),
						pathname: "",
						size: 0,
						downloadUrl: "",
					},
					{
						url: "delete_me",
						uploadedAt: new Date(Date.now() - 10000),
						pathname: "",
						size: 0,
						downloadUrl: "",
					},
				],
				cursor: "",
				hasMore: false,
			});

			await semanticCache.saveCache(projectId, mockCache);

			expect(blob.put).toHaveBeenCalledWith(
				`projects/${projectId}/semantic-cache.json`,
				JSON.stringify(mockCache),
				expect.objectContaining({
					access: "public",
					addRandomSuffix: true,
					contentType: "application/json",
				}),
			);

			// Should delete the older blob
			expect(blob.del).toHaveBeenCalledWith(["delete_me"]);
		});
	});

	describe("updateCache", () => {
		it("should create new cache if none exists", async () => {
			// Mock getCache returning null
			vi.mocked(blob.list).mockResolvedValue({
				blobs: [],
				cursor: "",
				hasMore: false,
			});

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

			// Mock DB chains explicitly
			const sceneChain = {
				from: vi.fn().mockReturnThis(),
				leftJoin: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockScenes),
			};
			const entityChain = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockEntities),
			};
			const chapterChain = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockChapters),
			};

			vi.mocked(db.select).mockImplementation(() => {
				// This is a bit tricky since we return a chain.
				// We can return a generic mock that returns different values based on call order or inspection.
				// Or use `mockImplementationOnce`.
				return sceneChain as any;
			});

			// Re-mock implementation to return different chains on subsequent calls
			const selectMock = vi.mocked(db.select);
			selectMock.mockReset();
			selectMock
				.mockReturnValueOnce(sceneChain as any)
				.mockReturnValueOnce(entityChain as any)
				.mockReturnValueOnce(chapterChain as any);

			// Mock embeddings
			vi.mocked(rag.generateEmbeddings).mockResolvedValue([
				[0.1, 0.2], // For Scene
				[0.3, 0.4], // For Entity
				[0.5, 0.6], // For Chapter
			]);

			const result = await semanticCache.updateCache(projectId);

			expect(result.elements).toHaveLength(3);
			expect(result.elements[0].type).toBe("scene");
			expect(blob.put).toHaveBeenCalled();
		});

		it("should not re-embed if item is unchanged (TTL check)", async () => {
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
				lastSynced: now.toISOString(), // Very fresh
			};

			// Mock getCache
			vi.mocked(blob.list).mockResolvedValue({
				blobs: [
					{
						url: "url",
						uploadedAt: now,
						pathname: "",
						size: 0,
						downloadUrl: "",
					},
				],
				cursor: "",
				hasMore: false,
			});
			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: async () => mockCache,
			} as Response);

			await semanticCache.updateCache(projectId);

			// Should return early due to TTL
			expect(db.select).not.toHaveBeenCalled();
			expect(rag.generateEmbeddings).not.toHaveBeenCalled();
		});
	});

	describe("findRelevant", () => {
		const mockCache: SemanticCache = {
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

		it("should return relevant items", async () => {
			vi.mocked(rag.generateEmbeddings).mockResolvedValue([[0.9, 0.1]]);

			const result = await semanticCache.findRelevant("query", mockCache, 1);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe("1");
		});

		it("should return empty array if cache is empty", async () => {
			vi.mocked(rag.generateEmbeddings).mockResolvedValue([[1, 0]]);
			const emptyCache: SemanticCache = { ...mockCache, elements: [] };

			const result = await semanticCache.findRelevant("query", emptyCache);
			expect(result).toEqual([]);
		});

		it("should return empty array if no items meet minSimilarity", async () => {
			// Query is [0, 1], items are [1, 0]. Cosine sim is 0.
			vi.mocked(rag.generateEmbeddings).mockResolvedValue([[0, 1]]);

			// Item 1: [1, 0] -> sim 0
			// Item 2: [0, 1] -> sim 1
			// Wait, let's make query orthogonal to both if possible or just rely on threshold.
			// Let's use [0, -1].
			// Item 1 [1, 0] * [0, -1] = 0.
			// Item 2 [0, 1] * [0, -1] = -1.

			vi.mocked(rag.generateEmbeddings).mockResolvedValue([[0, -1]]);

			const result = await semanticCache.findRelevant(
				"query",
				mockCache,
				5,
				0.5,
			); // minSim 0.5
			expect(result).toEqual([]);
		});

		it("should return empty array if embedding generation fails", async () => {
			vi.mocked(rag.generateEmbeddings).mockRejectedValue(
				new Error("API Error"),
			);

			const result = await semanticCache.findRelevant("query", mockCache);
			expect(result).toEqual([]);
		});
	});
});
