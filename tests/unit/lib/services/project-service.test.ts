import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import {
	entityRepository,
	generationRepository,
	projectRepository,
	storyRepository,
} from "@/lib/db/repositories";
import { projectService } from "@/lib/services/project-service";

// Mock dependencies
vi.mock("@/lib/db", () => ({
	db: {
		select: vi.fn(),
		delete: vi.fn(),
		transaction: vi.fn(),
		$count: vi.fn(),
		insert: vi.fn(),
	},
}));

vi.mock("@/lib/db/repositories", () => ({
	projectRepository: {
		findByIdWithAccess: vi.fn(),
	},
	entityRepository: {
		deleteByProjectIds: vi.fn(),
		duplicateForProject: vi.fn(),
	},
	storyRepository: {
		deleteStructureByProjectIds: vi.fn(),
		duplicateStructureForProject: vi.fn(),
	},
	generationRepository: {
		deleteByProjectIds: vi.fn(),
	},
}));

// Helper to create a chainable query builder mock
const createMockQB = (result: any = []) => {
	const qb: any = {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		offset: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		// biome-ignore lint/suspicious/noThenProperty: Mocking a thenable for testing
		then: (resolve: any) => resolve(result),
	};
	return qb;
};

describe("ProjectService", () => {
	const userId = "user-1";

	beforeEach(() => {
		vi.clearAllMocks();

		// Default db behavior
		(db.select as any).mockReturnValue(createMockQB([]));
		(db.delete as any).mockReturnValue(createMockQB([]));
		(db.insert as any).mockReturnValue(createMockQB([]));

		// Default transaction behavior (can be overridden in tests)
		(db.transaction as any).mockImplementation(async (cb: any) => {
			const mockTx = {
				select: vi.fn().mockReturnValue(createMockQB([])),
				insert: vi.fn().mockReturnValue(createMockQB([])),
				delete: vi.fn().mockReturnValue(createMockQB([])),
			};
			return cb(mockTx);
		});
	});

	describe("deleteProjects", () => {
		it("should return success immediately if projectIds array is empty", async () => {
			const result = await projectService.deleteProjects([], userId);
			expect(result).toEqual({ success: true });
			expect(db.select).not.toHaveBeenCalled();
		});

		it("should return error if projectIds length is greater than 50", async () => {
			const projectIds = Array.from({ length: 51 }, (_, i) => `proj-${i}`);
			const result = await projectService.deleteProjects(projectIds, userId);
			expect(result).toEqual({
				error: "Cannot delete more than 50 projects at once.",
			});
		});

		it("should return error if no valid owned projects are found", async () => {
			// Mock db.select to return empty
			(db.select as any).mockReturnValue(createMockQB([]));

			const result = await projectService.deleteProjects(["proj-1"], userId);
			expect(result).toEqual({ error: "No valid projects to delete" });
		});

		it("should successfully delete owned projects and related data", async () => {
			const projectIds = ["proj-1"];
			// Mock finding owned projects
			(db.select as any).mockReturnValue(
				createMockQB([{ id: "proj-1", userId: userId }]),
			);

			// Mock transaction behavior
			(db.transaction as any).mockImplementation(async (cb: any) => {
				const mockTx = {
					select: vi.fn().mockImplementation(() => {
						// Return generations array when asked
						return createMockQB([{ id: "gen-1" }]);
					}),
					insert: vi.fn().mockReturnValue(createMockQB([])),
					delete: vi.fn().mockReturnValue(createMockQB([])),
				};
				await cb(mockTx);
			});

			const result = await projectService.deleteProjects(projectIds, userId);

			expect(result).toEqual({ success: true });
			expect(db.transaction).toHaveBeenCalled();
			expect(generationRepository.deleteByProjectIds).toHaveBeenCalled();
			expect(storyRepository.deleteStructureByProjectIds).toHaveBeenCalled();
			expect(entityRepository.deleteByProjectIds).toHaveBeenCalled();
		});

		it("should handle errors during deletion", async () => {
			const projectIds = ["proj-1"];
			(db.select as any).mockReturnValue(
				createMockQB([{ id: "proj-1", userId: userId }]),
			);

			(db.transaction as any).mockRejectedValue(new Error("DB Error"));

			const result = await projectService.deleteProjects(projectIds, userId);
			expect(result).toEqual({ error: "Failed to delete projects" });
		});
	});

	describe("forkProject", () => {
		const originalProjectId = "orig-proj-1";

		it("should return error if project is too large (entities + scenes > 2000)", async () => {
			(db.$count as any).mockResolvedValueOnce(1500); // entities
			(db.$count as any).mockResolvedValueOnce(600); // scenes (total 2100)

			const result = await projectService.forkProject(
				originalProjectId,
				userId,
			);
			expect(result).toEqual({
				success: false,
				error:
					"Project is too large to fork instantly. Please export and import instead.",
			});
		});

		it("should return error if original project not found or access denied", async () => {
			(db.$count as any).mockResolvedValue(10);
			(projectRepository.findByIdWithAccess as any).mockResolvedValue(null);

			const result = await projectService.forkProject(
				originalProjectId,
				userId,
			);
			expect(result).toEqual({
				success: false,
				error: "Project not found or access denied",
			});
		});

		it("should successfully fork a project", async () => {
			const newProjectId = "new-proj-id";

			(db.$count as any).mockResolvedValue(10);

			const mockProject = {
				id: originalProjectId,
				name: "Original Project",
				description: "Desc",
				folders: [],
			};
			(projectRepository.findByIdWithAccess as any).mockResolvedValue(
				mockProject,
			);

			// Mock crypto.randomUUID
			vi.stubGlobal("crypto", { randomUUID: () => "mock-uuid" });

			// Mock transaction behavior
			(db.transaction as any).mockImplementation(async (cb: any) => {
				const mockTx = {
					insert: vi.fn().mockImplementation((_table) => {
						// Check if inserting project to return the new project with ID
						return createMockQB([{ id: newProjectId }]);
					}),
					select: vi.fn().mockReturnValue(createMockQB([])),
					delete: vi.fn().mockReturnValue(createMockQB([])),
				};

				return await cb(mockTx);
			});

			const result = await projectService.forkProject(
				originalProjectId,
				userId,
				"New Name",
			);

			// Restore crypto
			vi.unstubAllGlobals();

			expect(result).toEqual({ success: true, projectId: newProjectId });
			expect(entityRepository.duplicateForProject).toHaveBeenCalled();
			expect(storyRepository.duplicateStructureForProject).toHaveBeenCalled();
		});

		it("should handle errors during fork", async () => {
			(db.$count as any).mockResolvedValue(10);
			(projectRepository.findByIdWithAccess as any).mockResolvedValue({
				id: "p1",
			});

			(db.transaction as any).mockRejectedValue(new Error("Fork failed"));

			const result = await projectService.forkProject(
				originalProjectId,
				userId,
			);
			expect(result).toEqual({
				success: false,
				error: "Failed to fork project",
			});
		});
	});
});
