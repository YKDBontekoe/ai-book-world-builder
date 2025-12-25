import { generateObject } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createBookFromPlan,
	generateBookPlan,
	generateSceneText,
	planChapterScenes,
} from "@/app/actions/story-generation";
import { generationService } from "@/lib/ai/writer-service";
import { db } from "@/lib/db/drizzle";
// Import repository to mock it
import { chapterRepository } from "@/lib/db/repositories/chapter-repository";

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
	requireAuth: vi.fn(() => Promise.resolve({ success: true, data: { id: "user-1" } })),
	ensureProjectAccess: vi.fn(),
	// Add the missing mock for withProjectWriteAccess
	withProjectWriteAccess: vi.fn(async (projectId, cb) => {
		// Mock implementation: just verify access (ensureProjectAccess is called inside usually)
		// and then call the callback
		const data = await cb({ project: { id: projectId }, user: { id: "user-1" } });
		return { success: true, data };
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
vi.mock("@/lib/ai/writer-service", async (importOriginal) => {
	// We can't import the actual class if we are mocking the module that exports it
	// unless we use importOriginal, but here we just want to mock the singleton instance.
	return {
		// Mock standard functions if they are still used (backward compat)
		continueWriting: vi.fn(() =>
			Promise.resolve({ text: "Generated scene content" }),
		),

		// Mock the service instance
		generationService: {
			continueWriting: vi.fn(() =>
				Promise.resolve({ text: "Generated scene content" }),
			),
			generateIdeas: vi.fn(),
			rewriteSelection: vi.fn(),
			draftScene: vi.fn(),
		},
	};
});

// Mock Chapter Repository
vi.mock("@/lib/db/repositories/chapter-repository", () => ({
	chapterRepository: {
		findById: vi.fn(() => Promise.resolve({ id: "ch-1", projectId: "p-1" })),
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

			(generateObject as any).mockResolvedValue({ object: mockPlan });

			const result = await generateBookPlan("A test prompt");

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.plan).toEqual(mockPlan);
			}
		});
	});

	describe("createBookFromPlan", () => {
		it("should use transaction to create entities", async () => {
			const projectId = "proj-123";
			const plan = {
				title: "New Book",
				logline: "Logline",
				summary: "Summary",
				chapters: [{ title: "Chapter 1", summary: "Intro" }],
			};

			// Mock db.transaction to return { success: true } or whatever the callback returns
			// In our code, createBookFromPlan calls `withProjectWriteAccess`, which we mocked to return the callback result.
			// The callback calls `storyService.createBookFromPlan`, which calls `db.transaction`.
			// `db.transaction` returns whatever the callback returns.
			// `storyService` usually returns void or something.
			// `createBookFromPlan` (action) returns the result of `withProjectWriteAccess`.
			// Since `withProjectWriteAccess` returns `Result`, and it wraps the callback which returns void...
			// Wait, my mock for `withProjectWriteAccess` returns `await cb()`.
			// The REAL `withProjectWriteAccess` (in my new impl) returns `ok(data)`.
			// So my mock should probably wrap the result in `ok()` if I want to match reality,
			// BUT `createBookFromPlan` action expects `Result<void>`.

			// Let's adjust the mock for `withProjectWriteAccess` to match the expected return type structure if needed,
			// OR just ensure the ACTION returns what we expect.
			// In `src/app/actions/story-generation.ts`:
			// return withProjectWriteAccess(projectId, async () => { ... });
			// `withProjectWriteAccess` implementation:
			// const data = await callback(context); return ok(data);

			// So my mock for `withProjectWriteAccess` should look like:
			// vi.fn(async (projectId, cb) => { await cb(...); return { success: true, data: undefined }; })

			// Let's update the mock in this test file (via `vi.mock`).

			const result = await createBookFromPlan(projectId, plan);
			expect(db.transaction).toHaveBeenCalled();
			// The result will be whatever `withProjectWriteAccess` returns.
			// We need to update the mock below.
		});
	});

	describe("planChapterScenes", () => {
		it("should return scene IDs", async () => {
			(generateObject as any).mockResolvedValue({
				object: { scenes: [{ title: "Scene 1", beat: "beat" }] },
			});

			const result = await planChapterScenes("ch-1");
			console.log("DEBUG RESULT:", JSON.stringify(result, null, 2));

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.sceneIds).toHaveLength(1);
				expect(result.data.sceneIds[0]).toBe("mock-id");
			}
		});
	});

	describe("generateSceneText", () => {
		it("should update scene content", async () => {
			const result = await generateSceneText("scene-1");
			expect(result.success).toBe(true);
			// Check if generationService.continueWriting was called
			expect(generationService.continueWriting).toHaveBeenCalled();
			expect(db.update).toHaveBeenCalled();
		});
	});
});
