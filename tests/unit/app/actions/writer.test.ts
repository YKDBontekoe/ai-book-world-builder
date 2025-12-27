import { beforeEach, describe, expect, it, vi } from "vitest";

// Define mocks inside or use hoistable variables if supported, but simpler to define inline for mocks

vi.mock("@/lib/db/drizzle", () => {
	const mockChapter = {
		id: "f1b7b3b0-5b1a-4b7a-8b0a-0b0b0b0b0b0b",
		projectId: "proj-1",
		title: "Chapter 1",
		notes: "Notes",
	};
	const mockScenes = [
		{
			id: "scene-1",
			title: "Scene 1",
			content: "Content",
			sequence: 1,
			chapterId: "f1b7b3b0-5b1a-4b7a-8b0a-0b0b0b0b0b0b",
		},
	];
	const mockNewScene = {
		id: "new-scene-1",
		title: "AI Generated Scene",
		sequence: 2,
		chapterId: "f1b7b3b0-5b1a-4b7a-8b0a-0b0b0b0b0b0b",
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
	createScene: vi
		.fn()
		.mockResolvedValue({
			id: "new-scene-1",
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
	getProjectByIdWithAccess: vi
		.fn()
		.mockResolvedValue({
			id: "proj-1",
			userId: "user-1",
			visibility: "private",
		}),
}));

// Mock the project repository (used by actions-utils)
vi.mock("@/lib/db/repositories/project-repository", () => ({
	projectRepository: {
		findByIdWithAccess: vi
			.fn()
			.mockResolvedValue({
				id: "proj-1",
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
import { generateScene } from "@/app/actions/writer/scene";

describe("generateScene", () => {
	it("should generate a scene successfully", async () => {
		const result = await generateScene(
			"f1b7b3b0-5b1a-4b7a-8b0a-0b0b0b0b0b0b",
		);
		expect(result.success).toBe(true);
		expect(result.sceneId).toBe("new-scene-1");
	});
});
