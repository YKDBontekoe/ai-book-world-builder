import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoist mocks using vi.hoisted to allow access inside vi.mock factory
const mocks = vi.hoisted(() => ({
	generateObject: vi.fn(),
	continueWriting: vi.fn(),
	createScene: vi.fn().mockResolvedValue({ id: "new-scene-id" }),
	ensureProjectAccess: vi.fn().mockResolvedValue(true),
	getSelectedModelId: vi.fn().mockResolvedValue("mock-model-id"),
	// Drizzle chainable mocks
	insert: vi.fn().mockReturnThis(),
	values: vi.fn().mockReturnThis(),
	returning: vi.fn().mockResolvedValue([{ id: "mock-id", sequence: 1 }]),
	select: vi.fn().mockReturnThis(),
	from: vi.fn().mockReturnThis(),
	where: vi.fn().mockReturnThis(),
	orderBy: vi.fn().mockReturnThis(),
	limit: vi
		.fn()
		.mockResolvedValue([
			{
				id: "mock-id",
				sequence: 1,
				content: "mock content",
				chapterId: "mock-chapter-id",
				projectId: "mock-project-id",
				notes: "mock notes",
				title: "mock title",
			},
		]),
	update: vi.fn().mockReturnThis(),
	set: vi.fn().mockReturnThis(),
	transaction: vi.fn(),
}));

// Mock modules
vi.mock("ai", () => ({
	generateObject: mocks.generateObject,
}));

vi.mock("@/lib/ai/providers", () => ({
	myProvider: {
		languageModel: vi.fn(),
	},
}));

vi.mock("@/lib/db/drizzle", () => ({
	db: {
		transaction: mocks.transaction.mockImplementation((callback) => {
			return callback({
				insert: mocks.insert,
				values: mocks.values,
				returning: mocks.returning,
				select: mocks.select,
				from: mocks.from,
				where: mocks.where,
				orderBy: mocks.orderBy,
				limit: mocks.limit,
				update: mocks.update,
				set: mocks.set,
			});
		}),
		select: mocks.select,
		from: mocks.from,
		where: mocks.where,
		orderBy: mocks.orderBy,
		limit: mocks.limit,
		update: mocks.update,
		set: mocks.set,
	},
}));

vi.mock("@/lib/db/schema", () => ({
	outline: "outline",
	volume: "volume",
	chapter: "chapter",
	scene: "scene",
	Vote: "Vote",
}));

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
	});

	describe("generateBookPlan", () => {
		it("should call generateObject with correct parameters", async () => {
			mocks.generateObject.mockResolvedValueOnce({
				object: { title: "Test Book", summary: "Summary", chapters: [] },
			});

			const result = await storyService.generateBookPlan("test prompt");

			expect(mocks.generateObject).toHaveBeenCalled();
			expect(result).toEqual({
				title: "Test Book",
				summary: "Summary",
				chapters: [],
			});
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
			expect(mocks.createScene).toHaveBeenCalled();
			expect(result).toEqual(["new-scene-id"]);
		});
	});
});
