
import { describe, expect, it, vi } from "vitest";
import { batchCreateEntities } from "@/lib/ai/tools/batch-create-entities";
import { getProjectByIdWithAccess } from "@/lib/db/queries";
import { entityRepository } from "@/lib/db/repositories";
import type { Session } from "next-auth";

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
		user: {
			id: "user-1",
			email: "test@example.com",
			type: "regular",
			role: "user",
		},
		expires: "2024-01-01",
	} as Session;

	const projectId = "project-1";

    // Mock tool options required by ai sdk 3.4+
    const mockToolOptions = {
        toolCallId: "call-1",
        messages: []
    };

	it("should return error if not authenticated", async () => {
		const tool = batchCreateEntities({ session: null, projectId });
		if (!tool.execute) throw new Error("Tool execute method is undefined");

		const result = await tool.execute(
			{
				entities: [{ name: "Test Entity", kind: "character" }],
			},
            mockToolOptions
		);
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
		if (!tool.execute) throw new Error("Tool execute method is undefined");

		const result = await tool.execute(
			{
				entities: [{ name: "Test Entity", kind: "character" }],
			},
            mockToolOptions
		);

		expect(result).toEqual({
			error: "Unauthorized: You do not have write access to this project.",
		});
	});

	it("should return error if project not found", async () => {
		vi.mocked(getProjectByIdWithAccess).mockResolvedValue(null);

		const tool = batchCreateEntities({ session: mockSession, projectId });
		if (!tool.execute) throw new Error("Tool execute method is undefined");

		const result = await tool.execute(
			{
				entities: [{ name: "Test Entity", kind: "character" }],
			},
            mockToolOptions
		);

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
		if (!tool.execute) throw new Error("Tool execute method is undefined");

		const result = await tool.execute(
			{
				entities: [{ name: "Test Entity", kind: "character" }],
			},
            mockToolOptions
		);

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
