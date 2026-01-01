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

// Define Transaction type for typing purposes (simplified)
type TransactionMock = {
	update: ReturnType<typeof vi.fn>;
	set: ReturnType<typeof vi.fn>;
	where: ReturnType<typeof vi.fn>;
	insert: ReturnType<typeof vi.fn>;
	values: ReturnType<typeof vi.fn>;
	returning: ReturnType<typeof vi.fn>;
	delete: ReturnType<typeof vi.fn>;
	select: ReturnType<typeof vi.fn>;
	from: ReturnType<typeof vi.fn>;
	orderBy: ReturnType<typeof vi.fn>;
	limit: ReturnType<typeof vi.fn>;
};

// Helper to create a fully typed TX mock
const createTxMock = (): TransactionMock => ({
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
			// Mock select query for next scene inside transaction to return empty (no next scene)
			// The implementation expects an array from the select()...limit(1) chain
			// BUT, the `from()` mock returns `this`, so `where` is called on it, then `limit`.
			// The chain is: tx.select().from().where() -> .limit(1) is NOT called for select queries in standard Drizzle unless constructed so.
			// Wait, in my implementation: `const [nextScene] = await tx.select().from(scene).where(eq(scene.prevSceneId, targetScene.id));`
			// It does NOT use limit(1) there in the updated `duplicateScene` implementation I wrote in `src/app/actions/writer/scene.ts`.
			// Let's check `src/app/actions/writer/scene.ts`.
			// `const [nextScene] = await tx.select().from(scene).where(eq(scene.prevSceneId, targetScene.id));`
			// It just awaits the chain. `from` returns the query builder which is thenable.
			// So `where` should return a thenable that resolves to the array.

			// In `createTxMock`:
			// select: vi.fn().mockReturnThis(),
			// from: vi.fn().mockReturnThis(),
			// where: vi.fn().mockReturnThis(),
			// So awaiting `where(...)` returns `this` (the mock object), which is NOT an array.
			// The error "TypeError: (intermediate value) is not iterable" happens at `const [nextScene] = ...` because `...` returned the mock object, not an array.

			// We need `where` to be thenable and resolve to data OR strictly mock the chain to return data on the final call.
			// Since Drizzle queries are promises, we can mock `then`.
			// Or better, make the mock object a thenable that resolves to the desired data.

			// However, `duplicateScene` calls multiple queries.
			// 1. update ... where ... (returns result)
			// 2. insert ... values ... returning ... (returns [created])
			// 3. select ... where ... (returns [nextScene] or [])
			// 4. update ... set ... where ... (if nextScene exists)

			// We need specific return values for specific chains.
			// `tx.update` returns `this`, then `set` returns `this`, then `where` returns promise (void/result).
			// `tx.insert` returns `this`, `values` returns `this`, `returning` returns promise ([created]).
			// `tx.select` returns `this`, `from` returns `this`, `where` returns promise ([nextScene]).

			// The current `createTxMock` returns `this` for everything.
			// We need to differentiate based on the starting point (update vs insert vs select).

			const selectMock = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([]), // Default to empty array for select queries
			};

			const insertMock = {
				values: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([newScene]),
			};

			const updateMock = {
				set: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(undefined),
			};

			txMock.select.mockReturnValue(selectMock as any);
			txMock.insert.mockReturnValue(insertMock as any);
			txMock.update.mockReturnValue(updateMock as any);

			const { db } = await import("@/lib/db/drizzle");
			vi.mocked(db.transaction).mockImplementation(async (cb) => {
				return await cb(txMock as any);
			});

			const result = await duplicateScene(sceneId);

			expect(result.success).toBe(true);
			expect(result.sceneId).toBe("scene-new");

			// Verify update batch logic (sequence shifting)
			expect(txMock.update).toHaveBeenCalled();
			// Since we mocked update to return updateMock, assertions should be on updateMock for chained calls
			expect(updateMock.set).toHaveBeenCalled(); // Should set sequence and updatedAt
			expect(updateMock.where).toHaveBeenCalled(); // Should have where clause

			// Verify insert arguments
			expect(txMock.insert).toHaveBeenCalled();
			// Since we mocked insert to return insertMock, assertions should be on insertMock for chained calls
			expect(insertMock.values).toHaveBeenCalledWith(
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

			// Valid UUID for target chapter
			const validTargetChapterId = "123e4567-e89b-12d3-a456-426614174999";

			const { db } = await import("@/lib/db/drizzle");

			// Mock finding target chapter
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						// Fix: Return correct ID if requested, else empty or matching logic
						limit: vi.fn().mockImplementation(() => {
							// Simulating a successful find for the target chapter ID
							return Promise.resolve([{ id: validTargetChapterId, projectId }]);
						}),
					}),
				}),
			} as any);

			const txMock = createTxMock();
			txMock.limit.mockResolvedValue([]); // No last scene

			vi.mocked(db.transaction).mockImplementation(async (cb) => {
				return await cb(txMock as any);
			});

			const result = await moveSceneToChapter(sceneId, validTargetChapterId);

			expect(result.success).toBe(true);
			expect(txMock.update).toHaveBeenCalled();
		});

		it("fails if target chapter is in different project", async () => {
			mockedSceneRepo.findById.mockResolvedValue(mockScene);
			const validTargetChapterId = "123e4567-e89b-12d3-a456-426614174999";

			const { db } = await import("@/lib/db/drizzle");
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi
							.fn()
							.mockResolvedValue([
								{ id: validTargetChapterId, projectId: "other-project" },
							]),
					}),
				}),
			} as any);

			const result = await moveSceneToChapter(sceneId, validTargetChapterId);
			expect(result.success).toBe(false);
			expect(result.error).toContain("different project");
		});

		it("fails if target chapter not found", async () => {
			mockedSceneRepo.findById.mockResolvedValue(mockScene);
			const validTargetChapterId = "123e4567-e89b-12d3-a456-426614174999";

			const { db } = await import("@/lib/db/drizzle");
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]),
					}),
				}),
			} as any);

			const result = await moveSceneToChapter(sceneId, validTargetChapterId);
			expect(result.success).toBe(false);
			expect(result.error).toBe("Target chapter not found");
		});

		it("fails if scene is already in target chapter", async () => {
			const uuidTarget = "123e4567-e89b-12d3-a456-426614174888";

			// Mock DB select to return the target chapter
			const { db } = await import("@/lib/db/drizzle");
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: uuidTarget, projectId }]),
					}),
				}),
			} as any);

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
