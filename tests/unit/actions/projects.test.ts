import { beforeEach, describe, expect, it, vi } from "vitest";

// Use vi.hoisted to ensure mocks are initialized before usage in vi.mock
const { mockDb, mockProjectRepository, mockAuth } = vi.hoisted(() => ({
	mockDb: {
		transaction: vi.fn(),
		$count: vi.fn(),
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		offset: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
	},
	mockProjectRepository: {
		findByIdWithAccess: vi.fn(),
	},
	mockAuth: vi.fn(() => Promise.resolve({ user: { id: "user-123" } })),
}));

// Apply mocks
vi.mock("@/lib/db/drizzle", () => ({
	db: mockDb,
}));

vi.mock("@/lib/db/repositories", () => ({
	projectRepository: mockProjectRepository,
}));

vi.mock("@/app/(auth)/auth", () => ({
	auth: mockAuth,
}));

vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
}));

// Import the action under test
import { forkProject } from "@/app/actions/projects";

describe("forkProject Action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset chainable mocks default behavior
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.where.mockReturnThis();
		mockDb.limit.mockReturnThis();
		mockDb.offset.mockReturnThis();
		mockDb.insert.mockReturnThis();
		mockDb.values.mockReturnThis();
		mockDb.returning.mockReturnThis();
	});

	it("should fail if project is too large", async () => {
		// Setup: Mock counts to exceed limit
		mockDb.$count.mockResolvedValueOnce(1500).mockResolvedValueOnce(600); // Total 2100

		const result = await forkProject("proj-123");
		expect(result).toEqual({
			error:
				"Project is too large to fork instantly. Please export and import instead.",
		});
	});

	it("should succeed for small projects", async () => {
		// Setup: Small counts
		mockDb.$count.mockResolvedValue(10);
		mockProjectRepository.findByIdWithAccess.mockResolvedValue({
			id: "proj-123",
			name: "Original",
			description: "Desc",
			folders: [],
		});

		// Mock Transaction Execution
		mockDb.transaction.mockImplementation(async (callback: any) => {
			return callback(mockDb);
		});

		// Mock DB selects for sequential fetch

		// For the non-chunked selects (entities, attributes, etc.), we want them to return []
		// to skip the loops and focus on the structure.
		// However, "where" is called for everything.

		// We can mock `where` to return `this` (default), and verify based on subsequent calls?
		// No, we need it to resolve to [] for most calls, BUT for scenes it calls .limit().offset().

		// Strategy: Make `where` return `this`. Make `limit` return `this`. Make `offset` return `this`.
		// Make `this` (mockDb) then-able? No, that's messy.

		// Alternative: Drizzle query builders are promises.
		// If we chain .where().limit().offset(), we need the final call to be awaitable.

		// Let's implement a specific mock for `offset` to return [].
		mockDb.offset.mockResolvedValue([]);

		// For the other tables (entities, etc.), the code calls `await tx.select()...where(...)`.
		// So `where` must be awaitable (return a Promise).
		// BUT if `where` returns a Promise, we can't chain `.limit()` on it (unless the Promise object also has properties).

		// Solution: Mock `where` to return a "QueryBuilder" object that has `limit`, `offset`, AND is then-able.
		const queryBuilder = {
			limit: vi.fn().mockReturnThis(),
			offset: vi.fn().mockResolvedValue([]), // End of chain for scenes
			then: (resolve: any) => resolve([]), // End of chain for others
		};
		// Bind methods to return the builder
		queryBuilder.limit = vi.fn().mockReturnValue(queryBuilder);

		mockDb.where.mockReturnValue(queryBuilder);

		// Mock insert returning
		mockDb.returning.mockResolvedValue([{ id: "new-proj-id" }]);

		const result = await forkProject("proj-123");

		expect(result).toEqual({ success: true, projectId: "new-proj-id" });
		expect(mockDb.transaction).toHaveBeenCalled();
	});
});
