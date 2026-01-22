import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	entityRepository,
	toDateOrUndefined,
} from "@/lib/db/repositories/entity-repository";
import { DatabaseError, NotFoundError, ValidationError } from "@/lib/errors";

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
	and: vi.fn(),
	asc: vi.fn(),
	desc: vi.fn(),
	eq: vi.fn(),
	or: vi.fn(),
	inArray: vi.fn(),
	count: vi.fn(() => ({ name: "count" })),
}));

describe("EntityRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "error").mockImplementation(() => {});
		mocks.result = [];
		mocks.results = null;
		mocks.error = null;
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Utilities", () => {
		describe("toDateOrUndefined", () => {
			it("should return undefined for null/undefined/empty string", () => {
				expect(toDateOrUndefined(null)).toBeUndefined();
				expect(toDateOrUndefined(undefined)).toBeUndefined();
				expect(toDateOrUndefined("")).toBeUndefined();
			});

			it("should return Date object if passed a Date", () => {
				const d = new Date();
				expect(toDateOrUndefined(d)).toBe(d);
			});

			it("should parse valid date string", () => {
				const s = "2023-01-01";
				const d = toDateOrUndefined(s);
				expect(d).toBeInstanceOf(Date);
				expect(d?.toISOString().startsWith(s)).toBe(true);
			});

			it("should return undefined for invalid date string", () => {
				expect(toDateOrUndefined("invalid-date")).toBeUndefined();
			});
		});
	});

	describe("findById", () => {
		it("should return an entity when found", async () => {
			const mockEntity = { id: "e1", name: "Entity 1" };
			mocks.result = [mockEntity];

			const result = await entityRepository.findById("e1");
			expect(result).toEqual(mockEntity);
		});

		it("should return null when not found", async () => {
			mocks.result = [];
			const result = await entityRepository.findById("e1");
			expect(result).toBeNull();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(entityRepository.findById("e1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("findAll", () => {
		it("should return all entities", async () => {
			const entities = [{ id: "e1" }, { id: "e2" }];
			mocks.result = entities;
			const result = await entityRepository.findAll();
			expect(result).toEqual(entities);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(entityRepository.findAll()).rejects.toThrow(DatabaseError);
		});
	});

	describe("findByProject", () => {
		it("should return entities for project", async () => {
			const entities = [{ id: "e1", projectId: "p1" }];
			mocks.result = entities;
			const result = await entityRepository.findByProject("p1");
			expect(result).toEqual(entities);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(entityRepository.findByProject("p1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("findByProjectWithDetails", () => {
		it("should return empty array if no entities found", async () => {
			mocks.result = [];
			const result = await entityRepository.findByProjectWithDetails("p1");
			expect(result).toEqual([]);
		});

		it("should map attributes and relationships to entities", async () => {
			const { inArray } = await import("drizzle-orm");
			const entities = [
				{ id: "e1", name: "E1" },
				{ id: "e2", name: "E2" },
			];
			const attributes = [
				{ id: "a1", entityId: "e1", name: "Attr1" },
				{ id: "a2", entityId: "e2", name: "Attr2" },
			];
			const relationships = [
				{
					id: "r1",
					sourceEntityId: "e1",
					targetEntityId: "e2",
					createdAt: new Date(),
				},
			];

			mocks.results = [
				entities, // Find entities
				attributes, // Find attributes (Promise.all 1)
				relationships, // Find relationships (Promise.all 2)
			];

			const result = await entityRepository.findByProjectWithDetails("p1");
			expect(result).toHaveLength(2);

			const e1 = result.find((e) => e.id === "e1");
			expect(e1?.attributes).toHaveLength(1);
			expect(e1?.attributes[0].id).toBe("a1");
			expect(e1?.relationships).toHaveLength(1); // Involved in r1

			const e2 = result.find((e) => e.id === "e2");
			expect(e2?.attributes).toHaveLength(1);
			expect(e2?.attributes[0].id).toBe("a2");
			expect(e2?.relationships).toHaveLength(1); // Involved in r1

			// Optimization verification: should use inArray with entity IDs
			expect(inArray).toHaveBeenCalledWith(
				expect.anything(),
				expect.arrayContaining(["e1", "e2"]),
			);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(
				entityRepository.findByProjectWithDetails("p1"),
			).rejects.toThrow(DatabaseError);
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

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(entityRepository.findByIdWithDetails("e1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("create", () => {
		const validInput = { projectId: "p1", name: "New", kind: "character" };

		it("should create and return an entity", async () => {
			const mockCreated = { id: "e1", ...validInput };

			mocks.results = [
				[{ count: 0 }], // count check
				[mockCreated], // insert
			];

			const result = await entityRepository.create(validInput);
			expect(result).toEqual(mockCreated);
		});

		it("should throw ValidationError if name already exists", async () => {
			mocks.result = [{ count: 1 }];

			await expect(entityRepository.create(validInput)).rejects.toThrow(
				ValidationError,
			);
		});

		it("should throw ValidationError if start date > end date", async () => {
			await expect(
				entityRepository.create({
					...validInput,
					startDate: new Date("2023-01-02"),
					endDate: new Date("2023-01-01"),
				}),
			).rejects.toThrow(ValidationError);
		});

		it("should throw DatabaseError on unexpected error", async () => {
			mocks.error = new Error("DB Error");
			await expect(entityRepository.create(validInput)).rejects.toThrow(
				DatabaseError,
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

		it("should throw NotFoundError if entity not found during update", async () => {
			mocks.result = []; // Update returns nothing

			await expect(
				entityRepository.update("e1", { name: "New" }),
			).rejects.toThrow(NotFoundError);
		});

		it("should throw ValidationError if date range invalid", async () => {
			await expect(
				entityRepository.update("e1", {
					startDate: new Date("2023-01-02"),
					endDate: new Date("2023-01-01"),
				}),
			).rejects.toThrow(ValidationError);
		});

		it("should throw DatabaseError on unexpected error", async () => {
			mocks.error = new Error("DB Error");
			await expect(
				entityRepository.update("e1", { name: "New" }),
			).rejects.toThrow(DatabaseError);
		});
	});

	describe("delete", () => {
		it("should delete entity and related records in transaction", async () => {
			mocks.result = [];
			await entityRepository.delete("e1");
			expect(mocks.transaction).toHaveBeenCalled();
			expect(mocks.delete).toHaveBeenCalledTimes(3); // attributes, relationships, entity
		});

		it("should throw DatabaseError on failure", async () => {
			// Mock transaction to fail
			mocks.transaction = vi.fn(() => Promise.reject(new Error("DB Error")));
			await expect(entityRepository.delete("e1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("createAttribute", () => {
		const validInput = {
			projectId: "p1",
			entityId: "e1",
			name: "Age",
			value: "30",
			dataType: "text",
		};

		it("should create and return attribute", async () => {
			const mockCreated = { id: "a1", ...validInput };

			mocks.results = [
				[{ count: 0 }], // count check
				[mockCreated], // insert
			];

			const result = await entityRepository.createAttribute(validInput);
			expect(result).toEqual(mockCreated);
		});

		it("should throw ValidationError if attribute name exists on entity", async () => {
			mocks.result = [{ count: 1 }];
			await expect(
				entityRepository.createAttribute(validInput),
			).rejects.toThrow(ValidationError);
		});

		it("should throw ValidationError if date range invalid", async () => {
			await expect(
				entityRepository.createAttribute({
					...validInput,
					startDate: new Date("2023-01-02"),
					endDate: new Date("2023-01-01"),
				}),
			).rejects.toThrow(ValidationError);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(
				entityRepository.createAttribute(validInput),
			).rejects.toThrow(DatabaseError);
		});
	});

	describe("getAttributesByProject", () => {
		it("should return attributes", async () => {
			const attrs = [{ id: "a1" }];
			mocks.result = attrs;
			const result = await entityRepository.getAttributesByProject("p1");
			expect(result).toEqual(attrs);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(
				entityRepository.getAttributesByProject("p1"),
			).rejects.toThrow(DatabaseError);
		});
	});

	describe("createRelationship", () => {
		const validInput = {
			projectId: "p1",
			sourceEntityId: "e1",
			targetEntityId: "e2",
			type: "friend",
		};

		it("should create and return relationship", async () => {
			const mockCreated = { id: "r1", ...validInput };

			mocks.results = [
				[{ id: "e1", projectId: "p1" }], // source exists
				[{ id: "e2", projectId: "p1" }], // target exists
				[{ count: 0 }], // duplicate check
				[mockCreated], // insert
			];

			const result = await entityRepository.createRelationship(validInput);
			expect(result).toEqual(mockCreated);
		});

		it("should throw ValidationError if source and target are same", async () => {
			await expect(
				entityRepository.createRelationship({
					...validInput,
					targetEntityId: "e1",
				}),
			).rejects.toThrow(ValidationError);
		});

		it("should throw ValidationError if entities do not belong to same project", async () => {
			mocks.results = [
				[{ id: "e1", projectId: "p1" }],
				[{ id: "e2", projectId: "p2" }], // Different project (though select checks project ID, so return empty)
			];
			// Wait, the select has WHERE id = ? AND projectId = ?
			// So if project doesn't match, it returns empty array.

			// Scenario: entity exists but not in project p1
			mocks.results = [
				[{ id: "e1", projectId: "p1" }],
				[], // e2 not found in p1
			];

			await expect(
				entityRepository.createRelationship(validInput),
			).rejects.toThrow(ValidationError);
		});

		it("should throw ValidationError if relationship already exists", async () => {
			mocks.results = [
				[{ id: "e1", projectId: "p1" }],
				[{ id: "e2", projectId: "p1" }],
				[{ count: 1 }], // Exists
			];

			await expect(
				entityRepository.createRelationship(validInput),
			).rejects.toThrow(ValidationError);
		});

		it("should throw ValidationError if date range invalid", async () => {
			await expect(
				entityRepository.createRelationship({
					...validInput,
					startDate: new Date("2023-01-02"),
					endDate: new Date("2023-01-01"),
				}),
			).rejects.toThrow(ValidationError);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			// Need to fail specifically at DB call, not validation
			// Since validations happen first, passing validations needs mocks
			// But mocks.error sets global error for the next call.

			// We need to bypass validation calls or make them succeed then fail.
			// But mocks.error makes the *next* call fail.
			// The first calls are `Promise.all` for entities.

			await expect(
				entityRepository.createRelationship(validInput),
			).rejects.toThrow(DatabaseError);
		});
	});

	describe("getRelationshipsByProject", () => {
		it("should return relationships", async () => {
			const rels = [{ id: "r1" }];
			mocks.result = rels;
			const result = await entityRepository.getRelationshipsByProject("p1");
			expect(result).toEqual(rels);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(
				entityRepository.getRelationshipsByProject("p1"),
			).rejects.toThrow(DatabaseError);
		});
	});
});
