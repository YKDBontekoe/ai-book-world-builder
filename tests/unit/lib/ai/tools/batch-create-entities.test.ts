
import { describe, expect, it, vi } from "vitest";
import { batchCreateEntities } from "@/lib/ai/tools/batch-create-entities";
import { getProjectByIdWithAccess } from "@/lib/db/queries";
import { entityRepository } from "@/lib/db/repositories";

// Mock dependencies
vi.mock("@/lib/db/queries", () => ({
	getProjectByIdWithAccess: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
	entityRepository: {
		create: vi.fn(),
		createAttribute: vi.fn(),
	},
}));

describe("batchCreateEntities", () => {
	const mockSession = {
		user: { id: "user-1", email: "test@example.com" },
		expires: "2024-01-01",
	};
	const projectId = "project-1";

	it("should return error if not authenticated", async () => {
		const tool = batchCreateEntities({ session: null, projectId });
		const result = await tool.execute({
			entities: [{ name: "Test Entity", kind: "character" }],
		});
		expect(result).toEqual({ error: "Authentication required." });
	});

	it("should return error if unauthorized (project not owned by user)", async () => {
		// Mock getProjectByIdWithAccess to return a project owned by someone else
		vi.mocked(getProjectByIdWithAccess).mockResolvedValue({
			id: projectId,
			userId: "other-user",
			visibility: "public",
		} as any);

		const tool = batchCreateEntities({ session: mockSession, projectId });
		const result = await tool.execute({
			entities: [{ name: "Test Entity", kind: "character" }],
		});

		expect(result).toEqual({
			error: "Unauthorized: You do not have write access to this project.",
		});
	});

	it("should return error if project not found", async () => {
		vi.mocked(getProjectByIdWithAccess).mockResolvedValue(null);

		const tool = batchCreateEntities({ session: mockSession, projectId });
		const result = await tool.execute({
			entities: [{ name: "Test Entity", kind: "character" }],
		});

		expect(result).toEqual({
			error: "Unauthorized: You do not have write access to this project.",
		});
	});

	it("should create entities if authorized", async () => {
		// Mock successful auth
		vi.mocked(getProjectByIdWithAccess).mockResolvedValue({
			id: projectId,
			userId: "user-1",
			visibility: "private",
		} as any);

		// Mock entity creation
		vi.mocked(entityRepository.create).mockResolvedValue({
			id: "entity-1",
			name: "Test Entity",
			projectId,
		} as any);

		const tool = batchCreateEntities({ session: mockSession, projectId });
		const result = await tool.execute({
			entities: [{ name: "Test Entity", kind: "character" }],
		});

		expect(result).toMatchObject({
			message: expect.stringContaining("Processed 1 entities"),
		});
		expect(entityRepository.create).toHaveBeenCalledWith(
			expect.objectContaining({
				projectId,
				name: "Test Entity",
			}),
		);
	});
});
