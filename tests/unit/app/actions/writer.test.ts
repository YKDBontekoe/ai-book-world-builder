import { beforeEach, describe, expect, it, vi } from "vitest";

// Define valid UUIDs for testing using vi.hoisted so they are available in mocks
const { VALID_CHAPTER_ID, VALID_PROJECT_ID, VALID_SCENE_ID, NEW_SCENE_ID } = vi.hoisted(() => ({
	VALID_CHAPTER_ID: "123e4567-e89b-12d3-a456-426614174000",
	VALID_PROJECT_ID: "123e4567-e89b-12d3-a456-426614174001",
	VALID_SCENE_ID: "123e4567-e89b-12d3-a456-426614174002",
	NEW_SCENE_ID: "123e4567-e89b-12d3-a456-426614174003",
}));

vi.mock("@/lib/db/drizzle", () => {
	const mockChapter = {
		id: VALID_CHAPTER_ID,
		projectId: VALID_PROJECT_ID,
		title: "Chapter 1",
		notes: "Notes",
	};
	const mockScenes = [
		{
			id: VALID_SCENE_ID,
			title: "Scene 1",
			content: "Content",
			sequence: 1,
			chapterId: VALID_CHAPTER_ID,
		},
	];
	const mockNewScene = {
		id: NEW_SCENE_ID,
		title: "AI Generated Scene",
		sequence: 2,
		chapterId: VALID_CHAPTER_ID,
	};

	return {
		db: {
			select: vi.fn(() => ({
				from: (table: any) => {
					return {
						where: () => {
							return {
								orderBy: () => Promise.resolve(mockScenes), // For scenes
								// biome-ignore lint/suspicious/noThenProperty: Mocking Promise-like interface
								then: (resolve: any) => resolve([mockChapter]), // For chapter
								limit: () => Promise.resolve([mockChapter]), // For limit(1)
								[Symbol.iterator]: function* () {
									yield mockChapter;
								},
							};
						},
					};
				},
			})),
			insert: vi.fn(() => ({
				values: vi.fn(() => ({
					returning: vi.fn(() => [mockNewScene]),
				})),
			})),
			update: vi.fn(() => ({
				set: vi.fn(() => ({
					where: vi.fn(),
				})),
			})),
		},
	};
});

// Mock @/lib/ai/writer
vi.mock("@/lib/ai/writer", () => ({
	continueWriting: vi.fn().mockResolvedValue({ text: "Generated content" }),
}));

// Mock @/lib/db/queries/scene
vi.mock("@/lib/db/queries/scene", () => ({
	createScene: vi.fn().mockResolvedValue({
		id: NEW_SCENE_ID,
		title: "AI Generated Scene",
		sequence: 2,
	}),
	getScenesForProject: vi.fn().mockResolvedValue([]),
}));

// Mock Auth and Project Queries
vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn().mockResolvedValue({ user: { id: "user-1" } }),
}));

vi.mock("@/lib/db/queries/project", () => ({
	getProjectByIdWithAccess: vi.fn().mockResolvedValue({
		id: VALID_PROJECT_ID,
		userId: "user-1",
		visibility: "private",
	}),
}));

// Mock the project repository (used by actions-utils)
vi.mock("@/lib/db/repositories/project-repository", () => ({
	projectRepository: {
		findByIdWithAccess: vi.fn().mockResolvedValue({
			id: VALID_PROJECT_ID,
			userId: "user-1",
			visibility: "private",
		}),
	},
}));

vi.mock("next/headers", () => ({
	cookies: vi.fn().mockReturnValue({
		get: vi.fn().mockReturnValue({ value: "gpt-4o" }),
	}),
}));

// Now import the module under test
import { generateScene } from "@/app/actions/writer";

describe("generateScene", () => {
	it("should generate a scene successfully", async () => {
		const result = await generateScene(VALID_CHAPTER_ID);
		expect(result.success).toBe(true);
		expect(result.sceneId).toBe(NEW_SCENE_ID);
	});
});
