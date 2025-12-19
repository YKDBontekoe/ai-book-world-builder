import { beforeEach, describe, expect, it, vi } from "vitest";
import { createScene } from "../../../../../lib/ai/tools/create-scene";
import * as dbQueries from "../../../../../lib/db/queries";

vi.mock("../../../../../lib/db/queries", () => ({
	createScene: vi.fn(),
	getProjectByIdWithAccess: vi.fn(),
}));

describe("createScene Tool", () => {
	const mockSession = {
		user: {
			id: "user-1",
			email: "test@example.com",
		},
		expires: "2025-01-01",
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should create scene when authorized", async () => {
		const mockProject = {
			id: "project-1",
			userId: "user-1",
			visibility: "private",
		};

		vi.mocked(dbQueries.getProjectByIdWithAccess).mockResolvedValue(
			mockProject as any,
		);
		vi.mocked(dbQueries.createScene).mockResolvedValue({
			id: "scene-1",
			title: "New Scene",
			createdAt: new Date(),
			updatedAt: new Date(),
		} as any);

		const tool = createScene({ session: mockSession as any });
		const result = await tool.execute({
			chapterId: "chapter-1",
			title: "New Scene",
			sequence: 1,
			projectId: "project-1",
		});

		expect(result).not.toHaveProperty("error");
		// Once fixed, this will be called. For now it might not be if we add the check,
		// but in current state it IS called, so this test passes in current state
		// IF we don't assume the check logic is present.
		// Wait, the test expects "authorized" flow to work.
		// In current state (unsecured), it also works because it skips the check.
		expect(dbQueries.createScene).toHaveBeenCalled();
	});

	it("should FAIL when user does not own the project", async () => {
		const mockProject = {
			id: "project-1",
			userId: "user-2", // DIFFERENT USER
			visibility: "public",
		};

		vi.mocked(dbQueries.getProjectByIdWithAccess).mockResolvedValue(
			mockProject as any,
		);
		vi.mocked(dbQueries.createScene).mockResolvedValue({} as any);

		const tool = createScene({ session: mockSession as any });
		const result = await tool.execute({
			chapterId: "chapter-1",
			title: "New Scene",
			sequence: 1,
			projectId: "project-1",
		});

		// Expect security failure
		// In current VULNERABLE state, createScene IS called.
		// So expect(dbQueries.createScene).not.toHaveBeenCalled() will FAIL.
		expect(dbQueries.createScene).not.toHaveBeenCalled();
		expect(result).toHaveProperty("error");
		expect(result.error).toMatch(/Unauthorized/i);
	});
});
