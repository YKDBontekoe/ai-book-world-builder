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
	// We use vi.fn() so it's tracked by Vitest
	db.then = vi.fn((resolve: any) => resolve([]));

	return {
		mockDb: db,
		mockProjectRepository: {
			findByIdWithAccess: vi.fn(),
		},
		mockAuth: vi.fn(() => Promise.resolve({ user: { id: "user-123" } })),
	};
});

// Apply mocks
vi.mock("@/lib/db", () => ({
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
		mockDb.then.mockReset();
		mockDb.then.mockImplementation((resolve: any) => resolve([]));
	});

	it("should fail if project is too large", async () => {
		// Setup: Mock counts to exceed limit
		mockDb.$count.mockResolvedValueOnce(1500).mockResolvedValueOnce(600); // Total 2100

		const result = await forkProject("123e4567-e89b-12d3-a456-426614174000");
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

		// Deterministic query responses
		const responses = [
			[{ id: "new-proj-id" }], // 1. Insert Project
			[], // 2. Select Entities Batch 1 (empty stops loop)
			[], // 3. Select Attributes
			[], // 4. Select Relationships
			[], // 5. Select Outline
			[], // 6. Select Volumes
			[], // 7. Select Chapters
			[], // 8. Select Drafts
			[], // 9. Select Scene Metadata (ID Map)
			[], // 10. Select Scenes Batch 1 (empty stops loop)
			[], // 11. Select Scene Cards
		];
		let queryIndex = 0;

		mockDb.then.mockImplementation((resolve: any) => {
			const response = responses[queryIndex++] || [];
			return resolve(response);
		});

		const result = await forkProject("123e4567-e89b-12d3-a456-426614174000");

		expect(result).toEqual({ success: true, projectId: "new-proj-id" });
		expect(mockDb.transaction).toHaveBeenCalled();
	});
});
