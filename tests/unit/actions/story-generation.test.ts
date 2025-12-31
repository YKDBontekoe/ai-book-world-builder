import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

// Set env vars before any other imports to ensure ratelimit is initialized
process.env.UPSTASH_REDIS_REST_URL = "mock-url";
process.env.UPSTASH_REDIS_REST_TOKEN = "mock-token";

import type {
	BookPlan,
	createBookFromPlan,
	generateBookPlan,
	generateSceneText,
	planChapterScenes,
} from "@/app/actions/story-generation";
import { storyService } from "@/lib/services/story-service";

// --- Mocks ---
vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(() => Promise.resolve({ user: { id: "user-1" } })),
}));

vi.mock("@/lib/ai/models", () => ({
	getSelectedModelId: vi.fn(() => Promise.resolve("mock-model")),
}));

vi.mock("@upstash/redis", () => ({
	Redis: class {
		static fromEnv = vi.fn(() => new this());
		constructor() {}
	},
}));

vi.mock("ai", () => ({
	generateObject: vi.fn(),
	generateText: vi.fn(() => Promise.resolve({ text: "Generated content" })),
}));

const createMockQuery = () => {
	const query: any = Promise.resolve([{ id: "mock-id", sequence: 1 }]);
	query.values = vi.fn(() => query);
	query.returning = vi.fn(() => query);
	query.from = vi.fn(() => query);
	query.where = vi.fn(() => query);
	query.orderBy = vi.fn(() => query);
	query.limit = vi.fn(() => query);
	query.set = vi.fn(() => query);
	return query;
};

const mockQuery = createMockQuery();
vi.mock("@/lib/db/drizzle", () => ({
	db: {
		transaction: vi.fn(async (cb) =>
			cb({
				insert: vi.fn(() => mockQuery),
				select: vi.fn(() => mockQuery),
				update: vi.fn(() => mockQuery),
			}),
		),
		insert: vi.fn(() => mockQuery),
		select: vi.fn(() => mockQuery),
		update: vi.fn(() => mockQuery),
	},
}));

vi.mock("@/lib/actions-utils", () => ({
	withProjectWriteAccess: vi.fn(async (projectId, cb) => {
		// Directly call the callback to simulate the HOF behavior
		return cb();
	}),
}));

vi.mock("next/headers", () => ({
	cookies: () => ({ get: () => ({ value: "gpt-4o" }) }),
}));

vi.mock("@/lib/services/story-service", () => ({
	storyService: {
		generateBookPlan: vi.fn(),
		createBookFromPlan: vi.fn(() => Promise.resolve()),
		planChapterScenes: vi.fn(() => Promise.resolve(["mock-id"])),
		generateSceneText: vi.fn(() => Promise.resolve()),
	},
}));

// --- Test Suite ---
describe("Story Generation Actions", () => {
	let actions: {
		generateBookPlan: typeof generateBookPlan;
		createBookFromPlan: typeof createBookFromPlan;
		planChapterScenes: typeof planChapterScenes;
		generateSceneText: typeof generateSceneText;
	};
	let limitMock: Mock;

	beforeEach(async () => {
		vi.resetModules(); // Reset module cache before each test
		limitMock = vi.fn();

		// Mock dependencies that need to be fresh for each module load
		vi.doMock("@upstash/ratelimit", () => ({
			Ratelimit: class {
				static slidingWindow = vi.fn();
				limit = limitMock;
			},
		}));

		// Dynamically import the module to get a fresh instance with new mocks
		actions = await import("@/app/actions/story-generation");
		vi.clearAllMocks();
	});

	describe("generateBookPlan", () => {
		it("should generate a book plan object", async () => {
			limitMock.mockResolvedValue({ success: true });
			const mockPlan: BookPlan = {
				title: "Mock Title",
				logline: "A logline",
				summary: "A summary",
				chapters: [{ title: "Chapter 1", summary: "Chapter summary" }],
			};
			(storyService.generateBookPlan as Mock).mockResolvedValue({
				plan: mockPlan,
			});

			const result = await actions.generateBookPlan(
				"A valid prompt of sufficient length",
			);

			expect(result.success).toBe(true);
			if (result.success) expect(result.plan).toEqual(mockPlan);
		});

		it("should return an error when rate limited", async () => {
			limitMock.mockResolvedValue({
				success: false,
			});

			const result = await actions.generateBookPlan(
				"A valid prompt of sufficient length",
			);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain("Rate limit exceeded");
			}
		});

		it("should fail open and succeed if the rate limit check throws", async () => {
			limitMock.mockRejectedValue(new Error("Redis connection failed"));
			const mockPlan: BookPlan = {
				title: "Fail-Open Plan",
				logline: "A logline",
				summary: "A summary",
				chapters: [{ title: "Chapter 1", summary: "Chapter summary" }],
			};
			(storyService.generateBookPlan as Mock).mockResolvedValue({
				plan: mockPlan,
			});

			const result = await actions.generateBookPlan(
				"A valid prompt of sufficient length",
			);

			expect(result.success).toBe(true);
			if (result.success) expect(result.plan).toEqual(mockPlan);
		});
	});

	describe("createBookFromPlan", () => {
		it("should call storyService to create book from plan", async () => {
			const plan: BookPlan = {
				title: "New Book",
				logline: "A logline",
				summary: "A summary",
				chapters: [{ title: "Chapter 1", summary: "Chapter summary" }],
			};
			const result = await actions.createBookFromPlan("proj-123", plan);

			expect(storyService.createBookFromPlan).toHaveBeenCalledWith(
				"proj-123",
				plan,
				undefined,
			);
			expect(result.success).toBe(true);
		});
	});

	describe("planChapterScenes", () => {
		it("should return scene IDs", async () => {
			limitMock.mockResolvedValue({ success: true });
			const result = await actions.planChapterScenes(
				"123e4567-e89b-12d3-a456-426614174000",
			);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.sceneIds).toEqual(["mock-id"]);
			}
		});
	});

	describe("generateSceneText", () => {
		it("should update scene content", async () => {
			limitMock.mockResolvedValue({ success: true });
			const result = await actions.generateSceneText(
				"123e4567-e89b-12d3-a456-426614174000",
			);

			expect(result.success).toBe(true);
			expect(storyService.generateSceneText).toHaveBeenCalledWith(
				"123e4567-e89b-12d3-a456-426614174000",
			);
		});
	});
});
