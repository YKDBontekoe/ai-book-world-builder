import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chapterRepository } from "@/lib/db/repositories/chapter-repository";
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
	ne: vi.fn(),
	or: vi.fn(),
	inArray: vi.fn(),
}));

describe("ChapterRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "error").mockImplementation(() => {});
		mocks.result = [];
		mocks.results = null;
		mocks.error = null;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("findById", () => {
		it("should return a chapter when found", async () => {
			const mockChapter = { id: "c1", title: "Chapter 1" };
			mocks.result = [mockChapter];

			const result = await chapterRepository.findById("c1");
			expect(result).toEqual(mockChapter);
		});

		it("should return null when not found", async () => {
			mocks.result = [];
			const result = await chapterRepository.findById("c1");
			expect(result).toBeNull();
		});

		it("should throw DatabaseError on database failure", async () => {
			mocks.error = new Error("DB error");
			await expect(chapterRepository.findById("c1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("findAll", () => {
		it("should return all chapters", async () => {
			const chapters = [{ id: "c1" }];
			mocks.result = chapters;
			const result = await chapterRepository.findAll();
			expect(result).toEqual(chapters);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(chapterRepository.findAll()).rejects.toThrow(DatabaseError);
		});
	});

	describe("findByProject", () => {
		it("should return chapters for a project", async () => {
			const mockChapters = [
				{ id: "c1", projectId: "p1" },
				{ id: "c2", projectId: "p1" },
			];
			mocks.result = mockChapters;

			const result = await chapterRepository.findByProject("p1");
			expect(result).toEqual(mockChapters);
			expect(mocks.select).toHaveBeenCalled();
			expect(mocks.where).toHaveBeenCalled();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(chapterRepository.findByProject("p1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("findByVolume", () => {
		it("should return chapters for a volume", async () => {
			const mockChapters = [{ id: "c1", volumeId: "v1" }];
			mocks.result = mockChapters;

			const result = await chapterRepository.findByVolume("v1");
			expect(result).toEqual(mockChapters);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(chapterRepository.findByVolume("v1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("findByProjectWithContent", () => {
		it("should return chapters with content", async () => {
			const chapters = [{ id: "c1" }, { id: "c2" }];
			const version1 = [{ content: "Content 1" }];
			const version2 = [{ content: "Content 2" }];

			mocks.results = [
				chapters, // findByProject
				version1, // version for c1
				version2, // version for c2
			];

			const result = await chapterRepository.findByProjectWithContent("p1");
			expect(result).toHaveLength(2);
			expect(result[0].content).toBe("Content 1");
			expect(result[1].content).toBe("Content 2");
		});

		it("should handle missing content", async () => {
			const chapters = [{ id: "c1" }];
			const version1: any[] = []; // No version

			mocks.results = [chapters, version1];

			const result = await chapterRepository.findByProjectWithContent("p1");
			expect(result).toHaveLength(1);
			expect(result[0].content).toBeNull();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(
				chapterRepository.findByProjectWithContent("p1"),
			).rejects.toThrow(DatabaseError);
		});
	});

	describe("create", () => {
		const mockInput = {
			projectId: "p1",
			volumeId: "v1",
			outlineId: "o1",
			title: "New Chapter",
			sequence: 1,
		};

		it("should create and return a chapter", async () => {
			const mockChapter = { id: "c1", ...mockInput, status: "planned" };
			mocks.result = [mockChapter];

			const result = await chapterRepository.create(mockInput);
			expect(result).toEqual(mockChapter);
			expect(mocks.insert).toHaveBeenCalled();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(chapterRepository.create(mockInput)).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("update", () => {
		it("should update and return chapter", async () => {
			const mockChapter = { id: "c1", title: "Updated" };
			mocks.result = [mockChapter];

			const result = await chapterRepository.update("c1", { title: "Updated" });
			expect(result).toEqual(mockChapter);
			expect(mocks.update).toHaveBeenCalled();
		});

		it("should throw NotFoundError if chapter does not exist", async () => {
			mocks.result = [];
			await expect(
				chapterRepository.update("c1", { title: "Updated" }),
			).rejects.toThrow(NotFoundError);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(
				chapterRepository.update("c1", { title: "U" }),
			).rejects.toThrow(DatabaseError);
		});
	});

	describe("markAsDrafted", () => {
		it("should update status to drafted", async () => {
			mocks.result = {};
			await chapterRepository.markAsDrafted("c1");
			expect(mocks.update).toHaveBeenCalled();
			expect(mocks.set).toHaveBeenCalledWith(
				expect.objectContaining({ status: "drafted" }),
			);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(chapterRepository.markAsDrafted("c1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("createDraft", () => {
		const draftInput = {
			chapterId: "c1",
			volumeId: "v1",
			outlineId: "o1",
			projectId: "p1",
			content: "Draft content",
		};

		it("should create draft and mark chapter as drafted", async () => {
			const mockDraft = { id: "d1", ...draftInput };
			mocks.results = [
				[mockDraft], // insert draft
				[], // markAsDrafted update
			];

			const result = await chapterRepository.createDraft(draftInput);
			expect(result).toEqual(mockDraft);
			expect(mocks.insert).toHaveBeenCalled();
			expect(mocks.update).toHaveBeenCalled();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(chapterRepository.createDraft(draftInput)).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("delete", () => {
		it("should delete chapter", async () => {
			// .delete().where().returning()
			// Mock successful deletion returning the deleted record
			mocks.result = [{ id: "c1" }];
			await chapterRepository.delete("c1");
			expect(mocks.delete).toHaveBeenCalled();
		});

		it("should throw NotFoundError if no rows deleted", async () => {
			mocks.result = []; // No rows returned
			await expect(chapterRepository.delete("c1")).rejects.toThrow(
				NotFoundError,
			);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(chapterRepository.delete("c1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("getLastInVolume", () => {
		it("should return the last chapter in a volume", async () => {
			const mockChapter = { id: "c2", sequence: 2 };
			mocks.result = [mockChapter];

			const result = await chapterRepository.getLastInVolume("v1");
			expect(result).toEqual(mockChapter);
		});

		it("should return null if volume has no chapters", async () => {
			mocks.result = [];
			const result = await chapterRepository.getLastInVolume("v1");
			expect(result).toBeNull();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(chapterRepository.getLastInVolume("v1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("getNextSequence", () => {
		// Mock getLastInVolume specifically or rely on mocks.result?
		// Since getNextSequence calls getLastInVolume which calls db, we can just mock db result.

		it("should return 1 if no chapters", async () => {
			mocks.result = []; // getLastInVolume returns null
			const result = await chapterRepository.getNextSequence("v1");
			expect(result).toBe(1);
		});

		it("should return next sequence number", async () => {
			mocks.result = [{ sequence: 5 }];
			const result = await chapterRepository.getNextSequence("v1");
			expect(result).toBe(6);
		});
	});
});
