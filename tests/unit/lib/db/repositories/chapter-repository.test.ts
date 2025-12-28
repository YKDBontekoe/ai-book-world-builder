import { beforeEach, describe, expect, it, vi } from "vitest";
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
		mocks.result = [];
		mocks.error = null;
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
	});

	describe("findByVolume", () => {
		it("should return chapters for a volume", async () => {
			const mockChapters = [{ id: "c1", volumeId: "v1" }];
			mocks.result = mockChapters;

			const result = await chapterRepository.findByVolume("v1");
			expect(result).toEqual(mockChapters);
		});
	});

	describe("create", () => {
		it("should create and return a chapter", async () => {
			const mockInput = {
				projectId: "p1",
				volumeId: "v1",
				outlineId: "o1",
				title: "New Chapter",
				sequence: 1,
			};
			const mockChapter = { id: "c1", ...mockInput };
			mocks.result = [mockChapter];

			const result = await chapterRepository.create(mockInput);
			expect(result).toEqual(mockChapter);
			expect(mocks.insert).toHaveBeenCalled();
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
	});

	describe("markAsDrafted", () => {
		it("should update status to drafted", async () => {
			mocks.result = {};
			await chapterRepository.markAsDrafted("c1");
			expect(mocks.update).toHaveBeenCalled();
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
	});

	describe("getNextSequence", () => {
		it("should return 1 if no chapters", async () => {
			vi.spyOn(chapterRepository, "getLastInVolume").mockResolvedValueOnce(
				null,
			);
			const result = await chapterRepository.getNextSequence("v1");
			expect(result).toBe(1);
		});

		it("should return next sequence number", async () => {
			vi.spyOn(chapterRepository, "getLastInVolume").mockResolvedValueOnce({
				sequence: 5,
			} as any);
			const result = await chapterRepository.getNextSequence("v1");
			expect(result).toBe(6);
		});
	});
});
