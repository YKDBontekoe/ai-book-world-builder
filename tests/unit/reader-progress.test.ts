import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	db: {
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		onConflictDoUpdate: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
	},
	projectRepository: {
		findByIdWithAccess: vi.fn(),
	},
	saveReadingProgressQuery: vi.fn(),
	auth: vi.fn(),
}));

vi.mock("@/lib/db/drizzle", () => ({
	db: mocks.db,
}));

vi.mock("@/lib/db/repositories", () => ({
	projectRepository: mocks.projectRepository,
}));

vi.mock("@/lib/db/queries/reader", () => ({
	saveReadingProgressQuery: mocks.saveReadingProgressQuery,
}));

vi.mock("@/app/(auth)/auth", () => ({
	auth: mocks.auth,
}));

// Import the action after mocks are set up
import { saveReadingProgress } from "@/app/actions/reader";

describe("Reader Progress Action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should save progress when user has access", async () => {
		const mockUser = { id: "123e4567-e89b-12d3-a456-426614174000", email: "test@example.com" };
		const mockProject = { id: "123e4567-e89b-12d3-a456-426614174001", userId: "123e4567-e89b-12d3-a456-426614174000" };

		mocks.auth.mockResolvedValue({ user: mockUser });
		mocks.projectRepository.findByIdWithAccess.mockResolvedValue(mockProject);
		mocks.saveReadingProgressQuery.mockResolvedValue([{ id: "1" }]);

		const result = await saveReadingProgress({
			projectId: "123e4567-e89b-12d3-a456-426614174001",
			chapterId: "123e4567-e89b-12d3-a456-426614174002",
			progress: 50,
		});

		expect(result.success).toBe(true);
		expect(mocks.projectRepository.findByIdWithAccess).toHaveBeenCalledWith(
			"123e4567-e89b-12d3-a456-426614174001",
			"123e4567-e89b-12d3-a456-426614174000",
		);
		expect(mocks.saveReadingProgressQuery).toHaveBeenCalledWith({
			projectId: "123e4567-e89b-12d3-a456-426614174001",
			userId: "123e4567-e89b-12d3-a456-426614174000",
			chapterId: "123e4567-e89b-12d3-a456-426614174002",
			progress: 50,
		});
	});

	it("should fail gracefully if project access denied", async () => {
		const mockUser = { id: "123e4567-e89b-12d3-a456-426614174000" };
		mocks.auth.mockResolvedValue({ user: mockUser });
		mocks.projectRepository.findByIdWithAccess.mockResolvedValue(null);

		const result = await saveReadingProgress({
			projectId: "123e4567-e89b-12d3-a456-426614174001",
			chapterId: "123e4567-e89b-12d3-a456-426614174002",
			progress: 50,
		});

		expect(result.success).toBe(false);
		expect(mocks.saveReadingProgressQuery).not.toHaveBeenCalled();
	});

	it("should return error when not logged in", async () => {
		mocks.auth.mockResolvedValue(null);

		const result = await saveReadingProgress({
			projectId: "123e4567-e89b-12d3-a456-426614174001",
			chapterId: "123e4567-e89b-12d3-a456-426614174002",
			progress: 50,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain("logged in");
		}
	});
});
