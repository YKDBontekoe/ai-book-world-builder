import { generateObject } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createBookFromPlan,
	generateBookPlan,
	generateSceneText,
	planChapterScenes,
} from "@/app/actions/story-generation";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { generationService } from "@/lib/ai/writer-service";
import { storyRepository } from "@/lib/db/repositories/story-repository";
import { storyService } from "@/lib/services/story-service";
import { db } from "@/lib/db/drizzle";

// Mocks
vi.mock("@/lib/db/repositories/story-repository");
vi.mock("@/lib/services/story-service", () => ({
	storyService: {
		generateBookPlan: vi.fn(),
		createBookFromPlan: vi.fn(),
		planChapterScenes: vi.fn(),
		generateSceneText: vi.fn(),
	},
}));

vi.mock("@upstash/ratelimit", () => ({
	Ratelimit: class Ratelimit {
		static slidingWindow = vi.fn().mockReturnValue({
			limit: vi.fn().mockResolvedValue({ success: true }),
		});

		limit = vi.fn().mockResolvedValue({ success: true });
	},
}));

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
		generateObject: vi.fn(() =>
			Promise.resolve({
				object: {
					plan: { scenes: [{ title: "Mock Scene", beat: "Mock Beat" }] },
				},
			}),
		),
		generateText: vi.fn(() => Promise.resolve({ text: "Generated content" })),
	};
});

vi.mock("@/lib/db/drizzle", () => ({
	db: {
		transaction: vi.fn(async (cb) => cb(vi.fn() as any)),
	},
}));

vi.mock("@/lib/db/queries/scene", () => ({
	createScene: vi.fn(() => Promise.resolve({ id: "scene-1" })),
}));

// Mock Actions Utils
vi.mock("@/lib/actions-utils", () => ({
	ensureProjectAccess: vi.fn(() => Promise.resolve()),
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
			vi.mocked(storyService.generateBookPlan).mockResolvedValue({
				plan: mockPlan,
			});
			const result = await generateBookPlan("A test prompt");
			expect(result.success).toBe(true);
			expect(result.plan).toEqual(mockPlan);
		});
	});

	describe("createBookFromPlan", () => {
		it("should call the story service to create the book", async () => {
			const projectId = "proj-123";
			const plan = {
				title: "New Book",
				logline: "Logline",
				summary: "Summary",
				chapters: [{ title: "Chapter 1", summary: "Intro" }],
			};
			vi.mocked(storyService.createBookFromPlan).mockResolvedValue();

			const result = await createBookFromPlan(projectId, plan);
			expect(storyService.createBookFromPlan).toHaveBeenCalledWith(
				projectId,
				plan,
				undefined,
			);
			expect(result.success).toBe(true);
		});
	});

	describe("planChapterScenes", () => {
		it("should return scene IDs", async () => {
			const chapterId = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
			vi.mocked(storyService.planChapterScenes).mockResolvedValue(["mock-id"]);
			const result = await planChapterScenes(chapterId);
			expect(result.success).toBe(true);
			expect(result.sceneIds).toEqual(["mock-id"]);
		});
	});

	describe("generateSceneText", () => {
		it("should call the story service to generate text", async () => {
			const sceneId = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
			vi.mocked(storyService.generateSceneText).mockResolvedValue();
			const result = await generateSceneText(sceneId);
			expect(result.success).toBe(true);
			expect(storyService.generateSceneText).toHaveBeenCalledWith(sceneId);
		});
	});
});
