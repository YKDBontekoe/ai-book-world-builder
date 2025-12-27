import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoist mocks using vi.hoisted to allow access inside vi.mock factory
const mocks = vi.hoisted(() => {
	const chain: any = {};
	chain.generateObject = vi.fn();
	chain.continueWriting = vi.fn();
	chain.createScene = vi.fn().mockResolvedValue({ id: "new-scene-id" });
	chain.ensureProjectAccess = vi.fn().mockResolvedValue(true);
	chain.getSelectedModelId = vi.fn().mockResolvedValue("mock-model-id");

	// Drizzle chainable mocks
	// We use mockReturnValue(chain) instead of mockReturnThis() to ensure
	// it always returns this chain object, regardless of call context.
	chain.insert = vi.fn().mockReturnValue(chain);
	chain.values = vi.fn().mockReturnValue(chain);
	chain.returning = vi.fn().mockResolvedValue([{ id: "mock-id", sequence: 1 }]);
	chain.select = vi.fn().mockReturnValue(chain);
	chain.from = vi.fn().mockReturnValue(chain);
	chain.where = vi.fn().mockReturnValue(chain);
	chain.orderBy = vi.fn().mockReturnValue(chain);
	chain.limit = vi.fn().mockResolvedValue([
		{
			id: "mock-id",
			sequence: 1,
			content: "mock content",
			chapterId: "mock-chapter-id",
			projectId: "mock-project-id",
			notes: "mock notes",
			title: "mock title",
		},
	]);
	chain.update = vi.fn().mockReturnValue(chain);
	chain.set = vi.fn().mockReturnValue(chain);

	chain.transaction = vi.fn((callback) => {
		return callback({
			insert: chain.insert,
			values: chain.values,
			returning: chain.returning,
			select: chain.select,
			from: chain.from,
			where: chain.where,
			orderBy: chain.orderBy,
			limit: chain.limit,
			update: chain.update,
			set: chain.set,
		});
	});

	return chain;
});

// Mock modules
vi.mock("ai", async (importOriginal) => {
	const actual = await importOriginal<typeof import("ai")>();
	return {
		...actual,
		generateObject: mocks.generateObject,
	};
});

vi.mock("@/lib/ai/providers", () => ({
	myProvider: {
		languageModel: vi.fn(),
	},
}));

vi.mock("@/lib/db/drizzle", () => ({
	db: {
		transaction: mocks.transaction,
		insert: mocks.insert,
		select: mocks.select,
		from: mocks.from,
		where: mocks.where,
		orderBy: mocks.orderBy,
		limit: mocks.limit,
		update: mocks.update,
		set: mocks.set,
	},
}));

vi.mock("@/lib/db/schema", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/lib/db/schema")>();
	return {
		...actual,
	};
});

vi.mock("@/lib/actions-utils", () => ({
	ensureProjectAccess: mocks.ensureProjectAccess,
}));

vi.mock("drizzle-orm", () => ({
	eq: vi.fn(),
	asc: vi.fn(),
	desc: vi.fn(),
}));

vi.mock("@/lib/ai/writer", () => ({
	continueWriting: mocks.continueWriting,
}));

vi.mock("@/lib/db/queries/scene", () => ({
	createScene: mocks.createScene,
	getScenesForProject: vi.fn(),
}));

vi.mock("@/lib/ai/models", () => ({
	getSelectedModelId: mocks.getSelectedModelId,
}));

// Import the service after mocking
import { storyService } from "@/lib/services/story-service";

describe("StoryService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset specific return values if needed
		mocks.insert.mockReturnValue(mocks);
		mocks.values.mockReturnValue(mocks);
		mocks.returning.mockResolvedValue([{ id: "mock-id", sequence: 1 }]);
	});

	describe("generateBookPlan", () => {
		it("should call generateObject with correct parameters", async () => {
			mocks.generateObject.mockResolvedValueOnce({
				object: { title: "Test Book", summary: "Summary", chapters: [] },
			});

			const result = await storyService.generateBookPlan("test prompt");

			expect(mocks.generateObject).toHaveBeenCalled();
			expect(result).toEqual({
				plan: {
					title: "Test Book",
					summary: "Summary",
					chapters: [],
				},
			});
		});

		it("should return error if generation fails", async () => {
			mocks.generateObject.mockRejectedValueOnce(new Error("AI error"));

			const result = await storyService.generateBookPlan("test prompt");

			expect(result).toHaveProperty("error");
			expect(result.error).toBe("AI error");
		});
	});

	describe("createBookFromPlan", () => {
		it("should execute transaction and insert records", async () => {
			const plan = {
				title: "Test Book",
				logline: "Logline",
				summary: "Summary",
				chapters: [{ title: "Ch1", summary: "Sum1" }],
			};

			await storyService.createBookFromPlan("project-id", plan);

			expect(mocks.ensureProjectAccess).toHaveBeenCalledWith(
				"project-id",
				true,
			);
			expect(mocks.transaction).toHaveBeenCalled();
			expect(mocks.insert).toHaveBeenCalledTimes(4); // Outline, Volume, Chapter, Scene
		});
	});

	describe("planChapterScenes", () => {
		it("should generate scenes and create them", async () => {
			mocks.generateObject.mockResolvedValueOnce({
				object: { scenes: [{ title: "Scene 1", beat: "Beat 1" }] },
			});

			const result = await storyService.planChapterScenes("chapter-id");

			expect(mocks.ensureProjectAccess).toHaveBeenCalled();
			expect(mocks.generateObject).toHaveBeenCalled();
			expect(mocks.insert).toHaveBeenCalled(); // Should call batch insert
			expect(result).toEqual(["mock-id"]); // Returns mock-id from mocks.returning
		});
	});
});
