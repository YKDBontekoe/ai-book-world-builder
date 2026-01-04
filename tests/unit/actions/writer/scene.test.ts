import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoist mocks
const { mockDb, mockSceneRepository, mockAuth } = vi.hoisted(() => ({
	mockDb: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		transaction: vi.fn(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
	},
	mockSceneRepository: {
		findByChapter: vi.fn(),
		create: vi.fn(),
	},
	mockAuth: vi.fn(() => Promise.resolve({ user: { id: "user-123" } })),
}));

// Apply mocks
vi.mock("@/lib/db/drizzle", () => ({
	db: mockDb,
}));

vi.mock("@/lib/db/repositories", () => ({
	sceneRepository: mockSceneRepository,
}));

vi.mock("@/lib/actions-utils", () => ({
	ensureProjectAccess: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/cache", () => ({
	invalidateCache: vi.fn(),
}));

vi.mock("@/app/(auth)/auth", () => ({
	auth: mockAuth,
}));

vi.mock("drizzle-orm", async (importOriginal) => {
	const actual = await importOriginal<typeof import("drizzle-orm")>();
	return {
		...actual,
		sql: (strings: TemplateStringsArray, ...values: any[]) => ({
			strings,
			values,
		}), // Simple mock for sql`` tag
	};
});

import { createSceneInChapter } from "@/app/actions/writer/scene";

describe("createSceneInChapter Action", () => {
	const validChapterId = "123e4567-e89b-12d3-a456-426614174000";
	const validSceneId = "123e4567-e89b-12d3-a456-426614174001";
	const validProjectId = "123e4567-e89b-12d3-a456-426614174002";

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.where.mockReturnThis();
		mockDb.limit.mockReturnThis();
		mockDb.update.mockReturnThis();
		mockDb.set.mockReturnThis();
		mockDb.insert.mockReturnThis();
		mockDb.values.mockReturnThis();
		mockDb.returning.mockReturnThis();
	});

	it("should create a scene at the end if no insertion point provided", async () => {
		// Mock Chapter existence
		mockDb.limit.mockResolvedValueOnce([{ id: validChapterId, projectId: validProjectId }]);

		// Mock existing scenes
		mockSceneRepository.findByChapter.mockResolvedValue([
			{ id: validSceneId, sequence: 1 },
			{ id: "123e4567-e89b-12d3-a456-426614174003", sequence: 2 },
		]);

		// Mock Transaction
		mockDb.transaction.mockImplementation(async (callback: any) => {
			return callback(mockDb);
		});

		// Mock Insert
		mockDb.returning.mockResolvedValue([{ id: "new-scene-id" }]);

		const result = await createSceneInChapter(validChapterId, "New Scene");

		expect(result).toEqual({ success: true, sceneId: "new-scene-id" });
		expect(mockDb.insert).toHaveBeenCalledWith(expect.anything()); // Check insert called
	});

	it("should shift sequences atomically when inserting in middle", async () => {
		// Mock Chapter
		mockDb.limit.mockResolvedValueOnce([{ id: validChapterId, projectId: validProjectId }]);

		// Mock Transaction
		mockDb.transaction.mockImplementation(async (callback: any) => {
			return callback(mockDb);
		});

		// Mock Insertion Point Query
		mockDb.limit.mockResolvedValueOnce([{ id: validSceneId, sequence: 1 }]);

		// Mock Update (Shift)
		mockDb.where.mockReturnThis();

		// Mock Insert
		mockDb.returning.mockResolvedValue([{ id: "new-scene-id" }]);

		const result = await createSceneInChapter(validChapterId, "Middle Scene", validSceneId);

		expect(result).toEqual({ success: true, sceneId: "new-scene-id" });

		// Verify Atomic Update was called
		expect(mockDb.update).toHaveBeenCalled();
		expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
			updatedAt: expect.any(Date),
		}));
	});

	it("should fail validation if inputs are invalid", async () => {
		const result = await createSceneInChapter("invalid-uuid", "");
		expect(result.success).toBe(false);
	});
});
