import { generateObject } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { generationService } from "@/lib/ai/writer-service";
import { db } from "@/lib/db/drizzle";

// Mocks
vi.mock("redis", () => ({
	createClient: vi.fn(() => ({
		on: vi.fn(),
		connect: vi.fn().mockResolvedValue(undefined),
		get: vi.fn().mockResolvedValue(null),
		set: vi.fn().mockResolvedValue("OK"),
		del: vi.fn().mockResolvedValue(1),
		scan: vi.fn().mockResolvedValue([0, []]),
	})),
}));

vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(() => Promise.resolve({ user: { id: "user-1" } })),
}));

vi.mock("@/lib/ai/models", () => ({
	getSelectedModelId: vi.fn(() => Promise.resolve("mock-model")),
}));

// Mock @upstash/ratelimit
const limitMock = vi.fn();
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
const redisDelMock = vi.fn();
vi.mock("@upstash/redis", () => ({
	Redis: class {
		static fromEnv = vi.fn(() => new this());
		del = redisDelMock;
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
	let createBookFromPlan: typeof import("@/app/actions/story-generation").createBookFromPlan;
	let generateBookPlan: typeof import("@/app/actions/story-generation").generateBookPlan;
	let generateSceneText: typeof import("@/app/actions/story-generation").generateSceneText;
	let planChapterScenes: typeof import("@/app/actions/story-generation").planChapterScenes;

	beforeEach(async () => {
		vi.resetModules();
		vi.stubEnv("UPSTASH_REDIS_REST_URL", "test_url");
		vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test_token");
		const storyGeneration = await import(
			"@/app/actions/story-generation"
		);
		createBookFromPlan = storyGeneration.createBookFromPlan;
		generateBookPlan = storyGeneration.generateBookPlan;
		generateSceneText = storyGeneration.generateSceneText;
		planChapterScenes = storyGeneration.planChapterScenes;
		vi.clearAllMocks();
	});

	describe("generateBookPlan", () => {
		it("should generate a book plan object", async () => {
			limitMock.mockResolvedValueOnce({ success: true });
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
				expect(result.plan).toEqual(mockPlan);
			}
		});

		it("should return an error if rate limited", async () => {
			limitMock.mockResolvedValueOnce({ success: false });
			const result = await generateBookPlan("A test prompt");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain("Rate limit exceeded");
			}
		});

		it("should proceed if rate limit check fails (fail-open)", async () => {
			limitMock.mockRejectedValueOnce(new Error("Redis error"));
			const mockPlan = {
				title: "Mock Title",
				logline: "Mock Logline",
				summary: "Mock Summary",
				chapters: [{ title: "Ch 1", summary: "Sum 1" }],
			};
			(generateObject as any).mockResolvedValue({ object: mockPlan });

			const result = await generateBookPlan("A test prompt");

			expect(result.success).toBe(true);
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
			limitMock.mockResolvedValueOnce({ success: true });
			(generateObject as any).mockResolvedValue({
				object: { scenes: [{ title: "Scene 1", beat: "beat" }] },
			});
			const result = await planChapterScenes(
				"123e4567-e89b-12d3-a456-426614174000",
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.sceneIds).toHaveLength(1);
				expect(result.sceneIds[0]).toBe("mock-id");
			}
		});
	});

	describe("generateSceneText", () => {
		it("should update scene content", async () => {
			limitMock.mockResolvedValueOnce({ success: true });
			const result = await generateSceneText(
				"1e3e4567-e89b-12d3-a456-426614174000",
			);
			expect(result.success).toBe(true);
			expect(generationService.continueWriting).toHaveBeenCalled();
			expect(db.update).toHaveBeenCalled();
		});
	});
});
