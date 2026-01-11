import { beforeEach, describe, expect, it, vi } from "vitest";
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

vi.mock("@/lib/db", () => ({
	db: mocks,
}));

vi.mock("drizzle-orm", () => ({
	asc: vi.fn(),
	desc: vi.fn(),
	eq: vi.fn(),
}));

describe("StoryRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.result = [];
		mocks.results = null;
		mocks.error = null;
	});

	describe("createBookFromPlan", () => {
		const plan = {
			title: "Test Book",
			summary: "Summary",
			chapters: [{ title: "Ch 1", summary: "S1" }],
		};

		it("should create book structure successfully", async () => {
			mocks.results = [
				[{ id: "o1" }], // insert outline
				[{ id: "v1" }], // insert volume
				[], // insert chapters (batch)
				[{ id: "ch1" }], // select chapter 1
				[], // insert scene
			];

			const result = await storyRepository.createBookFromPlan("p1", plan as any);
			expect(result).toEqual({ outlineId: "o1", volumeId: "v1" });
			expect(mocks.insert).toHaveBeenCalledTimes(4);
		});

		it("should use provided style", async () => {
			mocks.results = [
				[{ id: "o1" }], [{ id: "v1" }], [], [{ id: "ch1" }], [],
			];
			const style = { pov: "First Person", tone: "Dark" };
			await storyRepository.createBookFromPlan("p1", plan as any, style as any);
			expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({
				pov: "First Person",
				tone: "Dark"
			}));
		});

		it("should handle empty chapters plan", async () => {
			const emptyPlan = { ...plan, chapters: [] };
			mocks.results = [
				[{ id: "o1" }], [{ id: "v1" }],
				// no chapters insert
				[], // select chapter 1 (none)
			];
			const result = await storyRepository.createBookFromPlan("p1", emptyPlan as any);
			expect(result).toEqual({ outlineId: "o1", volumeId: "v1" });
			expect(mocks.insert).toHaveBeenCalledTimes(2); // outline, volume
		});

		it("should handle missing chapter1 when creating scene", async () => {
			mocks.results = [
				[{ id: "o1" }], [{ id: "v1" }], [],
				[], // select chapter 1 (returns nothing)
			];
			await storyRepository.createBookFromPlan("p1", plan as any);
			expect(mocks.insert).toHaveBeenCalledTimes(3); // no scene insert
		});

		it("should throw on failure", async () => {
			mocks.error = new Error("DB Fail");
			await expect(storyRepository.createBookFromPlan("p1", plan as any)).rejects.toThrow("DB Fail");
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
			await expect(storyRepository.getChapterWithScenes("ch1")).rejects.toThrow("Chapter not found");
		});
	});

	describe("getLastSceneInChapter", () => {
		it("should return last scene", async () => {
			const mockScene = { id: "s1", sequence: 10 };
			mocks.result = [mockScene];
			const result = await storyRepository.getLastSceneInChapter("ch1");
			expect(result).toEqual(mockScene);
		});

		it("should return undefined if no scenes", async () => {
			mocks.result = [];
			const result = await storyRepository.getLastSceneInChapter("ch1");
			expect(result).toBeUndefined();
		});
	});

	describe("createScenesBatch", () => {
		it("should return empty array if no scenesData", async () => {
			const result = await storyRepository.createScenesBatch("p1", "ch1", []);
			expect(result).toEqual([]);
			expect(mocks.insert).not.toHaveBeenCalled();
		});

		it("should create multiple scenes", async () => {
			mocks.results = [[{ id: "s1" }, { id: "s2" }]];
			const result = await storyRepository.createScenesBatch("p1", "ch1", [
				{ title: "S1", sequence: 1 },
				{ title: "S2", sequence: 2 },
			]);
			expect(result).toEqual(["s1", "s2"]);
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
				[mockChapter], // 2. targetChapter
				mockScenes, // 3. scenesInChapter
				[mockOutline], // 4. targetOutline
			];

			const result = await storyRepository.getSceneContextData("s1");
			expect(result.targetScene).toEqual(mockScene);
			expect(result.targetChapter).toEqual(mockChapter);
			expect(result.targetOutline).toEqual(mockOutline);
			expect(result.scenesInChapter).toEqual(mockScenes);
		});

		it("should throw if scene not found", async () => {
			mocks.result = [];
			await expect(storyRepository.getSceneContextData("s1")).rejects.toThrow("Scene not found");
		});

		it("should throw if chapter not found", async () => {
			mocks.results = [
				[{ id: "s1", chapterId: "ch1" }], // targetScene
				[], // targetChapter (Promise.all 1)
				[], // scenesInChapter (Promise.all 2)
			];
			await expect(storyRepository.getSceneContextData("s1")).rejects.toThrow("Chapter not found");
		});
	});

	describe("updateSceneContent", () => {
		it("should update scene content and status", async () => {
			mocks.result = [];
			await storyRepository.updateSceneContent("s1", "new content");
			expect(mocks.update).toHaveBeenCalled();
		});
	});
});