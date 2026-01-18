import type { Session } from "next-auth";
import { afterEach, describe, expect, it, vi } from "vitest";
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
	// Reset mocks between tests to prevent state leakage
	afterEach(() => {
		vi.resetAllMocks();
	});

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
		messages: [],
	};

	it("should return error if not authenticated", async () => {
		const tool = batchCreateEntities({ session: null, projectId });
		if (!tool.execute) throw new Error("Tool execute method is undefined");

		const result = await tool.execute(
			{
				entities: [{ name: "Test Entity", kind: "character" }],
			},
			mockToolOptions,
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
			mockToolOptions,
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
			mockToolOptions,
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
			mockToolOptions,
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

	it("should call createAttribute when attributes are provided", async () => {
		// Mock successful auth
		vi.mocked(getProjectByIdWithAccess).mockResolvedValue({
			id: projectId,
			userId: "user-1",
			visibility: "private",
		} as any);

		// Mock entity creation
		vi.mocked(entityRepository.create).mockResolvedValue({
			id: "entity-with-attrs",
			name: "Attr Entity",
			projectId,
		} as any);

		const tool = batchCreateEntities({ session: mockSession, projectId });
		if (!tool.execute) throw new Error("Tool execute method is undefined");

		const result = await tool.execute(
			{
				entities: [
					{
						name: "Attr Entity",
						kind: "location",
						attributes: [{ name: "Climate", value: "Cold", dataType: "text" }],
					},
				],
			},
			mockToolOptions,
		);

		expect(result).toMatchObject({
			message: expect.stringContaining("Processed 1 entities"),
		});
		expect(entityRepository.create).toHaveBeenCalledWith(
			expect.objectContaining({ name: "Attr Entity" }),
		);
		expect(entityRepository.createAttribute).toHaveBeenCalledWith(
			expect.objectContaining({
				entityId: "entity-with-attrs",
				name: "Climate",
				value: "Cold",
			}),
		);
	});

	it("should handle partial failures correctly", async () => {
		// Mock successful auth
		vi.mocked(getProjectByIdWithAccess).mockResolvedValue({
			id: projectId,
			userId: "user-1",
			visibility: "private",
		} as any);

		// Mock entityRepository.create to fail for first call, succeed for second
		vi.mocked(entityRepository.create)
			.mockRejectedValueOnce(new Error("Database error"))
			.mockResolvedValueOnce({
				id: "entity-success",
				name: "Success Entity",
				projectId,
			} as any);

		const tool = batchCreateEntities({ session: mockSession, projectId });
		if (!tool.execute) throw new Error("Tool execute method is undefined");

		const result = await tool.execute(
			{
				entities: [
					{ name: "Fail Entity", kind: "item" },
					{ name: "Success Entity", kind: "item" },
				],
			},
			mockToolOptions,
		);

		// The tool returns an object with results array
		const typedResult = result as { results: any[]; message: string };

		expect(typedResult.results).toHaveLength(2);
		expect(typedResult.results[0]).toMatchObject({
			name: "Fail Entity",
			success: false,
			error: "Database error",
		});
		expect(typedResult.results[1]).toMatchObject({
			name: "Success Entity",
			id: "entity-success",
			success: true,
		});
		expect(typedResult.message).toContain("Processed 2 entities");
		expect(typedResult.message).toContain("1 created successfully");
	});

	it("should handle empty entities array gracefully", async () => {
		// Mock successful auth
		vi.mocked(getProjectByIdWithAccess).mockResolvedValue({
			id: projectId,
			userId: "user-1",
			visibility: "private",
		} as any);

		const tool = batchCreateEntities({ session: mockSession, projectId });
		if (!tool.execute) throw new Error("Tool execute method is undefined");

		const result = await tool.execute(
			{
				entities: [],
			},
			mockToolOptions,
		);

		const typedResult = result as { results: any[]; message: string };

		expect(typedResult.results).toHaveLength(0);
		expect(typedResult.message).toContain("Processed 0 entities");

		expect(entityRepository.create).not.toHaveBeenCalled();
	});
});
