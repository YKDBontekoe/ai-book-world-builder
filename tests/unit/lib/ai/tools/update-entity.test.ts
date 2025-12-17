import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateEntity } from "../../../../../lib/ai/tools/update-entity";
import * as dbQueries from "../../../../../lib/db/queries";

// Mock dependencies
vi.mock("../../../../../lib/db/queries", () => ({
	updateEntity: vi.fn(),
	getEntityWithDetails: vi.fn(),
	getProjectByIdWithAccess: vi.fn(),
}));

describe("updateEntity Tool", () => {
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

	it("should update entity when authorized", async () => {
		const mockEntity = {
			id: "entity-1",
			projectId: "project-1",
			name: "Old Name",
			kind: "character",
			attributes: [],
			relationships: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const mockProject = {
			id: "project-1",
			userId: "user-1", // Same as session user
			visibility: "private",
		};

		vi.mocked(dbQueries.getEntityWithDetails).mockResolvedValue(
			mockEntity as any,
		);
		vi.mocked(dbQueries.getProjectByIdWithAccess).mockResolvedValue(
			mockProject as any,
		);
		vi.mocked(dbQueries.updateEntity).mockResolvedValue(mockEntity as any);

		const tool = updateEntity({ session: mockSession as any });
		const result = await tool.execute({
			id: "entity-1",
			name: "New Name",
		});

		expect(result).not.toHaveProperty("error");
		expect(dbQueries.updateEntity).toHaveBeenCalledWith({
			id: "entity-1",
			name: "New Name",
			kind: undefined,
			summary: undefined,
			startDate: undefined,
			endDate: undefined,
		});
	});

	it("should FAIL when user does not own the project", async () => {
		const mockEntity = {
			id: "entity-1",
			projectId: "project-1",
			name: "Old Name",
			attributes: [],
			relationships: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const mockProject = {
			id: "project-1",
			userId: "user-2", // DIFFERENT user
			visibility: "public",
		};

		vi.mocked(dbQueries.getEntityWithDetails).mockResolvedValue(
			mockEntity as any,
		);
		vi.mocked(dbQueries.getProjectByIdWithAccess).mockResolvedValue(
			mockProject as any,
		);

		const tool = updateEntity({ session: mockSession as any });
		const result = await tool.execute({
			id: "entity-1",
			name: "New Name",
		});

		// Expecting security check to prevent update
		expect(dbQueries.updateEntity).not.toHaveBeenCalled();
		expect(result).toHaveProperty("error");
	});
});
