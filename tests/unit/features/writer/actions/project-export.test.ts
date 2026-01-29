import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import { exportProject } from "@/features/writer/actions/project-export";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { db } from "@/lib/db";
import { chapter, scene } from "@/lib/db/schema";

// Mock dependencies
vi.mock("@/lib/db", () => ({
	db: {
		select: vi.fn(),
	},
}));

vi.mock("@/lib/actions-utils", () => ({
	ensureProjectAccess: vi.fn(),
}));

// Mock schema objects to identity checks in `from`
vi.mock("@/lib/db/schema", () => ({
	chapter: { projectId: "chapterProjectId", sequence: "chapterSequence" },
	scene: { projectId: "sceneProjectId", sequence: "sceneSequence", chapterId: "sceneChapterId" },
}));

describe("Project Export Actions", () => {
	const projectId = "project-123";

	beforeEach(() => {
		vi.clearAllMocks();
		(ensureProjectAccess as Mock).mockResolvedValue({
			project: { id: projectId },
			user: { id: "user-123" },
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("exportProject", () => {
		it("should export project content correctly grouped by chapter", async () => {
			const mockChapters = [
				{ id: "ch1", title: "Chapter 1", sequence: 1 },
				{ id: "ch2", title: "Chapter 2", sequence: 2 },
			];

			const mockScenes = [
				// Chapter 1 scenes
				{ id: "s1", title: "Scene 1.1", content: "Content 1.1", chapterId: "ch1", sequence: 1 },
				{ id: "s2", title: "Scene 1.2", content: "Content 1.2", chapterId: "ch1", sequence: 2 },
				// Chapter 2 scenes
				{ id: "s3", title: "Scene 2.1", content: "Content 2.1", chapterId: "ch2", sequence: 1 },
			];

			// Setup query chains
			const chapterChain = {
				where: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(mockChapters),
			};

			const sceneChain = {
				where: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(mockScenes),
			};

			// Mock db.select().from(table) behavior
			const mockFrom = vi.fn().mockImplementation((table) => {
				if (table === chapter) return chapterChain;
				if (table === scene) return sceneChain;
				return { where: vi.fn().mockReturnThis(), orderBy: vi.fn().mockResolvedValue([]) };
			});

			(db.select as Mock).mockReturnValue({ from: mockFrom });

			const result = await exportProject(projectId);

			expect(result.success).toBe(true);

			// Check content structure
			// Chapter 1
			expect(result.content).toContain("# Chapter 1");
			expect(result.content).toContain("## Scene 1.1");
			expect(result.content).toContain("Content 1.1");
			expect(result.content).toContain("## Scene 1.2");
			expect(result.content).toContain("Content 1.2");

			// Chapter 2
			expect(result.content).toContain("# Chapter 2");
			expect(result.content).toContain("## Scene 2.1");
			expect(result.content).toContain("Content 2.1");

			// Verify order (approximate check via index)
			const content = result.content!;
			expect(content.indexOf("# Chapter 1")).toBeLessThan(content.indexOf("# Chapter 2"));
			expect(content.indexOf("## Scene 1.1")).toBeLessThan(content.indexOf("## Scene 1.2"));
		});

		it("should handle error during export", async () => {
			(ensureProjectAccess as Mock).mockRejectedValue(new Error("Access denied"));

			const result = await exportProject(projectId);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Failed to export project");
		});
	});
});
