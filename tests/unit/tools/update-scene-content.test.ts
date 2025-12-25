import { describe, expect, it, vi } from "vitest";

// Mocks must be hoisted
const mocks = vi.hoisted(() => ({
	verifySceneAccess: vi.fn(),
	updateSceneContent: vi.fn(),
}));

// Mock external dependencies
vi.mock("@/lib/services/ai/utils", () => ({
	verifySceneAccess: mocks.verifySceneAccess,
}));

vi.mock("@/app/actions/writer", () => ({
	updateSceneContent: mocks.updateSceneContent,
}));

// Import the tool
import { updateSceneContent } from "@/lib/ai/tools/update-scene-content";

describe("Tool: updateSceneContent", () => {
	it("should update scene content successfully", async () => {
		// Setup
		mocks.verifySceneAccess.mockResolvedValue(undefined);
		mocks.updateSceneContent.mockResolvedValue({ success: true });

		const toolInstance = updateSceneContent();

		// Execute
		if (!toolInstance.execute) {
			throw new Error("toolInstance.execute is undefined");
		}
		const result = await toolInstance.execute(
			{
				sceneId: "scene-123",
				content: "New content here",
				instruction: "Made it better",
			},
			{ toolCallId: "call-1", messages: [] },
		);

		// Assert
		expect(mocks.verifySceneAccess).toHaveBeenCalledWith("scene-123");
		expect(mocks.updateSceneContent).toHaveBeenCalledWith(
			"scene-123",
			"New content here",
		);
		expect(result).toEqual({
			success: true,
			sceneId: "scene-123",
			instruction: "Made it better",
			newContent: "New content here",
		});
	});

	it("should return error if database update fails", async () => {
		// Setup
		mocks.verifySceneAccess.mockResolvedValue(undefined);
		mocks.updateSceneContent.mockResolvedValue({
			success: false,
			error: "DB Error",
		});

		const toolInstance = updateSceneContent();

		// Execute
		if (!toolInstance.execute) {
			throw new Error("toolInstance.execute is undefined");
		}
		const result = await toolInstance.execute(
			{
				sceneId: "scene-123",
				content: "New content here",
			},
			{ toolCallId: "call-1", messages: [] },
		);

		// Assert
		expect(result).toEqual({
			error: "Failed to update scene content in the database.",
		});
	});

	it("should throw if access verification fails", async () => {
		// Setup
		mocks.verifySceneAccess.mockRejectedValue(new Error("Unauthorized"));

		const toolInstance = updateSceneContent();

		if (!toolInstance.execute) {
			throw new Error("toolInstance.execute is undefined");
		}

		// Execute & Assert
		await expect(
			toolInstance.execute(
				{
					sceneId: "scene-123",
					content: "New content",
				},
				{ toolCallId: "call-1", messages: [] },
			),
		).rejects.toThrow("Unauthorized");
	});
});
