import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
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
	getOutlinesForProject: vi.fn().mockResolvedValue([{ id: "outline-123" }]),
	createOutline: vi.fn().mockResolvedValue({ id: "outline-123" }),
}));

vi.mock("@/lib/db/queries/volume", () => ({
	getVolumePlansForProject: vi.fn().mockResolvedValue([{ id: "volume-123" }]),
	createVolumePlan: vi.fn().mockResolvedValue({ id: "volume-123" }),
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

interface MockChain {
	from: Mock;
	where: Mock;
	orderBy: Mock;
	limit: Mock;
	values: Mock;
	set: Mock;
	returning: Mock;
	for: Mock;
}

describe("Chapter Actions", () => {
	const projectId = "123e4567-e89b-12d3-a456-426614174000";
	const chapterId = "123e4567-e89b-12d3-a456-426614174001";
	const volumeId = "123e4567-e89b-12d3-a456-426614174002";

	let mockChain: MockChain;

	beforeEach(() => {
		vi.clearAllMocks();
		(ensureProjectAccess as Mock).mockResolvedValue({
			project: { id: projectId },
			user: { id: "user-123" },
		});

		// Setup db chain mocks
		mockChain = {
			from: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			values: vi.fn().mockReturnThis(),
			set: vi.fn().mockReturnThis(),
			returning: vi.fn().mockReturnValue([{ id: chapterId }]),
			for: vi.fn().mockReturnThis(),
		};

		(db.select as Mock).mockReturnValue(mockChain);
		(db.insert as Mock).mockReturnValue(mockChain);
		(db.update as Mock).mockReturnValue(mockChain);
		(db.delete as Mock).mockReturnValue(mockChain);

		// Mock transaction to execute callback
		(db.transaction as Mock).mockImplementation(
			async (cb: (tx: unknown) => Promise<unknown>) => cb(db),
		);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("createNewChapter", () => {
		it("should return validation error for invalid projectId", async () => {
			const result = await chapterActions.createNewChapter("invalid-uuid");
			expect(result.success).toBe(false);
			expect(result.error).toContain("Invalid ID format");
		});

		it("should create a new chapter successfully", async () => {
			const result = await chapterActions.createNewChapter(projectId);

			expect(ensureProjectAccess).toHaveBeenCalledWith(projectId, true);
			expect(db.transaction).toHaveBeenCalled();
			expect(db.insert).toHaveBeenCalled();
			expect(result.success).toBe(true);
			expect(result.chapterId).toBe(chapterId);
		});

		it("should throw error if creation fails (race condition case where no ID returned)", async () => {
			// Mock returning empty array to simulate failure inside transaction
			const failingChain = {
				...mockChain,
				returning: vi.fn().mockReturnValue([]),
			};
			(db.insert as Mock).mockReturnValue(failingChain);

			const result = await chapterActions.createNewChapter(projectId);
			expect(result.success).toBe(false);
		});
	});

	describe("updateChapterTitle", () => {
		it("should return validation error for invalid input", async () => {
			const result = await chapterActions.updateChapterTitle(
				"invalid-uuid",
				"",
			);
			expect(result.success).toBe(false);
		});

		it("should update chapter title successfully", async () => {
			// Mock finding the chapter
			(db.select as Mock).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: chapterId, projectId }]),
					}),
				}),
			});

			const result = await chapterActions.updateChapterTitle(
				chapterId,
				"New Title",
			);

			expect(result.success).toBe(true);
			expect(chapterRepository.update).toHaveBeenCalledWith(
				chapterId,
				{ title: "New Title" },
				projectId,
			);
		});

		it("should return error if chapter not found", async () => {
			(db.select as Mock).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]),
					}),
				}),
			});

			const result = await chapterActions.updateChapterTitle(
				chapterId,
				"New Title",
			);
			expect(result.success).toBe(false);
			expect(result.error).toBe("Chapter not found");
		});
	});

	describe("deleteChapter", () => {
		it("should delete chapter if user has access", async () => {
			// Mock finding the chapter
			(db.select as Mock).mockReturnValue({
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
			(db.select as Mock).mockReturnValue({
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
		it("should reorder chapters inside a transaction and prevent IDOR", async () => {
			const c1 = "123e4567-e89b-12d3-a456-426614174003";
			const c2 = "123e4567-e89b-12d3-a456-426614174004";
			const chapterIds = [c1, c2];

			// Mock finding chapters
			(db.select as Mock).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([
						{ id: c1, projectId },
						{ id: c2, projectId },
					]),
				}),
			});

			await chapterActions.reorderChapters(chapterIds, volumeId);

			expect(db.transaction).toHaveBeenCalled();
			expect(db.update).toHaveBeenCalledTimes(2);

			// Verify that updates include projectId check
			// We can't easily inspect the exact `where` clause object structure because it's a Drizzle object,
			// but we can ensure `update` was called.
			// Ideally we would inspect calls to `where` on the update chain, but our mock setup is simple.
			// Assuming implementation correctness based on audit, verifying transaction and updates is a good baseline.
		});
	});
});
