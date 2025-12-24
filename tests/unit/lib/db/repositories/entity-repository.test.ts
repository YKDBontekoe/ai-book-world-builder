import { beforeEach, describe, expect, it, vi } from "vitest";
import { entityRepository } from "@/lib/db/repositories/entity-repository";

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
		// biome-ignore lint/suspicious/noThenProperty: Mocking thenable for testing
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
	and: vi.fn(),
	asc: vi.fn(),
	desc: vi.fn(),
	eq: vi.fn(),
	or: vi.fn(),
	count: vi.fn(() => ({ name: "count" })),
}));

describe("EntityRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.result = [];
		mocks.results = null;
		mocks.error = null;
	});

	describe("findById", () => {
		it("should return an entity when found", async () => {
			const mockEntity = { id: "e1", name: "Entity 1" };
			mocks.result = [mockEntity];

			const result = await entityRepository.findById("e1");
			expect(result).toEqual(mockEntity);
		});
	});

	describe("findByIdWithDetails", () => {
		it("should return entity with attributes and relationships", async () => {
			const mockEntity = { id: "e1", name: "Entity 1" };
			const mockAttributes = [{ id: "a1", name: "Age", value: "30" }];
			const mockRelationships = [{ id: "r1", type: "parent" }];

			mocks.results = [
				[mockEntity], // findById
				mockAttributes, // attributes
				mockRelationships, // relationships
			];

			const result = await entityRepository.findByIdWithDetails("e1");
			expect(result).toEqual({
				...mockEntity,
				attributes: mockAttributes,
				relationships: mockRelationships,
			});
		});

		it("should return null if entity not found", async () => {
			mocks.result = [];
			const result = await entityRepository.findByIdWithDetails("e1");
			expect(result).toBeNull();
		});
	});

	describe("create", () => {
		it("should create and return an entity", async () => {
			const mockInput = { projectId: "p1", name: "New", kind: "character" };
			const mockCreated = { id: "e1", ...mockInput };

			mocks.results = [
				[{ count: 0 }], // count check
				[mockCreated], // insert
			];

			const result = await entityRepository.create(mockInput);
			expect(result).toEqual(mockCreated);
		});

		it("should throw ValidationError if name already exists", async () => {
			const mockInput = { projectId: "p1", name: "Exists", kind: "character" };
			mocks.result = [{ count: 1 }];

			await expect(entityRepository.create(mockInput)).rejects.toThrow(
				ValidationError,
			);
		});
	});

	describe("update", () => {
		it("should update and return entity", async () => {
			const mockEntity = { id: "e1", name: "Updated", projectId: "p1" };
			mocks.result = [mockEntity];

			const result = await entityRepository.update("e1", { name: "Updated" });
			expect(result).toEqual(mockEntity);
			expect(mocks.transaction).toHaveBeenCalled();
		});

		it("should handle attributes update", async () => {
			const mockEntity = { id: "e1", name: "Updated", projectId: "p1" };

			mocks.results = [
				[mockEntity], // update
				[], // delete old attributes
				[], // insert new attributes
			];

			await entityRepository.update("e1", {
				attributes: [{ name: "Age", value: "31" }],
			});

			expect(mocks.delete).toHaveBeenCalled();
			expect(mocks.insert).toHaveBeenCalled();
		});
	});

	describe("delete", () => {
		it("should delete entity and related records in transaction", async () => {
			mocks.result = [];
			await entityRepository.delete("e1");
			expect(mocks.transaction).toHaveBeenCalled();
			expect(mocks.delete).toHaveBeenCalledTimes(3); // attributes, relationships, entity
		});
	});

	describe("createAttribute", () => {
		it("should create and return attribute", async () => {
			const mockInput = {
				projectId: "p1",
				entityId: "e1",
				name: "Age",
				value: "30",
				dataType: "text",
			};
			const mockCreated = { id: "a1", ...mockInput };

			mocks.results = [
				[{ count: 0 }], // count check
				[mockCreated], // insert
			];

			const result = await entityRepository.createAttribute(mockInput);
			expect(result).toEqual(mockCreated);
		});
	});

	describe("createRelationship", () => {
		it("should create and return relationship", async () => {
			const mockInput = {
				projectId: "p1",
				sourceEntityId: "e1",
				targetEntityId: "e2",
				type: "friend",
			};
			const mockCreated = { id: "r1", ...mockInput };

			mocks.results = [
				[{ id: "e1", projectId: "p1" }], // source exists
				[{ id: "e2", projectId: "p1" }], // target exists
				[{ count: 0 }], // duplicate check
				[mockCreated], // insert
			];

			const result = await entityRepository.createRelationship(mockInput);
			expect(result).toEqual(mockCreated);
		});
	});
});
