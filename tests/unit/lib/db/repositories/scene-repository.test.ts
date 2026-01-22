import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

vi.mock("@/lib/db", () => ({
	db: mocks,
}));

vi.mock("drizzle-orm", () => ({
	and: vi.fn(),
	asc: vi.fn(),
	desc: vi.fn(),
	eq: vi.fn(),
	sql: Object.assign(
		vi.fn(() => ({ as: vi.fn() })),
		{ raw: vi.fn() },
	),
}));

describe("SceneRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "error").mockImplementation(() => {});
		mocks.result = [];
		mocks.error = null;
	});

	afterEach(() => {
		vi.restoreAllMocks();
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

		it("should throw DatabaseError on failure", async () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			mocks.error = new Error("DB Error");
			await expect(sceneRepository.findById("s1")).rejects.toThrow(
				DatabaseError,
			);
			consoleSpy.mockRestore();
		});
	});

	describe("findByIdInProject", () => {
		it("should return scene if found in project", async () => {
			const mockScene = { id: "s1", projectId: "p1" };
			mocks.result = [mockScene];
			const result = await sceneRepository.findByIdInProject("s1", "p1");
			expect(result).toEqual(mockScene);
		});

		it("should return null if not found in project", async () => {
			mocks.result = [];
			const result = await sceneRepository.findByIdInProject("s1", "p1");
			expect(result).toBeNull();
		});

		it("should throw DatabaseError on failure", async () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			mocks.error = new Error("DB Error");
			await expect(
				sceneRepository.findByIdInProject("s1", "p1"),
			).rejects.toThrow(DatabaseError);
			consoleSpy.mockRestore();
		});
	});

	describe("findAll", () => {
		it("should return all scenes", async () => {
			const scenes = [{ id: "s1" }];
			mocks.result = scenes;
			const result = await sceneRepository.findAll();
			expect(result).toEqual(scenes);
		});

		it("should throw DatabaseError on failure", async () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			mocks.error = new Error("DB Error");
			await expect(sceneRepository.findAll()).rejects.toThrow(DatabaseError);
			consoleSpy.mockRestore();
		});
	});

	describe("findByChapter", () => {
		it("should return scenes for a chapter", async () => {
			const mockScenes = [{ id: "s1", chapterId: "c1" }];
			mocks.result = mockScenes;

			const result = await sceneRepository.findByChapter("c1");
			expect(result).toEqual(mockScenes);
		});

		it("should throw DatabaseError on failure", async () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			mocks.error = new Error("DB Error");
			await expect(sceneRepository.findByChapter("c1")).rejects.toThrow(
				DatabaseError,
			);
			consoleSpy.mockRestore();
		});
	});

	describe("findByProject", () => {
		it("should return scenes for project", async () => {
			const scenes = [{ id: "s1", content: "full" }];
			mocks.result = scenes;
			const result = await sceneRepository.findByProject("p1");
			expect(result).toEqual(scenes);
		});

		it("should return scenes without content when excludeContent is true", async () => {
			const scenes = [{ id: "s1", content: null }];
			mocks.result = scenes;
			const result = await sceneRepository.findByProject("p1", true);
			expect(result).toEqual(scenes);
			// Verify optimize query structure if possible, but mockChain just captures calls
			expect(mocks.select).toHaveBeenCalled();
		});

		it("should throw DatabaseError on failure", async () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			mocks.error = new Error("DB Error");
			await expect(sceneRepository.findByProject("p1")).rejects.toThrow(
				DatabaseError,
			);
			consoleSpy.mockRestore();
		});
	});

	describe("create", () => {
		const validInput = {
			projectId: "p1",
			chapterId: "c1",
			title: "New Scene",
			sequence: 1,
		};

		it("should create and return a scene", async () => {
			const mockScene = { id: "s1", ...validInput };
			mocks.result = [mockScene];

			const result = await sceneRepository.create(validInput);
			expect(result).toEqual(mockScene);
			expect(mocks.insert).toHaveBeenCalled();
		});

		it("should throw DatabaseError on failure", async () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			mocks.error = new Error("DB Error");
			await expect(sceneRepository.create(validInput)).rejects.toThrow(
				DatabaseError,
			);
			consoleSpy.mockRestore();
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

		it("should update with projectId scope", async () => {
			const mockScene = { id: "s1", title: "Updated" };
			mocks.result = [mockScene];

			const result = await sceneRepository.update(
				"s1",
				{ title: "Updated" },
				"p1",
			);
			expect(result).toEqual(mockScene);
			// Verify `and(eq(id), eq(projectId))` logic indirectly by ensuring call succeeds
		});

		it("should throw NotFoundError if scene does not exist", async () => {
			mocks.result = [];
			await expect(
				sceneRepository.update("s1", { title: "Updated" }),
			).rejects.toThrow(NotFoundError);
		});

		it("should throw DatabaseError on failure", async () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			mocks.error = new Error("DB Error");
			await expect(
				sceneRepository.update("s1", { title: "Up" }),
			).rejects.toThrow(DatabaseError);
			consoleSpy.mockRestore();
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

		it("should update content and use provided status", async () => {
			const mockScene = { id: "s1", content: "C", status: "review" };
			mocks.result = [mockScene];

			const result = await sceneRepository.updateContent("s1", "C", "review");
			expect(result).toEqual(mockScene);
			expect(mocks.set).toHaveBeenCalledWith(
				expect.objectContaining({ status: "review" }),
			);
		});

		it("should throw NotFoundError if scene not found", async () => {
			mocks.result = [];
			await expect(sceneRepository.updateContent("s1", "C")).rejects.toThrow(
				NotFoundError,
			);
		});

		it("should throw DatabaseError on failure", async () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			mocks.error = new Error("DB Error");
			await expect(sceneRepository.updateContent("s1", "C")).rejects.toThrow(
				DatabaseError,
			);
			consoleSpy.mockRestore();
		});
	});

	describe("delete", () => {
		it("should delete scene", async () => {
			mocks.result = [{ id: "s1" }];
			await sceneRepository.delete("s1");
			expect(mocks.delete).toHaveBeenCalled();
		});

		it("should throw NotFoundError if scene does not exist", async () => {
			mocks.result = [];
			await expect(sceneRepository.delete("s1")).rejects.toThrow(NotFoundError);
		});

		it("should throw DatabaseError on failure", async () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			mocks.error = new Error("DB Error");
			await expect(sceneRepository.delete("s1")).rejects.toThrow(DatabaseError);
			consoleSpy.mockRestore();
		});
	});

	describe("getLastInChapter", () => {
		it("should return the last scene in a chapter", async () => {
			const mockScene = { id: "s2", sequence: 2 };
			mocks.result = [mockScene];

			const result = await sceneRepository.getLastInChapter("c1");
			expect(result).toEqual(mockScene);
		});

		it("should return null if no scenes", async () => {
			mocks.result = [];
			const result = await sceneRepository.getLastInChapter("c1");
			expect(result).toBeNull();
		});

		it("should throw DatabaseError on failure", async () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			mocks.error = new Error("DB Error");
			await expect(sceneRepository.getLastInChapter("c1")).rejects.toThrow(
				DatabaseError,
			);
			consoleSpy.mockRestore();
		});
	});

	describe("getNextSequence", () => {
		it("should return 1 if no scenes exist", async () => {
			mocks.result = []; // getLastInChapter returns null
			const result = await sceneRepository.getNextSequence("c1");
			expect(result).toBe(1);
		});

		it("should return last sequence + 1", async () => {
			mocks.result = [{ sequence: 5 }];
			const result = await sceneRepository.getNextSequence("c1");
			expect(result).toBe(6);
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

			it("should return null if not found", async () => {
				mocks.result = [];
				const result = await sceneRepository.getSceneCard("s1");
				expect(result).toBeNull();
			});

			it("should throw DatabaseError on failure", async () => {
				const consoleSpy = vi
					.spyOn(console, "error")
					.mockImplementation(() => {});
				mocks.error = new Error("DB Error");
				await expect(sceneRepository.getSceneCard("s1")).rejects.toThrow(
					DatabaseError,
				);
				consoleSpy.mockRestore();
			});
		});

		describe("createSceneCard", () => {
			const validInput = { projectId: "p1", sceneId: "s1", purpose: "Test" };

			it("should create and return a scene card", async () => {
				const mockCard = { id: "card1", ...validInput };
				mocks.result = [mockCard];

				const result = await sceneRepository.createSceneCard(validInput);
				expect(result).toEqual(mockCard);
				expect(mocks.insert).toHaveBeenCalled();
			});

			it("should throw DatabaseError on failure", async () => {
				const consoleSpy = vi
					.spyOn(console, "error")
					.mockImplementation(() => {});
				mocks.error = new Error("DB Error");
				await expect(
					sceneRepository.createSceneCard(validInput),
				).rejects.toThrow(DatabaseError);
				consoleSpy.mockRestore();
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

			it("should throw DatabaseError on failure", async () => {
				const consoleSpy = vi
					.spyOn(console, "error")
					.mockImplementation(() => {});
				mocks.error = new Error("DB Error");
				await expect(
					sceneRepository.updateSceneCard("s1", { purpose: "Up" }),
				).rejects.toThrow(DatabaseError);
				consoleSpy.mockRestore();
			});
		});
	});
});
