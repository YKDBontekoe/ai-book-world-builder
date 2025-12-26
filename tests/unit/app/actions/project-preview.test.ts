import { vi, describe, it, expect, beforeEach } from "vitest";

// Mocks must be hoisted
const mocks = vi.hoisted(() => ({
	auth: vi.fn(),
	projectRepository: {
		findByIdWithAccess: vi.fn(),
	},
	db: {
		select: vi.fn(),
	},
}));

// Mock modules
vi.mock("@/app/(auth)/auth", () => ({
	auth: mocks.auth,
}));

vi.mock("@/lib/db/repositories", () => ({
	projectRepository: mocks.projectRepository,
}));

vi.mock("@/lib/db/drizzle", () => ({
	db: mocks.db,
}));

vi.mock("@/lib/db/schema", () => ({
	chapter: { id: "chapter-id", projectId: "projectId", sequence: 1 },
	scene: { id: "scene-id", projectId: "projectId", chapterId: "chapter-id", content: "content" },
}));

import { getProjectPreviewData } from "@/app/actions/project-preview";

describe("getProjectPreviewData", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return error if not authenticated", async () => {
		mocks.auth.mockResolvedValue(null);

		const result = await getProjectPreviewData("project-1");
		expect(result).toEqual({ error: "Unauthorized" });
	});

	it("should return error if project access denied", async () => {
		mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
		mocks.projectRepository.findByIdWithAccess.mockResolvedValue(null);

		const result = await getProjectPreviewData("project-1");
		expect(result).toEqual({ error: "Project not found or access denied" });
	});

	it("should return preview data on success", async () => {
		mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
		mocks.projectRepository.findByIdWithAccess.mockResolvedValue({ id: "project-1" });

		// 1. Scene Counts Mock Chain
		const whereMock1 = vi.fn().mockResolvedValue([{ sceneCount: 10, wordCount: 500 }]);
		const fromMock1 = { where: whereMock1 };
		const selectBuilder1 = { from: vi.fn().mockReturnValue(fromMock1) };
		mocks.db.select.mockReturnValueOnce(selectBuilder1);

		// 2. Chapter Stats Mock Chain
		const whereMockChapter = vi.fn().mockResolvedValue([{ count: 5 }]);
		const fromMockChapter = { where: whereMockChapter };
		const selectBuilderChapter = { from: vi.fn().mockReturnValue(fromMockChapter) };
		mocks.db.select.mockReturnValueOnce(selectBuilderChapter);

		// 3. Recent Activity Mock Chain
		const limitMock2 = vi.fn().mockResolvedValue([{
			id: "scene-1",
			title: "Recent Scene",
			updatedAt: new Date("2024-01-01"),
			chapterTitle: "Chapter 1",
		}]);
		const orderByMock2 = { limit: limitMock2 };
		const whereMock2 = { orderBy: vi.fn().mockReturnValue(orderByMock2) };
		const joinMock2 = { where: vi.fn().mockReturnValue(whereMock2) };
		const fromMock2 = { innerJoin: vi.fn().mockReturnValue(joinMock2) };
		const selectBuilder2 = { from: vi.fn().mockReturnValue(fromMock2) };
		mocks.db.select.mockReturnValueOnce(selectBuilder2);

		// 4. Structure Mock Chain
		const limitMock3 = vi.fn().mockResolvedValue([
			{ id: "chap-1", title: "C1", sceneCount: 2 },
			{ id: "chap-2", title: "C2", sceneCount: 0 },
		]);
		const orderByMock3 = { limit: limitMock3 };
		const groupByMock3 = { orderBy: vi.fn().mockReturnValue(orderByMock3) };
		const whereMock3 = { groupBy: vi.fn().mockReturnValue(groupByMock3) };
		const joinMock3 = { where: vi.fn().mockReturnValue(whereMock3) };
		const fromMock3 = { leftJoin: vi.fn().mockReturnValue(joinMock3) };
		const selectBuilder3 = { from: vi.fn().mockReturnValue(fromMock3) };
		mocks.db.select.mockReturnValueOnce(selectBuilder3);

		const result = await getProjectPreviewData("project-1");

		expect(result).toHaveProperty("success", true);
		if ("success" in result) {
			expect(result.data.counts).toEqual({ chapters: 5, scenes: 10, words: 500 });
			expect(result.data.recentActivity).toBeTruthy();
			expect(result.data.structure).toHaveLength(2);
		}
	});
});
