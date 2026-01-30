import { describe, expect, it, vi } from "vitest";

// Mock crypto
Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: vi.fn().mockReturnValue("new-scene-1"),
	},
});

// Mock @vercel/blob (must be before imports)
vi.mock("@vercel/blob", () => ({
	list: vi.fn().mockResolvedValue({ blobs: [] }),
	put: vi.fn().mockResolvedValue({ url: "https://fake-url.com/file.pdf" }),
}));

vi.mock("@/lib/db", () => {
	const mockChapter = {
		id: "123e4567-e89b-12d3-a456-426614174001",
		projectId: "123e4567-e89b-12d3-a456-426614174000",
		title: "Chapter 1",
		notes: "Notes",
	};

	const builder = {
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn().mockResolvedValue([mockChapter]),
		orderBy: vi.fn().mockResolvedValue([]),
		leftJoin: vi.fn().mockReturnThis(), // Added for semantic cache query
		// Promise interface
		// biome-ignore lint/suspicious/noThenProperty: Mocking Promise-like interface
		then: (resolve: (value: { max: number }[]) => unknown) =>
			resolve([{ max: 1 }]),
	};

	const mockSelectFn = vi.fn(() => builder);

	const mockInsert = vi.fn(() => ({
		values: vi.fn(() => ({
			returning: vi.fn(() => [{ id: "new-scene-1" }]),
		})),
	}));

	const mockUpdate = vi.fn(() => ({
		set: vi.fn(() => ({
			where: vi.fn(),
		})),
	}));

	const mockTransaction = vi.fn(async (callback) => {
		const txMock = {
			select: mockSelectFn,
			insert: mockInsert,
			update: mockUpdate,
		};
		return await callback(txMock);
	});

	return {
		db: {
			select: mockSelectFn,
			insert: mockInsert,
			update: mockUpdate,
			transaction: mockTransaction,
			$count: vi.fn(),
		},
	};
});

// Mock @/lib/ai/services
vi.mock("@/lib/ai/services", () => ({
	generationService: {
		continueWriting: vi
			.fn()
			.mockResolvedValue({ text: "Generated content", success: true }),
	},
}));

vi.mock("@/lib/db/repositories", () => ({
	sceneRepository: {
		findByChapter: vi.fn().mockResolvedValue([
			{
				id: "123e4567-e89b-12d3-a456-426614174002",
				title: "Scene 1",
				content: "Content",
				sequence: 1,
				chapterId: "123e4567-e89b-12d3-a456-426614174001",
			},
		]),
		create: vi.fn().mockResolvedValue({
			id: "new-scene-1",
			title: "AI Generated Scene",
			sequence: 2,
		}),
	},
	projectRepository: {
		findByIdWithAccess: vi.fn().mockResolvedValue({
			id: "123e4567-e89b-12d3-a456-426614174000",
			userId: "user-1",
			visibility: "private",
		}),
	},
}));

vi.mock("@/lib/db/repositories/project-repository", () => ({
	projectRepository: {
		findByIdWithAccess: vi.fn().mockResolvedValue({
			id: "123e4567-e89b-12d3-a456-426614174000",
			userId: "user-1",
			visibility: "private",
		}),
	},
}));

vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn().mockResolvedValue({ user: { id: "user-1" } }),
}));

vi.mock("@/lib/db/queries/project", () => ({
	getProjectByIdWithAccess: vi.fn().mockResolvedValue({
		id: "123e4567-e89b-12d3-a456-426614174000",
		userId: "user-1",
		visibility: "private",
	}),
}));

// Update cookies mock to be async as requested
vi.mock("next/headers", () => ({
	cookies: vi.fn().mockResolvedValue({
		get: vi.fn().mockReturnValue({ value: "gpt-4o" }),
	}),
}));

import { generateScene } from "@/features/writer/actions/scene";

describe("generateScene", () => {
	it("should generate a scene successfully", async () => {
		const result = await generateScene("123e4567-e89b-12d3-a456-426614174001");
		expect(result.success).toBe(true);
		expect(result.sceneId).toBe("new-scene-1");
	});
});
