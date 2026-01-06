import { beforeEach, describe, expect, it, vi } from "vitest";

// Use vi.hoisted to ensure mocks are initialized before usage in vi.mock
const { mockDb, mockProjectRepository, mockAuth } = vi.hoisted(() => {
	const db: any = {
		transaction: vi.fn(),
		$count: vi.fn(),
		select: vi.fn(),
		from: vi.fn(),
		where: vi.fn(),
		limit: vi.fn(),
		offset: vi.fn(),
		insert: vi.fn(),
		values: vi.fn(),
		returning: vi.fn(),
	};
	// Make db chainable and thenable
	db.select.mockReturnValue(db);
	db.from.mockReturnValue(db);
	db.where.mockReturnValue(db);
	db.limit.mockReturnValue(db);
	db.offset.mockReturnValue(db);
	db.insert.mockReturnValue(db);
	db.values.mockReturnValue(db);
	db.returning.mockReturnValue(db);

	// Default .then to resolve with empty array (simulating query execution)
	db.then = (resolve: any) => resolve([]);

	return {
		mockDb: db,
		mockProjectRepository: {
			findByIdWithAccess: vi.fn(),
		},
		mockAuth: vi.fn(() => Promise.resolve({ user: { id: "user-123" } })),
	};
});

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
		mockDb.select.mockReturnValue(mockDb);
		mockDb.from.mockReturnValue(mockDb);
		mockDb.where.mockReturnValue(mockDb);
		mockDb.limit.mockReturnValue(mockDb);
		mockDb.offset.mockReturnValue(mockDb);
		mockDb.insert.mockReturnValue(mockDb);
		mockDb.values.mockReturnValue(mockDb);
		mockDb.returning.mockReturnValue(mockDb);

		// Reset thenable behavior
		mockDb.then = (resolve: any) => resolve([]);
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

		// Custom thenable to handle return values based on call history
		mockDb.then = (resolve: any) => {
			// Determine if we are in an INSERT or SELECT chain based on call order
			const selectOrder = mockDb.select.mock.invocationCallOrder;
			const insertOrder = mockDb.insert.mock.invocationCallOrder;

			const lastSelect = selectOrder.length > 0 ? Math.max(...selectOrder) : 0;
			const lastInsert = insertOrder.length > 0 ? Math.max(...insertOrder) : 0;

			if (lastInsert > lastSelect) {
				// It's an insert
				return resolve([{ id: "new-proj-id" }]);
			}

			// It's a select - return empty to stop loops
			return resolve([]);
		};

		const result = await forkProject("proj-123");

		expect(result).toEqual({ success: true, projectId: "new-proj-id" });
		expect(mockDb.transaction).toHaveBeenCalled();
	});
});
