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
		transaction: vi.fn(),
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
import { ensureProjectAccess } from "@/lib/actions-utils";
import { sceneRepository } from "@/lib/db/repositories";

const mockedSceneRepo = vi.mocked(sceneRepository);
const mockedEnsureAccess = vi.mocked(ensureProjectAccess);

const projectId = "project-123";
const chapterId = "chapter-123";
const targetChapterId = "chapter-456";
const sceneId = "123e4567-e89b-12d3-a456-426614174000"; // Valid UUID

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

// Valid ProjectContext mock
const mockProjectContext = {
	project: {
		id: projectId,
		name: "Test Project",
		userId: "user-123",
		createdAt: new Date(),
		visibility: "private" as const,
		description: null,
		folders: [],
		forkedFromId: null,
		lastViewedSceneId: null,
	},
	user: {
		id: "user-123",
		email: "test@example.com",
	},
};

// Helper to create a fully typed TX mock
const createTxMock = () => ({
	update: vi.fn().mockReturnThis(),
	set: vi.fn().mockReturnThis(),
	where: vi.fn().mockReturnThis(),
	insert: vi.fn().mockReturnThis(),
	values: vi.fn().mockReturnThis(),
	returning: vi.fn(),
	delete: vi.fn().mockReturnThis(),
	select: vi.fn().mockReturnThis(),
	from: vi.fn().mockReturnThis(),
	orderBy: vi.fn().mockReturnThis(),
	limit: vi.fn().mockReturnThis(),
});

describe("writer scene actions", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("duplicateScene", () => {
		it("duplicates a scene successfully", async () => {
			mockedSceneRepo.findById.mockResolvedValue(mockScene);
			mockedSceneRepo.findByChapter.mockResolvedValue([mockScene]);
			mockedEnsureAccess.mockResolvedValue(mockProjectContext);

			const newScene = {
				...mockScene,
				id: "scene-new",
				title: "Test Scene (Copy)",
				sequence: 2,
			};
			const txMock = createTxMock();
			txMock.returning.mockResolvedValue([newScene]);

			const { db } = await import("@/lib/db/drizzle");
			vi.mocked(db.transaction).mockImplementation(async (cb) => {
				return await cb(txMock as any);
			});

			const result = await duplicateScene(sceneId);

			expect(result.success).toBe(true);
			expect(result.sceneId).toBe("scene-new");

			// Verify update batch logic
			expect(txMock.update).toHaveBeenCalled();
			expect(txMock.set).toHaveBeenCalled(); // Should set sequence and updatedAt
			expect(txMock.where).toHaveBeenCalled(); // Should have where clause

			// Verify insert arguments
			expect(txMock.insert).toHaveBeenCalled();
			expect(txMock.values).toHaveBeenCalledWith(
				expect.objectContaining({
					projectId: mockScene.projectId,
					chapterId: mockScene.chapterId,
					title: `${mockScene.title} (Copy)`,
					content: mockScene.content,
					sequence: mockScene.sequence + 1,
					status: mockScene.status,
					prevSceneId: mockScene.id,
				}),
			);
		});

		it("fails if scene not found", async () => {
			mockedSceneRepo.findById.mockResolvedValue(null);
			const result = await duplicateScene(sceneId);
			expect(result.success).toBe(false);
			expect(result.error).toBe("Scene not found");
		});
	});

	describe("moveSceneToChapter", () => {
		it("moves a scene to another chapter", async () => {
			mockedSceneRepo.findById.mockResolvedValue(mockScene);
			mockedEnsureAccess.mockResolvedValue(mockProjectContext);

			const { db } = await import("@/lib/db/drizzle");

			// Mock finding target chapter
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi
							.fn()
							.mockResolvedValue([{ id: targetChapterId, projectId }]),
					}),
				}),
			} as any);

			const txMock = createTxMock();
			txMock.limit.mockResolvedValue([]); // No last scene

			vi.mocked(db.transaction).mockImplementation(async (cb) => {
				return await cb(txMock as any);
			});

			// Valid UUID for target chapter
			const validTargetChapterId = "123e4567-e89b-12d3-a456-426614174999";
			const result = await moveSceneToChapter(sceneId, validTargetChapterId);

			expect(result.success).toBe(true);
			expect(txMock.update).toHaveBeenCalled();
		});

		it("fails if target chapter is in different project", async () => {
			mockedSceneRepo.findById.mockResolvedValue(mockScene);

			const { db } = await import("@/lib/db/drizzle");
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi
							.fn()
							.mockResolvedValue([
								{ id: targetChapterId, projectId: "other-project" },
							]),
					}),
				}),
			} as any);

			const validTargetChapterId = "123e4567-e89b-12d3-a456-426614174999";
			const result = await moveSceneToChapter(sceneId, validTargetChapterId);
			expect(result.success).toBe(false);
			expect(result.error).toContain("different project");
		});

		it("fails if target chapter not found", async () => {
			mockedSceneRepo.findById.mockResolvedValue(mockScene);

			const { db } = await import("@/lib/db/drizzle");
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]),
					}),
				}),
			} as any);

			const validTargetChapterId = "123e4567-e89b-12d3-a456-426614174999";
			const result = await moveSceneToChapter(sceneId, validTargetChapterId);
			expect(result.success).toBe(false);
			expect(result.error).toBe("Target chapter not found");
		});

		it("fails if scene is already in target chapter", async () => {
			const sceneInTarget = { ...mockScene, chapterId: targetChapterId };
			mockedSceneRepo.findById.mockResolvedValue(sceneInTarget);

			const { db } = await import("@/lib/db/drizzle");
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi
							.fn()
							.mockResolvedValue([{ id: targetChapterId, projectId }]),
					}),
				}),
			} as any);

			// const validTargetChapterId = targetChapterId; // Same chapter
			// Need a valid UUID for targetChapterId if schema checks it, but here it's mocked string "chapter-456"
			// which might fail Zod uuid check. Let's use valid UUIDs.
			const uuidTarget = "123e4567-e89b-12d3-a456-426614174888";

			// Adjust mock scene to have this chapter ID
			mockedSceneRepo.findById.mockResolvedValue({
				...mockScene,
				chapterId: uuidTarget,
			});

			const result = await moveSceneToChapter(sceneId, uuidTarget);
			expect(result.success).toBe(false);
			expect(result.error).toBe("Scene is already in this chapter");
		});
	});
});
