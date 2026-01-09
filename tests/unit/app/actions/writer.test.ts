import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock crypto
Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: vi.fn().mockReturnValue("new-scene-1"),
	},
});

// Define mocks inside or use hoistable variables if supported, but simpler to define inline for mocks

vi.mock("@/lib/db/drizzle", () => {
	const mockChapter = {
		id: "ch-1",
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
			chapterId: "ch-1",
		},
	];
	const mockNewScene = {
		id: "new-scene-1",
		title: "AI Generated Scene",
		sequence: 2,
		chapterId: "ch-1",
	};

	// Mock DB functions
	const mockSelect = vi.fn(() => ({
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
	}));

	const mockInsert = vi.fn(() => ({
		values: vi.fn(() => ({
			returning: vi.fn(() => [mockNewScene]),
		})),
	}));

	const mockUpdate = vi.fn(() => ({
		set: vi.fn(() => ({
			where: vi.fn(),
		})),
	}));

	// Create a transaction mock that executes the callback immediately
	// It passes a mock transaction object that has the same methods as db
	const mockTransaction = vi.fn(async (callback) => {
		const txMock = {
			select: mockSelect,
			insert: mockInsert,
			update: mockUpdate,
		};
		return await callback(txMock);
	});

	return {
		db: {
			select: mockSelect,
			insert: mockInsert,
			update: mockUpdate,
			transaction: mockTransaction,
			$count: vi.fn(),
		},
	};
});

// Mock @/lib/ai/writer
vi.mock("@/lib/ai/writer", () => ({
	continueWriting: vi.fn().mockResolvedValue({ text: "Generated content" }),
}));

// Mock @/lib/db/repositories (index) - used by scene.ts
vi.mock("@/lib/db/repositories", () => ({
	sceneRepository: {
		findByChapter: vi.fn().mockResolvedValue([
			{
				id: "scene-1",
				title: "Scene 1",
				content: "Content",
				sequence: 1,
				chapterId: "ch-1",
			},
		]),
		create: vi.fn().mockResolvedValue({
			id: "new-scene-1",
			title: "AI Generated Scene",
			sequence: 2,
		}),
	},
	// Also provide projectRepository here in case it is imported from index anywhere
	projectRepository: {
		findByIdWithAccess: vi.fn().mockResolvedValue({
			id: "proj-1",
			userId: "user-1",
			visibility: "private",
		}),
	},
}));

// Mock @/lib/db/repositories/project-repository - used by actions-utils.ts
vi.mock("@/lib/db/repositories/project-repository", () => ({
	projectRepository: {
		findByIdWithAccess: vi.fn().mockResolvedValue({
			id: "proj-1",
			userId: "user-1",
			visibility: "private",
		}),
	},
}));

// Mock Auth and Project Queries
vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn().mockResolvedValue({ user: { id: "user-1" } }),
}));

vi.mock("@/lib/db/queries/project", () => ({
	getProjectByIdWithAccess: vi.fn().mockResolvedValue({
		id: "proj-1",
		userId: "user-1",
		visibility: "private",
	}),
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
		const result = await generateScene("ch-1");
		expect(result.success).toBe(true);
		expect(result.sceneId).toBe("new-scene-1");
	});
});
