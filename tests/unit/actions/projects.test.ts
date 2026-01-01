import { describe, expect, it, vi, beforeEach } from "vitest";

// Use vi.hoisted to ensure mocks are initialized before usage in vi.mock
const { mockDb, mockProjectRepository, mockAuth } = vi.hoisted(() => ({
	mockDb: {
		transaction: vi.fn(),
		$count: vi.fn(),
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
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

		// Mock DB selects for parallel fetch
		// We need to return empty arrays for the 9 queries in Promise.all
		mockDb.where.mockResolvedValue([]);

		// Mock insert returning
		mockDb.returning.mockResolvedValue([{ id: "new-proj-id" }]);

		const result = await forkProject("proj-123");

		expect(result).toEqual({ success: true, projectId: "new-proj-id" });
		expect(mockDb.transaction).toHaveBeenCalled();
	});
});
