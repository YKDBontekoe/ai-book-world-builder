import { beforeEach, describe, expect, it, vi } from "vitest";

// Define mocks first
const mocks = vi.hoisted(() => {
	const updateBuilder = {
		set: vi.fn().mockReturnThis(),
		where: vi.fn().mockResolvedValue(true),
	};

	const queryBuilder = {
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockReturnThis(),
		limit: vi.fn(), // We'll mock impl later
	} as any;
	// biome-ignore lint/suspicious/noThenProperty: Intentional mock for Thenable
	queryBuilder.then = (resolve: any) => resolve([]); // Placeholder

	return {
		generateObject: vi.fn(),
		generateText: vi.fn().mockResolvedValue({ text: "Generated content" }),
		generateBookPlan: vi.fn(),
		planChapterScenes: vi.fn(),
		createBookFromPlan: vi.fn(),
		getSceneContextData: vi.fn(),
		updateSceneContent: vi.fn(),
		continueWriting: vi.fn().mockResolvedValue({ text: "Generated content" }),
		createScene: vi.fn().mockResolvedValue({ id: "new-scene-id" }),
		ensureProjectAccess: vi.fn().mockResolvedValue(true),
		getSelectedModelId: vi.fn().mockResolvedValue("mock-model-id"),
		// DB Mocks (no longer needed for some tests if using repository)
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockResolvedValue([{ id: "mock-id" }]),
		update: vi.fn().mockReturnValue(updateBuilder),
		updateBuilder,
		queryBuilder,
		transaction: vi.fn(),
	};
});

// Mock modules
vi.mock("ai", () => ({
	generateObject: mocks.generateObject,
	generateText: mocks.generateText,
}));

vi.mock("@/lib/ai/providers", () => ({
	myProvider: { languageModel: vi.fn() },
}));

vi.mock("@/lib/actions-utils", () => ({
	ensureProjectAccess: mocks.ensureProjectAccess,
}));

vi.mock("@/lib/ai/services/planning-service", () => ({
	planningService: {
		generateBookPlan: mocks.generateBookPlan,
		planChapterScenes: mocks.planChapterScenes,
	},
}));

vi.mock("@/lib/ai/writer-service", () => ({
	generationService: {
		continueWriting: mocks.continueWriting,
	},
}));

vi.mock("@/lib/db/repositories/story-repository", () => ({
	storyRepository: {
		createBookFromPlan: mocks.createBookFromPlan,
		getSceneContextData: mocks.getSceneContextData,
		updateSceneContent: mocks.updateSceneContent,
	},
}));

vi.mock("@/lib/ai/models", () => ({
	getSelectedModelId: mocks.getSelectedModelId,
}));

vi.mock("@/lib/db/queries/scene", () => ({
	createScene: mocks.createScene,
}));

vi.mock("@/lib/db/schema", () => ({
	outline: { id: "outline" },
	volume: { id: "volume" },
	chapter: { id: "chapter" },
	scene: { id: "scene" },
}));

// Complex DB Mocking State
const mockDbState = {
	queryResults: [] as any[],
};

// Update the hoisted mocks implementations to use the state
mocks.queryBuilder.limit.mockImplementation(() => {
	return Promise.resolve(mockDbState.queryResults.shift() || []);
});
// Set up thenable for mocks
// biome-ignore lint/suspicious/noThenProperty: Mocking thenable for Drizzle
mocks.queryBuilder.then = (resolve: any) => {
	resolve(mockDbState.queryResults.shift() || []);
};

vi.mock("@/lib/db/drizzle", () => ({
	db: {
		transaction: mocks.transaction.mockImplementation((cb) =>
			cb({
				insert: mocks.insert,
				values: mocks.values,
				returning: mocks.returning,
				select: () => mocks.queryBuilder,
			}),
		),
		select: () => mocks.queryBuilder,
		update: mocks.update,
	},
}));

vi.mock("drizzle-orm", () => ({
	eq: vi.fn(),
	asc: vi.fn(),
	desc: vi.fn(),
}));

import type { StoryStyle } from "@/lib/services/schemas/story-schemas";
import { storyService } from "@/lib/services/story-service";

describe("StoryService Smart Features", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockDbState.queryResults = [];
		// Restore default returns for chainable mocks if cleared
		mocks.insert.mockReturnThis();
		mocks.values.mockReturnThis();
		mocks.returning.mockResolvedValue([{ id: "mock-id" }]);
		mocks.update.mockReturnValue(mocks.updateBuilder);
		mocks.updateBuilder.set.mockReturnThis();
		mocks.updateBuilder.where.mockResolvedValue(true);
		mocks.queryBuilder.from.mockReturnThis();
		mocks.queryBuilder.where.mockReturnThis();
		mocks.queryBuilder.orderBy.mockReturnThis();
	});

	describe("generateBookPlan", () => {
		it("should include style parameters in the prompt", async () => {
			mocks.generateBookPlan.mockResolvedValueOnce({
				object: { title: "T", summary: "S", chapters: [] },
			});

			const style: StoryStyle = {
				genre: "Cyberpunk",
				pov: "First Person",
				tone: "Gritty",
			};

			await storyService.generateBookPlan("test prompt", style);

			expect(mocks.generateBookPlan).toHaveBeenCalledWith(
				"test prompt",
				style,
				undefined,
			);
		});
	});

	describe("createBookFromPlan", () => {
		it("should save style parameters to the outline", async () => {
			const plan = {
				title: "Title",
				logline: "Log",
				summary: "Sum",
				chapters: [],
			};
			const style: StoryStyle = {
				genre: "G",
				pov: "Second Person",
				tone: "Dark",
			};

			await storyService.createBookFromPlan("pid", plan, style);

			expect(mocks.createBookFromPlan).toHaveBeenCalledWith("pid", plan, style);
		});
	});

	describe("generateSceneText", () => {
		it("should construct smart context with style and history", async () => {
			// Setup DB responses for the sequence of queries:
			// 1. Scene (limit 1)
			// 2. Chapter (limit 1)
			// 3. Outline (limit 1)
			// 4. Scenes List (orderBy, no limit)

			const targetScene = {
				id: "s2",
				sequence: 2,
				chapterId: "c1",
				projectId: "p1",
				title: "Target Scene",
			};
			const targetChapter = {
				id: "c1",
				outlineId: "o1",
				title: "Chapter 1",
				notes: "Ch Notes",
			};
			const targetOutline = { id: "o1", pov: "First Person", tone: "Noir" };
			const scenesList = [
				{
					id: "s1",
					sequence: 1,
					title: "Prev Scene",
					content: "Previous content...",
				},
				{ id: "s2", sequence: 2, title: "Target Scene", content: "" },
			];

			mocks.getSceneContextData.mockResolvedValue({
				targetScene,
				targetChapter,
				targetOutline,
				scenesInChapter: scenesList,
			});

			await storyService.generateSceneText("s2");

			expect(mocks.continueWriting).toHaveBeenCalled();
			const args = mocks.continueWriting.mock.calls[0];
			const context = args[0];
			const options = args[2];

			// Verify Context
			expect(context).toContain("Chapter Title: Chapter 1");
			expect(context).toContain("[IMMEDIATELY PREVIOUS SCENE - Prev Scene]");
			expect(context).toContain("Previous content...");

			// Verify Style Injection
			expect(options.style).toBe("First Person, Noir");
		});
	});
});
