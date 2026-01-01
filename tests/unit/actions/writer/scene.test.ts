
import { afterEach, describe, expect, it, vi } from "vitest";

// Hoist mocks to avoid execution order issues
vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(),
}));

vi.mock("@/lib/actions-utils", () => ({
	ensureProjectAccess: vi.fn(),
}));

// Mock repositories and DB
vi.mock("@/lib/db/repositories", () => ({
	sceneRepository: {
		findById: vi.fn(),
		findByChapter: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
	},
}));

vi.mock("@/lib/db/drizzle", () => ({
	db: {
		transaction: vi.fn((callback) => callback({
			update: vi.fn().mockReturnThis(),
			set: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			insert: vi.fn().mockReturnThis(),
			values: vi.fn().mockReturnThis(),
			returning: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
			select: vi.fn().mockReturnThis(),
			from: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
		})),
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
	},
}));

vi.mock("@/lib/cache", () => ({
	invalidateCache: vi.fn(),
}));

// Import implementations to test
import { duplicateScene, moveSceneToChapter } from "@/app/actions/writer/scene";
import { sceneRepository } from "@/lib/db/repositories";
import { ensureProjectAccess } from "@/lib/actions-utils";

const mockedSceneRepo = vi.mocked(sceneRepository);
const mockedEnsureAccess = vi.mocked(ensureProjectAccess);

const projectId = "project-123";
const chapterId = "chapter-123";
const targetChapterId = "chapter-456";
const sceneId = "scene-123";

const mockScene = {
	id: sceneId,
	projectId,
	chapterId,
	title: "Test Scene",
	sequence: 1,
	content: "Content",
	status: "planned",
	prevSceneId: null,
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("writer scene actions", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("duplicateScene", () => {
		it("duplicates a scene successfully", async () => {
			mockedSceneRepo.findById.mockResolvedValue(mockScene);
			mockedSceneRepo.findByChapter.mockResolvedValue([mockScene]);
			mockedEnsureAccess.mockResolvedValue();

			// Mock transaction result
			const newScene = { ...mockScene, id: "scene-new", title: "Test Scene (Copy)", sequence: 2 };
			// We need to mock the db transaction implementation specifically for this test if needed,
			// but since we mocked the entire db object above, the callback logic in the action is what runs.
			// However, our db mock above is a bit simplistic for the complex logic inside duplicateScene transaction.
			// The transaction callback in duplicateScene relies on the `tx` object passed to it.
			// The mock above returns a generic tx object.

			// We need to refine the db mock to handle the `insert(...).returning()` flow.
			const txMock = {
				update: vi.fn().mockReturnThis(),
				set: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				insert: vi.fn().mockReturnThis(),
				values: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([newScene]),
				select: vi.fn().mockReturnThis(),
				from: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
			};

			const { db } = await import("@/lib/db/drizzle");
			vi.mocked(db.transaction).mockImplementation(async (cb) => {
				return await cb(txMock as any);
			});

			const result = await duplicateScene(sceneId);

			expect(result.success).toBe(true);
			expect(result.sceneId).toBe("scene-new");
			expect(txMock.insert).toHaveBeenCalled();
			expect(txMock.returning).toHaveBeenCalled();
		});

		it("fails if scene not found", async () => {
			mockedSceneRepo.findById.mockResolvedValue(null);
			const result = await duplicateScene("invalid-id");
			expect(result.success).toBe(false);
			expect(result.error).toBe("Scene not found");
		});
	});

	describe("moveSceneToChapter", () => {
		it("moves a scene to another chapter", async () => {
			mockedSceneRepo.findById.mockResolvedValue(mockScene);
			mockedEnsureAccess.mockResolvedValue();

			const { db } = await import("@/lib/db/drizzle");

			// Mock finding target chapter
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: targetChapterId, projectId }]),
					}),
				}),
			} as any);

			const txMock = {
				update: vi.fn().mockReturnThis(),
				set: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				select: vi.fn().mockReturnThis(),
				from: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockReturnThis(),
				limit: vi.fn().mockResolvedValue([]), // No last scene in target
			};

			vi.mocked(db.transaction).mockImplementation(async (cb) => {
				return await cb(txMock as any);
			});

			const result = await moveSceneToChapter(sceneId, targetChapterId);

			expect(result.success).toBe(true);
			expect(txMock.update).toHaveBeenCalled();
		});

		it("fails if target chapter is in different project", async () => {
			mockedSceneRepo.findById.mockResolvedValue(mockScene);

			const { db } = await import("@/lib/db/drizzle");
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: targetChapterId, projectId: "other-project" }]),
					}),
				}),
			} as any);

			const result = await moveSceneToChapter(sceneId, targetChapterId);
			expect(result.success).toBe(false);
			expect(result.error).toContain("different project");
		});
	});
});
