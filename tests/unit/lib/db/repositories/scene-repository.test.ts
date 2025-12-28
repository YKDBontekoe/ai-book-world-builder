import { beforeEach, describe, expect, it, vi } from "vitest";
import { sceneRepository } from "@/lib/db/repositories/scene-repository";
import { DatabaseError, NotFoundError } from "@/lib/errors";

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
		_then: vi.fn(), // Internal thenable for async resolution
		result: [],
		error: null,
	};

	// Mock the thenable behavior for promise-like chaining
	// biome-ignore lint/suspicious/noThenProperty: Mocking a promise
	mockChain.then = async function (resolve: any, reject: any) {
		if (mockChain.error) {
			if (reject) {
				return reject(mockChain.error);
			}
			throw mockChain.error;
		}
		if (resolve) {
			return resolve(mockChain.result);
		}
		return mockChain.result;
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
	sql: vi.fn(),
}));

describe("SceneRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.result = [];
		mocks.error = null;
	});

	describe("findById", () => {
		it("should return a scene when found", async () => {
			const mockScene = { id: "s1", title: "Scene 1" };
			mocks.result = [mockScene];

			const result = await sceneRepository.findById("s1");
			expect(result).toEqual(mockScene);
		});

		it("should return null when not found", async () => {
			mocks.result = [];
			const result = await sceneRepository.findById("s1");
			expect(result).toBeNull();
		});
	});

	describe("findByChapter", () => {
		it("should return scenes for a chapter", async () => {
			const mockScenes = [{ id: "s1", chapterId: "c1" }];
			mocks.result = mockScenes;

			const result = await sceneRepository.findByChapter("c1");
			expect(result).toEqual(mockScenes);
		});
	});

	describe("create", () => {
		it("should create and return a scene", async () => {
			const mockInput = {
				projectId: "p1",
				chapterId: "c1",
				title: "New Scene",
				sequence: 1,
			};
			const mockScene = { id: "s1", ...mockInput };
			mocks.result = [mockScene];

			const result = await sceneRepository.create(mockInput);
			expect(result).toEqual(mockScene);
			expect(mocks.insert).toHaveBeenCalled();
		});
	});

	describe("update", () => {
		it("should update and return scene", async () => {
			const mockScene = { id: "s1", title: "Updated" };
			mocks.result = [mockScene];

			const result = await sceneRepository.update("s1", { title: "Updated" });
			expect(result).toEqual(mockScene);
			expect(mocks.update).toHaveBeenCalled();
		});

		it("should throw NotFoundError if scene does not exist", async () => {
			mocks.result = [];
			await expect(
				sceneRepository.update("s1", { title: "Updated" }),
			).rejects.toThrow(NotFoundError);
		});
	});

	describe("updateContent", () => {
		it("should update content and status", async () => {
			const mockScene = { id: "s1", content: "New Content", status: "drafted" };
			mocks.result = [mockScene];

			const result = await sceneRepository.updateContent("s1", "New Content");
			expect(result).toEqual(mockScene);
			expect(mocks.set).toHaveBeenCalledWith(
				expect.objectContaining({ content: "New Content", status: "drafted" }),
			);
		});
	});

	describe("getLastInChapter", () => {
		it("should return the last scene in a chapter", async () => {
			const mockScene = { id: "s2", sequence: 2 };
			mocks.result = [mockScene];

			const result = await sceneRepository.getLastInChapter("c1");
			expect(result).toEqual(mockScene);
		});
	});

	describe("Scene Cards", () => {
		describe("getSceneCard", () => {
			it("should return scene card when found", async () => {
				const mockCard = { id: "card1", sceneId: "s1", purpose: "Test" };
				mocks.result = [mockCard];

				const result = await sceneRepository.getSceneCard("s1");
				expect(result).toEqual(mockCard);
			});
		});

		describe("createSceneCard", () => {
			it("should create and return a scene card", async () => {
				const mockInput = { projectId: "p1", sceneId: "s1", purpose: "Test" };
				const mockCard = { id: "card1", ...mockInput };
				mocks.result = [mockCard];

				const result = await sceneRepository.createSceneCard(mockInput);
				expect(result).toEqual(mockCard);
				expect(mocks.insert).toHaveBeenCalled();
			});
		});

		describe("updateSceneCard", () => {
			it("should update and return scene card", async () => {
				const mockCard = { id: "card1", sceneId: "s1", purpose: "Updated" };
				mocks.result = [mockCard];

				const result = await sceneRepository.updateSceneCard("s1", {
					purpose: "Updated",
				});
				expect(result).toEqual(mockCard);
				expect(mocks.update).toHaveBeenCalled();
			});

			it("should throw NotFoundError if card does not exist", async () => {
				mocks.result = [];
				await expect(
					sceneRepository.updateSceneCard("s1", { purpose: "Updated" }),
				).rejects.toThrow(NotFoundError);
			});
		});
	});
});
