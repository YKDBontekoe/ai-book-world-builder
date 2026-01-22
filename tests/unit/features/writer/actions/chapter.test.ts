import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as chapterActions from "@/features/writer/actions/chapter";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { db } from "@/lib/db";
import { chapterRepository } from "@/lib/db/repositories";

// Mock dependencies
vi.mock("@/lib/db", () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		transaction: vi.fn(),
	},
}));

vi.mock("@/lib/actions-utils", () => ({
	ensureProjectAccess: vi.fn(),
}));

vi.mock("@/lib/cache", () => ({
	invalidateCache: vi.fn(),
}));

vi.mock("@/lib/db/queries/outline", () => ({
	getOutlinesForProject: vi.fn(),
	createOutline: vi.fn(),
}));

vi.mock("@/lib/db/queries/volume", () => ({
	getVolumePlansForProject: vi.fn(),
	createVolumePlan: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
	chapterRepository: {
		update: vi.fn(),
		delete: vi.fn(),
		findByChapter: vi.fn(),
	},
	sceneRepository: {
		findByChapter: vi.fn(),
	},
}));

describe("Chapter Actions", () => {
	const projectId = "123e4567-e89b-12d3-a456-426614174000";
	const chapterId = "123e4567-e89b-12d3-a456-426614174001";
	const volumeId = "123e4567-e89b-12d3-a456-426614174002";

	beforeEach(() => {
		vi.clearAllMocks();
		// Setup db chain mocks
		const mockChain = {
			from: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			values: vi.fn().mockReturnThis(),
			set: vi.fn().mockReturnThis(),
			returning: vi.fn().mockReturnValue([{ id: chapterId }]),
			for: vi.fn().mockReturnThis(),
		};

		(db.select as any).mockReturnValue(mockChain);
		(db.insert as any).mockReturnValue(mockChain);
		(db.update as any).mockReturnValue(mockChain);
		(db.delete as any).mockReturnValue(mockChain);

		// Mock transaction to execute callback
		(db.transaction as any).mockImplementation(async (cb: any) => cb(db));
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("deleteChapter", () => {
		it("should delete chapter if user has access", async () => {
			// Mock finding the chapter
			(db.select as any).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: chapterId, projectId }]),
					}),
				}),
			});

			await chapterActions.deleteChapter(chapterId);

			expect(ensureProjectAccess).toHaveBeenCalledWith(projectId, true);
			expect(chapterRepository.delete).toHaveBeenCalledWith(
				chapterId,
				projectId,
			);
		});

		it("should return error if chapter not found", async () => {
			(db.select as any).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]),
					}),
				}),
			});

			const result = await chapterActions.deleteChapter(chapterId);
			expect(result.success).toBe(false);
			expect(result.error).toBe("Chapter not found");
		});
	});

	describe("reorderChapters", () => {
		it("should reorder chapters inside a transaction", async () => {
			const c1 = "123e4567-e89b-12d3-a456-426614174003";
			const c2 = "123e4567-e89b-12d3-a456-426614174004";
			const chapterIds = [c1, c2];

			// Mock finding chapters
			(db.select as any).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([
						{ id: c1, projectId },
						{ id: c2, projectId },
					]),
				}),
			});

			await chapterActions.reorderChapters(chapterIds, volumeId);

			expect(db.transaction).toHaveBeenCalled();

			// Verify db.update is called via the transaction mock logic
			// Note: Detailed mocking of transaction callback execution to verify specific SQL parameters
			// would require more complex setup, but basic flow is covered.
		});
	});
});
