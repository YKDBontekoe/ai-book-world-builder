import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConsistencyService } from "../../../src/lib/services/analysis/consistency-service";

// Mock dependencies
const mocks = vi.hoisted(() => ({
	getEntitiesForProject: vi.fn(),
	getScenesForProject: vi.fn(),
	createIssues: vi.fn(),
	clearIssuesForProject: vi.fn(),
	generateObject: vi.fn(),
	myProvider: {
		languageModel: vi.fn(),
	},
	getSelectedModelId: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
	getEntitiesForProject: mocks.getEntitiesForProject,
	getScenesForProject: mocks.getScenesForProject,
	createIssues: mocks.createIssues,
	clearIssuesForProject: mocks.clearIssuesForProject,
}));

vi.mock("ai", async (importOriginal) => {
	const actual = await importOriginal<typeof import("ai")>();
	return {
		...actual,
		generateObject: mocks.generateObject,
	};
});

vi.mock("@/lib/ai/providers", () => ({
	myProvider: mocks.myProvider,
}));

vi.mock("@/lib/ai/models", () => ({
	getSelectedModelId: mocks.getSelectedModelId,
}));

describe("ConsistencyService", () => {
	let service: ConsistencyService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new ConsistencyService();
		mocks.getSelectedModelId.mockResolvedValue("model-id");
	});

	it("should analyze project and create issues", async () => {
		// Setup data
		mocks.getEntitiesForProject.mockResolvedValue([
			{
				id: "e1",
				name: "Alice",
				kind: "character",
				summary: "A brave warrior.",
			},
		]);
		mocks.getScenesForProject.mockResolvedValue([
			{
				id: "s1",
				title: "Scene 1",
				content: "Alice runs away.",
				status: "drafted",
			},
		]);

		// Setup AI response
		mocks.generateObject.mockResolvedValue({
			object: {
				issues: [
					{
						type: "character",
						description: "Alice is brave but runs away.",
						suggestion: "Make her fight.",
						severity: "medium",
						sceneIds: ["s1"],
					},
				],
			},
		});

		// Execute
		const issues = await service.analyzeProject("p1");

		// Verify
		expect(mocks.getEntitiesForProject).toHaveBeenCalledWith({
			projectId: "p1",
		});
		expect(mocks.getScenesForProject).toHaveBeenCalledWith({ projectId: "p1" });
		expect(mocks.clearIssuesForProject).toHaveBeenCalledWith("p1");
		expect(mocks.createIssues).toHaveBeenCalledWith([
			expect.objectContaining({
				projectId: "p1",
				description: "Alice is brave but runs away.",
				type: "character",
				sceneId: "s1",
			}),
		]);
		expect(issues).toHaveLength(1);
	});

	it("should return empty array if no drafted scenes", async () => {
		mocks.getEntitiesForProject.mockResolvedValue([]);
		mocks.getScenesForProject.mockResolvedValue([
			{ id: "s1", status: "planned" }, // Not drafted
		]);

		const issues = await service.analyzeProject("p1");

		expect(issues).toEqual([]);
		expect(mocks.generateObject).not.toHaveBeenCalled();
	});
});
