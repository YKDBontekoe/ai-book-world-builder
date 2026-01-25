import { describe, expect, it, vi } from "vitest";

// Mocks must be hoisted
const {
	mockUpdate,
	mockEq,
	mockAnd,
} = vi.hoisted(() => ({
	mockUpdate: vi.fn(),
	mockEq: vi.fn(),
	mockAnd: vi.fn(),
}));

// Mock modules
vi.mock("@/lib/db", () => ({
	db: {
		update: mockUpdate,
	},
}));

vi.mock("drizzle-orm", () => ({
	eq: mockEq,
	and: mockAnd,
}));

vi.mock("@/lib/errors", () => ({
	ChatSDKError: class extends Error {
		constructor(code: string, message: string) {
			super(message);
		}
	},
}));

// Mock schema
vi.mock("@/lib/db/schema", () => ({
	sceneCard: {
		sceneId: "sceneId_column",
		projectId: "projectId_column",
	},
}));

// Import function under test
import { updateSceneCard } from "@/lib/db/queries/scene";

describe("updateSceneCard Security", () => {
	const SCENE_ID = "scene-123";
	const PROJECT_ID = "project-123";

	it("should include projectId in the update query to prevent IDOR", async () => {
		// Arrange
		mockUpdate.mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([{ id: "card-1" }]),
				}),
			}),
		});

		// Act
		// We pass projectId even if TS might complain (depending on if we updated type yet).
		// Since we haven't updated the code yet, we expect this NOT to be used,
		// or if we strictly follow TDD, we write the test expecting it TO be used and it fails.
		// However, currently updateSceneCard signature doesn't accept projectId.
		// So we can't strictly call it with projectId unless we cast it.
		// @ts-ignore
		await updateSceneCard({ sceneId: SCENE_ID, chronologicalSequence: 1, projectId: PROJECT_ID });

		// Assert
		const eqCalls = mockEq.mock.calls;

		// Check if any eq call matches (projectId_column, PROJECT_ID)
		const projectIdCheck = eqCalls.some((args) => {
			return args[0] === "projectId_column" && args[1] === PROJECT_ID;
		});

		// This expectation should fail currently
		expect(projectIdCheck, "updateSceneCard should verify projectId").toBe(true);
	});
});
