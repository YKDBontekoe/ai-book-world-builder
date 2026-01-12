import { beforeEach, describe, expect, it, vi } from "vitest";
import { volumeRepository } from "@/lib/db/repositories/volume-repository";
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
	inArray: vi.fn(),
}));

describe("VolumeRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.result = [];
		mocks.results = null;
		mocks.error = null;
	});

	describe("findById", () => {
		it("should return a volume when found", async () => {
			const mockVolume = { id: "v1", title: "Volume 1" };
			mocks.result = [mockVolume];

			const result = await volumeRepository.findById("v1");
			expect(result).toEqual(mockVolume);
		});

		it("should return null when not found", async () => {
			mocks.result = [];
			const result = await volumeRepository.findById("v1");
			expect(result).toBeNull();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(volumeRepository.findById("v1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("findAll", () => {
		it("should return all volumes", async () => {
			const volumes = [{ id: "v1" }];
			mocks.result = volumes;
			const result = await volumeRepository.findAll();
			expect(result).toEqual(volumes);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(volumeRepository.findAll()).rejects.toThrow(DatabaseError);
		});
	});

	describe("findByProject", () => {
		it("should return volumes for a project", async () => {
			const mockVolumes = [{ id: "v1", projectId: "p1" }];
			mocks.result = mockVolumes;

			const result = await volumeRepository.findByProject("p1");
			expect(result).toEqual(mockVolumes);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(volumeRepository.findByProject("p1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("findByIdWithPlan", () => {
		it("should return volume with chapters and drafts", async () => {
			const mockVolume = { id: "v1", title: "Vol 1", projectId: "p1" };
			const mockChapters = [{ id: "c1", volumeId: "v1", sequence: 1 }];
			const mockDrafts = [{ id: "d1", chapterId: "c1", volumeId: "v1" }];

			mocks.results = [
				[mockVolume], // findById
				mockChapters, // chapters
				mockDrafts, // drafts
			];

			const result = await volumeRepository.findByIdWithPlan("v1");
			expect(result).toEqual({
				...mockVolume,
				chapters: [
					{
						...mockChapters[0],
						drafts: mockDrafts,
					},
				],
			});
		});

		it("should return null if volume not found", async () => {
			mocks.result = [];
			const result = await volumeRepository.findByIdWithPlan("v1");
			expect(result).toBeNull();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(volumeRepository.findByIdWithPlan("v1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("findByProjectWithPlans", () => {
		it("should return all volume plans for a project", async () => {
			const mockVolumes = [{ id: "v1", title: "Vol 1" }];
			const mockChapters = [{ id: "c1", volumeId: "v1", sequence: 1 }];
			const mockDrafts: any[] = [];

			mocks.results = [
				mockVolumes, // findByProject
				mockChapters, // chapters for volumes
				mockDrafts, // drafts for volumes
			];

			const result = await volumeRepository.findByProjectWithPlans("p1");
			expect(result).toHaveLength(1);
			expect(result[0].chapters).toHaveLength(1);
		});

		it("should return empty array if no volumes", async () => {
			mocks.result = [];
			const result = await volumeRepository.findByProjectWithPlans("p1");
			expect(result).toEqual([]);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(
				volumeRepository.findByProjectWithPlans("p1"),
			).rejects.toThrow(DatabaseError);
		});
	});

	describe("create", () => {
		const mockInput = { projectId: "p1", outlineId: "o1", title: "New" };

		it("should create and return a volume", async () => {
			const mockCreated = { id: "v1", ...mockInput };
			mocks.result = [mockCreated];

			const result = await volumeRepository.create(mockInput);
			expect(result).toEqual(mockCreated);
			expect(mocks.insert).toHaveBeenCalled();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(volumeRepository.create(mockInput)).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("createWithChapters", () => {
		const mockInput = { projectId: "p1", outlineId: "o1", title: "New" };
		const mockChaptersInput = [{ title: "Ch1", sequence: 1 }];

		it("should create volume and chapters in transaction", async () => {
			const mockVolume = { id: "v1", ...mockInput };
			const mockCreatedChapters = [
				{ id: "c1", volumeId: "v1", title: "Ch1", sequence: 1 },
			];

			mocks.results = [
				[mockVolume], // insert volume
				mockCreatedChapters, // insert chapters
			];

			const result = await volumeRepository.createWithChapters(
				mockInput,
				mockChaptersInput,
			);
			expect(result.id).toBe("v1");
			expect(result.chapters).toHaveLength(1);
			expect(mocks.transaction).toHaveBeenCalled();
		});

		it("should handle empty chapters list", async () => {
			const mockVolume = { id: "v1", ...mockInput };
			mocks.results = [
				[mockVolume], // insert volume
				// insert chapters NOT called
			];
			const result = await volumeRepository.createWithChapters(mockInput, []);
			expect(result.id).toBe("v1");
			expect(result.chapters).toEqual([]);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(
				volumeRepository.createWithChapters(mockInput, mockChaptersInput),
			).rejects.toThrow(DatabaseError);
		});
	});

	describe("update", () => {
		it("should update and return volume", async () => {
			const mockVolume = { id: "v1", title: "Updated" };
			mocks.result = [mockVolume];

			const result = await volumeRepository.update("v1", { title: "Updated" });
			expect(result).toEqual(mockVolume);
			expect(mocks.update).toHaveBeenCalled();
		});

		it("should throw NotFoundError if volume does not exist", async () => {
			mocks.result = [];
			await expect(
				volumeRepository.update("v1", { title: "Updated" }),
			).rejects.toThrow(NotFoundError);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(
				volumeRepository.update("v1", { title: "U" }),
			).rejects.toThrow(DatabaseError);
		});
	});

	describe("delete", () => {
		it("should call delete", async () => {
			mocks.result = {};
			await volumeRepository.delete("v1");
			expect(mocks.delete).toHaveBeenCalled();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(volumeRepository.delete("v1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});
});
