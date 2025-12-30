import { and, eq, inArray } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sceneRepository } from "@/lib/db/repositories/scene-repository";
import { scene } from "@/lib/db/schema/generation";
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
		// biome-ignore lint/suspicious/noThenProperty: Mocking thenable for Drizzle
		then: vi.fn((resolve, reject) => {
			if (mockChain.error) {
				return Promise.reject(mockChain.error).catch(reject);
			}
			return Promise.resolve(mockChain.result).then(resolve);
		}),
		result: [],
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

const drizzleMocks = vi.hoisted(() => ({
	asc: vi.fn(),
	desc: vi.fn(),
	eq: vi.fn((col, val) => ({ column: col, value: val })),
	sql: vi.fn(),
	and: vi.fn((...args) => ({ type: "and", conditions: args })),
	inArray: vi.fn((col, val) => ({ column: col, value: val })),
}));

vi.mock("drizzle-orm", () => drizzleMocks);

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

	describe("deleteMany", () => {
		it("should not call delete when given an empty array", async () => {
			await sceneRepository.deleteMany([], "p1");
			expect(mocks.delete).not.toHaveBeenCalled();
		});

		it("should call delete with the correct parameters", async () => {
			const sceneIds = ["s1", "s2"];
			const projectId = "p1";
			await sceneRepository.deleteMany(sceneIds, projectId);

			expect(mocks.delete).toHaveBeenCalledWith(
				expect.objectContaining({
					[Symbol.for("drizzle:BaseName")]: "Scene",
				}),
			);
			expect(drizzleMocks.inArray).toHaveBeenCalledWith(
				expect.objectContaining({ name: "id" }),
				sceneIds,
			);
			expect(drizzleMocks.eq).toHaveBeenCalledWith(
				expect.objectContaining({ name: "projectId" }),
				projectId,
			);
			expect(mocks.where).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "and",
					conditions: expect.arrayContaining([
						expect.objectContaining({
							column: expect.objectContaining({ name: "id" }),
							value: sceneIds,
						}),
						expect.objectContaining({
							column: expect.objectContaining({ name: "projectId" }),
							value: projectId,
						}),
					]),
				}),
			);
		});

		it("should throw a DatabaseError on failure", async () => {
			const sceneIds = ["s1", "s2"];
			const projectId = "p1";
			mocks.error = new Error("DB error");

			await expect(
				sceneRepository.deleteMany(sceneIds, projectId),
			).rejects.toThrow(DatabaseError);
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
