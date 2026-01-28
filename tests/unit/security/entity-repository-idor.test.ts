import { and, eq, or } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { entityRepository } from "@/lib/db/repositories/entity-repository";
import { entity, entityAttribute, relationship } from "@/lib/db/schema";

const mocks = vi.hoisted(() => {
	return {
		mockDelete: vi.fn(),
		mockUpdate: vi.fn(),
		mockSet: vi.fn(),
		mockWhere: vi.fn(),
		mockReturning: vi.fn(),
		mockTransaction: vi.fn(),
	};
});

vi.mock("@/lib/db", () => ({
	db: {
		delete: mocks.mockDelete,
		update: mocks.mockUpdate,
		transaction: mocks.mockTransaction,
	},
}));

describe("Entity Repository Security (IDOR)", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Setup transaction mock to execute callback immediately
		mocks.mockTransaction.mockImplementation(async (callback) => {
			return callback({
				delete: mocks.mockDelete,
				update: mocks.mockUpdate,
			});
		});

		mocks.mockUpdate.mockReturnValue({ set: mocks.mockSet });
		mocks.mockSet.mockReturnValue({ where: mocks.mockWhere });
		mocks.mockDelete.mockReturnValue({ where: mocks.mockWhere });
		mocks.mockWhere.mockReturnValue({ returning: mocks.mockReturning });

		// Default success responses
		mocks.mockReturning.mockResolvedValue([
			{ id: "entity-1", projectId: "project-1" },
		]);
	});

	it("prevents IDOR: delete enforces project ownership when projectId is provided", async () => {
		const entityId = "target-entity-id";
		const projectId = "owner-project-id";

		// Call the function WITH projectId
		await entityRepository.delete(entityId, projectId);

		// Verify 3 deletes happened (attributes, relationships, entity)
		expect(mocks.mockDelete).toHaveBeenCalledTimes(3);

		// Check Entity Attribute Delete
		// The first call should be for entityAttribute
		const attrDeleteCall = mocks.mockDelete.mock.calls[0][0];
		expect(attrDeleteCall).toBe(entityAttribute);

		// Check constraints for attributes
		// Since we can't easily introspect the complex SQL object from 'where',
		// we verify that 'where' was called with the correct AND condition
		const attrWhereArg = mocks.mockWhere.mock.calls[0][0];
		const expectedAttrQuery = and(
			eq(entityAttribute.entityId, entityId),
			eq(entityAttribute.projectId, projectId),
		);
		expect(attrWhereArg).toEqual(expectedAttrQuery);

		// Check Relationship Delete
		const relDeleteCall = mocks.mockDelete.mock.calls[1][0];
		expect(relDeleteCall).toBe(relationship);

		const relWhereArg = mocks.mockWhere.mock.calls[1][0];
		// Relationship delete uses OR for source/target, AND for project
		const expectedRelQuery = and(
			or(
				eq(relationship.sourceEntityId, entityId),
				eq(relationship.targetEntityId, entityId),
			),
			eq(relationship.projectId, projectId),
		);
		expect(relWhereArg).toEqual(expectedRelQuery);

		// Check Entity Delete
		const entityDeleteCall = mocks.mockDelete.mock.calls[2][0];
		expect(entityDeleteCall).toBe(entity);

		const entityWhereArg = mocks.mockWhere.mock.calls[2][0];
		const expectedEntityQuery = and(
			eq(entity.id, entityId),
			eq(entity.projectId, projectId),
		);
		expect(entityWhereArg).toEqual(expectedEntityQuery);
	});

	it("prevents IDOR: update enforces project ownership when projectId is provided", async () => {
		const entityId = "target-entity-id";
		const projectId = "owner-project-id";
		const data = { name: "New Name" };

		// Call update with projectId
		await entityRepository.update(entityId, data, projectId);

		// Verify update called
		expect(mocks.mockUpdate).toHaveBeenCalledWith(entity);

		// Verify where clause includes projectId
		// update calls where() only once for the update query
		// (mockWhere might be called multiple times if attributes are updated, but here we only provide name)
		const updateWhereArg = mocks.mockWhere.mock.calls[0][0];

		const expectedUpdateQuery = and(
			eq(entity.id, entityId),
			eq(entity.projectId, projectId),
		);

		expect(updateWhereArg).toEqual(expectedUpdateQuery);
	});
});
