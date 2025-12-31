import { generateObject } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createBookFromPlan,
	generateBookPlan,
	generateSceneText,
	planChapterScenes,
} from "@/app/actions/story-generation";
import { db } from "@/lib/db/drizzle";
import { storyService } from "@/lib/services/story-service";

// Mocks
vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(() => Promise.resolve({ user: { id: "user-1" } })),
}));

vi.mock("@/lib/ai/models", () => ({
	getSelectedModelId: vi.fn(() => Promise.resolve("mock-model")),
}));

vi.mock("ai", async (importOriginal) => {
	const actual = await importOriginal<typeof import("ai")>();
	return {
		...actual,
		generateObject: vi.fn(),
		generateText: vi.fn(() => Promise.resolve({ text: "Generated content" })),
	};
});

// Mock DB chain helper
const mockDbChain = () => {
	const chain = {
		values: vi.fn(() => chain),
		returning: vi.fn(() => Promise.resolve([{ id: "mock-id", sequence: 1 }])),
		from: vi.fn(() => chain),
		where: vi.fn(() => chain),
		orderBy: vi.fn(() => chain), // Return chain for chaining
		limit: vi.fn(() =>
			Promise.resolve([
				{
					id: "mock-id",
					title: "Test",
					notes: "Notes",
					projectId: "p-1",
					content: "prev",
					sequence: 1,
				},
			]),
		),
		set: vi.fn(() => chain),
	};
	return chain;
};

// Override orderBy for the scenes.filter case where it needs to return an array promise directly
// IF it's not chained with limit.
// Actually, `generateSceneText` calls `orderBy(asc(scene.sequence))` and expects a promise that resolves to an array.
// But `createBookFromPlan` calls `orderBy().limit()`.
// Drizzle supports both. In our mock, if `orderBy` returns the chain, we can't await it to get the array.
// We need a mock that acts as both a promise and an object with methods.

const createMockQuery = (resolveValue: any) => {
	const query: any = Promise.resolve(resolveValue);
	query.values = vi.fn(() => query);
	query.returning = vi.fn(() =>
		Promise.resolve([{ id: "mock-id", sequence: 1 }]),
	);
	query.from = vi.fn(() => query);
	query.where = vi.fn(() => query);
	query.orderBy = vi.fn(() => query);
	query.limit = vi.fn(() =>
		Promise.resolve([
			{
				id: "mock-id",
				title: "Test",
				notes: "Notes",
				projectId: "p-1",
				content: "prev",
				sequence: 1,
			},
		]),
	);
	query.set = vi.fn(() => query);

	// For the filter case, we need the array.
	// If orderBy is the last call, it should resolve to the array.
	// Let's explicitly mock the implementation of orderBy to return a new query that resolves to an array
	// unless limit is called on it.

	// Simpler approach: Just mock `orderBy` to return a Promise that has a `limit` method attached.
	query.orderBy = vi.fn(() => {
		const orderedQuery: any = Promise.resolve([
			{ id: "s-1", title: "S1", content: "c", sequence: 1, chapterId: "c-1" },
			{ id: "s-2", title: "S2", content: "c", sequence: 2, chapterId: "c-1" },
		]);
		orderedQuery.limit = vi.fn(() =>
			Promise.resolve([
				{
					id: "mock-id",
					title: "Test",
					notes: "Notes",
					projectId: "p-1",
					content: "prev",
					sequence: 1,
				},
			]),
		);
		return orderedQuery;
	});

	return query;
};

const mockQuery = createMockQuery([]);

vi.mock("@/lib/db/drizzle", () => ({
	db: {
		transaction: vi.fn(async (cb) => {
			return await cb({
				insert: vi.fn(() => mockQuery),
				select: vi.fn(() => mockQuery),
				update: vi.fn(() => mockQuery),
			});
		}),
		insert: vi.fn(() => mockQuery),
		select: vi.fn(() => mockQuery),
		update: vi.fn(() => mockQuery),
	},
}));

vi.mock("@/lib/db/queries/scene", () => ({
	createScene: vi.fn(() => Promise.resolve({ id: "scene-1" })),
}));

// Mock Actions Utils
vi.mock("@/lib/actions-utils", () => ({
	ensureProjectAccess: vi.fn(),
	// Add the missing mock for withProjectWriteAccess
	withProjectWriteAccess: vi.fn(async (projectId, cb) => {
		// Mock implementation: just verify access (ensureProjectAccess is called inside usually)
		// and then call the callback
		// We can spy that ensureProjectAccess was called if needed, but since we mock the whole wrapper,
		// we just execute the callback.
		return await cb({ project: { id: projectId }, user: { id: "user-1" } });
	}),
}));

vi.mock("next/headers", () => ({
	cookies: () => ({
		get: () => ({ value: "gpt-4o" }),
	}),
}));

vi.mock("@/lib/ai/providers", () => ({
	myProvider: {
		languageModel: vi.fn(),
	},
}));

// Use importOriginal to include non-mocked exports like GenerationService if needed,
// but for `generationService` instance, we want to mock its methods.
vi.mock("@/lib/services/story-service", () => ({
	storyService: {
		generateBookPlan: vi.fn(),
		createBookFromPlan: vi.fn(),
		planChapterScenes: vi.fn(),
		generateSceneText: vi.fn(),
	},
}));

// Test Suite
describe("Story Generation Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("generateBookPlan", () => {
		it("should generate a book plan object", async () => {
			const mockPlan = {
				title: "Mock Title",
				logline: "Mock Logline",
				summary: "Mock Summary",
				chapters: [{ title: "Ch 1", summary: "Sum 1" }],
			};

			(storyService.generateBookPlan as any).mockResolvedValue({
				plan: mockPlan,
			});

			const result = await generateBookPlan("A test prompt");

			expect(result.success).toBe(true);
			expect(result.plan).toEqual(mockPlan);
			expect(storyService.generateBookPlan).toHaveBeenCalledWith(
				"A test prompt",
				undefined,
				undefined,
			);
		});
	});

	describe("createBookFromPlan", () => {
		it("should create a book from a plan", async () => {
			const projectId = "proj-123";
			const plan = {
				title: "New Book",
				logline: "Logline",
				summary: "Summary",
				chapters: [{ title: "Chapter 1", summary: "Intro" }],
			};
			(storyService.createBookFromPlan as any).mockResolvedValue(undefined);

			const result = await createBookFromPlan(projectId, plan);

			expect(result.success).toBe(true);
			expect(storyService.createBookFromPlan).toHaveBeenCalledWith(
				projectId,
				plan,
				undefined,
			);
		});
	});

	describe("planChapterScenes", () => {
		it("should return scene IDs", async () => {
			const chapterId = "123e4567-e89b-12d3-a456-426614174000";
			(storyService.planChapterScenes as any).mockResolvedValue(["scene-1"]);
			const result = await planChapterScenes(chapterId);
			expect(result.success).toBe(true);
			expect(result.sceneIds).toEqual(["scene-1"]);
			expect(storyService.planChapterScenes).toHaveBeenCalledWith(chapterId);
		});
	});

	describe("generateSceneText", () => {
		it("should trigger scene text generation", async () => {
			const sceneId = "123e4567-e89b-12d3-a456-426614174001";
			(storyService.generateSceneText as any).mockResolvedValue(undefined);
			const result = await generateSceneText(sceneId);
			expect(result.success).toBe(true);
			expect(storyService.generateSceneText).toHaveBeenCalledWith(sceneId);
		});
	});
});
