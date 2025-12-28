import { beforeEach, describe, expect, it, vi } from "vitest";
import { createScene } from "@/lib/db/queries/scene";
import { storyRepository } from "@/lib/db/repositories/story-repository";

const mocks = vi.hoisted(() => {
	const mockChain: any = {
		select: vi.fn(),
		from: vi.fn(),
		where: vi.fn(),
		orderBy: vi.fn(),
		limit: vi.fn(),
		offset: vi.fn(),
		insert: vi.fn(),
		values: vi.fn(),
		returning: vi.fn(),
		update: vi.fn(),
		set: vi.fn(),
		delete: vi.fn(),
		transaction: vi.fn((cb) => cb(mockChain)),
		// biome-ignore lint/suspicious/noThenProperty: Mocking thenable for Drizzle
then(onFulfilled: any, onRejected: any) {
			const currentResult =
				mockChain.results && mockChain.results.length > 0
					? mockChain.results.shift()
					: mockChain.result;

			const p = mockChain.error
				? Promise.reject(mockChain.error)
				: Promise.resolve(currentResult);

			return p.then(onFulfilled, onRejected);
		},
		result: [],
		results: null as any[] | null,
		error: null,
	};

	const methods = [
		"select",
		"from",
		"where",
		"orderBy",
		"limit",
		"offset",
		"insert",
		"values",
		"returning",
		"update",
		"set",
		"delete",
	];

	for (const method of methods) {
		mockChain[method].mockReturnValue(mockChain);
	}

	return mockChain;
});

vi.mock("@/lib/db/drizzle", () => ({
	db: mocks,
}));

vi.mock("drizzle-orm", () => ({
	asc: vi.fn(),
	desc: vi.fn(),
	eq: vi.fn(),
}));

vi.mock("@/lib/db/queries/scene", () => ({
	createScene: vi.fn(),
}));

describe("StoryRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.result = [];
		mocks.results = null;
		mocks.error = null;
	});

	describe("createBookFromPlan", () => {
		it("should create outline, volume, chapters and initial scene", async () => {
			const plan = {
				title: "Test Book",
				summary: "Summary",
				chapters: [
					{ title: "Ch 1", summary: "S1" },
					{ title: "Ch 2", summary: "S2" },
				],
			};

			mocks.results = [
				[{ id: "o1" }], // insert outline
				[{ id: "v1" }], // insert volume
				[], // insert chapters (batch)
				[{ id: "ch1" }], // select chapter 1
				[], // insert scene
			];

			const result = await storyRepository.createBookFromPlan(
				"p1",
				plan as any,
			);
			expect(result).toEqual({ outlineId: "o1", volumeId: "v1" });
			expect(mocks.transaction).toHaveBeenCalled();
			expect(mocks.insert).toHaveBeenCalledTimes(4); // outline, volume, chapters(batch), scene
		});
	});

	describe("getChapterWithScenes", () => {
		it("should return chapter when found", async () => {
			mocks.result = [{ id: "ch1" }];
			const result = await storyRepository.getChapterWithScenes("ch1");
			expect(result).toEqual({ id: "ch1" });
		});

		it("should throw error if chapter not found", async () => {
			mocks.result = [];
			await expect(storyRepository.getChapterWithScenes("ch1")).rejects.toThrow(
				"Chapter not found",
			);
		});
	});

	describe("createScenesBatch", () => {
		it("should create multiple scenes using batch insert", async () => {
			// Setup mock return for the batch insert
			mocks.results = [[{ id: "s1" }, { id: "s2" }]];

			const result = await storyRepository.createScenesBatch("p1", "ch1", [
				{ title: "S1", sequence: 1 },
				{ title: "S2", sequence: 2 },
			]);

			expect(result).toEqual(["s1", "s2"]);
			expect(mocks.insert).toHaveBeenCalledTimes(1);
			expect(mocks.values).toHaveBeenCalledWith(expect.any(Array));
			const valuesCall = mocks.values.mock.calls[0][0];
			expect(valuesCall).toHaveLength(2);
		});
	});

	describe("getSceneContextData", () => {
		it("should return full context for a scene", async () => {
			const mockScene = { id: "s1", chapterId: "ch1" };
			const mockChapter = { id: "ch1", outlineId: "o1" };
			const mockOutline = { id: "o1" };
			const mockScenes = [mockScene];

			mocks.results = [
				[mockScene], // 1. targetScene
				[mockChapter], // 2. targetChapter (via Promise.all)
				mockScenes, // 3. scenesInChapter (via Promise.all)
				[mockOutline], // 4. targetOutline
			];

			const result = await storyRepository.getSceneContextData("s1");
			expect(result.targetScene).toEqual(mockScene);
			expect(result.targetChapter).toEqual(mockChapter);
			expect(result.targetOutline).toEqual(mockOutline);
			expect(result.scenesInChapter).toEqual(mockScenes);
		});
	});

	describe("updateSceneContent", () => {
		it("should update scene content and status", async () => {
			mocks.result = [];
			await storyRepository.updateSceneContent("s1", "new content");
			expect(mocks.update).toHaveBeenCalled();
			expect(mocks.set).toHaveBeenCalledWith(
				expect.objectContaining({
					content: "new content",
					status: "drafting",
				}),
			);
		});
	});
});
