import { beforeEach, describe, expect, it, vi } from "vitest";
import { sourceMaterialRepository } from "@/lib/db/repositories/source-material-repository";
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
		leftJoin: vi.fn(),
		innerJoin: vi.fn(),
		execute: vi.fn(),
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
		"leftJoin",
		"innerJoin",
		"execute",
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
	count: vi.fn(() => ({ name: "count" })),
	eq: vi.fn(),
	inArray: vi.fn(),
	isNull: vi.fn(),
	lte: vi.fn(),
	or: vi.fn(),
}));

describe("SourceMaterialRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.result = [];
		mocks.results = null;
		mocks.error = null;
	});

	describe("findById", () => {
		it("should return a source material when found", async () => {
			const mockMat = { id: "m1", filename: "test.pdf" };
			mocks.result = [mockMat];

			const result = await sourceMaterialRepository.findById("m1");
			expect(result).toEqual(mockMat);
		});
	});

	describe("findByIdWithProcessing", () => {
		it("should return material with processing status", async () => {
			const mockData = {
				material: { id: "m1", filename: "test.pdf" },
				processing: { id: "p1", status: "completed" },
			};
			mocks.result = [mockData];

			const result =
				await sourceMaterialRepository.findByIdWithProcessing("m1");
			expect(result).toEqual(mockData);
			expect(mocks.leftJoin).toHaveBeenCalled();
		});
	});

	describe("findByUserWithProcessing", () => {
		it("should return materials with project name and processing", async () => {
			const mockData = [
				{
					material: { id: "m1", filename: "test.pdf" },
					processing: { status: "pending" },
					projectName: "My Project",
				},
			];
			mocks.result = mockData;

			const result =
				await sourceMaterialRepository.findByUserWithProcessing("u1");
			expect(result[0].projectName).toBe("My Project");
			expect(result[0].processingStatus?.status).toBe("pending");
		});
	});

	describe("create", () => {
		it("should create and return source material", async () => {
			const mockInput = {
				filename: "test.pdf",
				mimeType: "pdf",
				projectId: "p1",
				size: 100,
				status: "uploaded" as const,
				userId: "u1",
			};
			const mockCreated = { id: "m1", ...mockInput };
			mocks.result = [mockCreated];

			const result = await sourceMaterialRepository.create(mockInput);
			expect(result).toEqual(mockCreated);
		});
	});

	describe("delete", () => {
		it("should delete material and all related data", async () => {
			mocks.result = [];
			await sourceMaterialRepository.delete("m1");
			expect(mocks.delete).toHaveBeenCalledTimes(4); // chunks, chapters, processing, material
		});
	});

	describe("upsertProcessing", () => {
		it("should update existing processing record", async () => {
			const existing = { id: "proc1", sourceMaterialId: "m1", attempts: 1 };
			const updated = { ...existing, attempts: 2 };

			mocks.results = [
				[existing], // select existing
				[updated], // update
			];

			const result = await sourceMaterialRepository.upsertProcessing({
				sourceMaterialId: "m1",
				projectId: "p1",
				userId: "u1",
				attempts: 2,
			});

			expect(result.attempts).toBe(2);
			expect(mocks.update).toHaveBeenCalled();
		});

		it("should insert new processing record if not exists", async () => {
			const inserted = {
				id: "proc1",
				sourceMaterialId: "m1",
				status: "pending",
			};

			mocks.results = [
				[], // select existing (none)
				[inserted], // insert
			];

			const result = await sourceMaterialRepository.upsertProcessing({
				sourceMaterialId: "m1",
				projectId: "p1",
				userId: "u1",
			});

			expect(result.id).toBe("proc1");
			expect(mocks.insert).toHaveBeenCalled();
		});
	});

	describe("saveExtraction", () => {
		it("should save extraction results in transaction", async () => {
			mocks.results = [
				[], // delete chunks
				[], // delete chapters
				[{ id: "ch1" }], // insert chapters
				[{ id: "chunk1" }], // insert chunks
			];

			const result = await sourceMaterialRepository.saveExtraction({
				materialId: "m1",
				projectId: "p1",
				userId: "u1",
				chapters: [{ id: "ch1", title: "Ch 1", sequence: 1 }],
				chunks: [{ id: "chunk1", text: "text", sequence: 1, chapterId: "ch1" }],
			} as any);

			expect(result.chapters).toHaveLength(1);
			expect(result.chunks).toHaveLength(1);
			expect(mocks.transaction).toHaveBeenCalled();
		});
	});

	describe("Chunk Operations", () => {
		it("should get chunk count", async () => {
			mocks.result = [{ count: 10 }];
			const result = await sourceMaterialRepository.getChunkCount("m1");
			expect(result).toBe(10);
		});

		it("should get sampled chunks", async () => {
			const allChunks = [
				{ id: "1" },
				{ id: "2" },
				{ id: "3" },
				{ id: "4" },
				{ id: "5" },
				{ id: "6" },
			];
			mocks.result = allChunks;

			const result = await sourceMaterialRepository.getSampledChunks("m1", 2);
			expect(result).toHaveLength(3); // 1, 3, 5
		});
	});
});
