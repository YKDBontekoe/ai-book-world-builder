import { generateObject } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db/drizzle";
import { generationService } from "@/lib/ai/writer-service";

// Set mock env vars to ensure the ratelimiter is instantiated
process.env.UPSTASH_REDIS_REST_URL = "MOCK_URL";
process.env.UPSTASH_REDIS_REST_TOKEN = "MOCK_TOKEN";

// Mocks
vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(() => Promise.resolve({ user: { id: "user-1" } })),
}));

vi.mock("@/lib/ai/models", () => ({
	getSelectedModelId: vi.fn(() => Promise.resolve("mock-model")),
}));

const { limitMock } = vi.hoisted(() => {
	return { limitMock: vi.fn() };
});

// Mock @upstash/ratelimit
vi.mock("@upstash/ratelimit", () => {
	return {
		Ratelimit: class {
			static slidingWindow = vi.fn();
			limit = limitMock;
			constructor() {}
		},
	};
});

// Mock @upstash/redis
vi.mock("@upstash/redis", () => ({
	Redis: class {
		static fromEnv = vi.fn(() => new this());
		constructor() {}
	},
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

	// Mocking orderBy behavior for arrays
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
	withProjectWriteAccess: vi.fn(async (projectId, cb) => {
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

vi.mock("@/lib/ai/writer-service", async (importOriginal) => {
	return {
		continueWriting: vi.fn(() =>
			Promise.resolve({ text: "Generated scene content" }),
		),
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

describe("Story Generation Actions", () => {
	let createBookFromPlan: any,
		generateBookPlan: any,
		generateSceneText: any,
		planChapterScenes: any;

	beforeEach(async () => {
		vi.resetModules();
		vi.clearAllMocks();
		limitMock.mockResolvedValue({ success: true }); // Default to success

		// Re-import actions to get fresh instances with new mocks
		const actions = await import("@/app/actions/story-generation");
		createBookFromPlan = actions.createBookFromPlan;
		generateBookPlan = actions.generateBookPlan;
		generateSceneText = actions.generateSceneText;
		planChapterScenes = actions.planChapterScenes;
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
			expect(result.plan).toEqual(mockPlan);
		});

		it("should return error when rate limited", async () => {
			limitMock.mockResolvedValueOnce({
				success: false,
				limit: 10,
				remaining: 0,
				reset: Date.now() + 60000,
			});

			const result = await generateBookPlan("A test prompt that is long enough");
			expect(result.success).toBe(false);
			expect(result.error).toContain("Rate limit exceeded");
		});

		it("should fail open and allow request if rate limit check throws", async () => {
			limitMock.mockRejectedValueOnce(new Error("Redis error"));

			const mockPlan = {
				title: "Fail-Open Title",
				logline: "Logline",
				summary: "Summary",
				chapters: [],
			};
			(generateObject as any).mockResolvedValue({ object: mockPlan });

			const result = await generateBookPlan("A valid prompt for fail-open");
			expect(result.success).toBe(true);
			expect(result.plan).toEqual(mockPlan);
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

			const result = await createBookFromPlan(projectId, plan);
			expect(db.transaction).toHaveBeenCalled();
			expect(result.success).toBe(true);
		});
	});

	describe("planChapterScenes", () => {
		it("should return scene IDs", async () => {
			(generateObject as any).mockResolvedValue({
				object: { scenes: [{ title: "Scene 1", beat: "beat" }] },
			});
			const result = await planChapterScenes("123e4567-e89b-12d3-a456-426614174000");
			expect(result.success).toBe(true);
			expect(result.sceneIds).toHaveLength(1);
			expect(result.sceneIds?.[0]).toBe("mock-id");
		});
	});

	describe("generateSceneText", () => {
		it("should update scene content", async () => {
			const result = await generateSceneText("123e4567-e89b-12d3-a456-426614174000");
			expect(result.success).toBe(true);
			expect(generationService.continueWriting).toHaveBeenCalled();
			expect(db.update).toHaveBeenCalled();
		});
	});
});
