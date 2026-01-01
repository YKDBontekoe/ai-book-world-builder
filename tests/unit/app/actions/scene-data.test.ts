import { describe, it, expect, afterEach, vi } from "vitest";
import { getScenesData } from "@/app/actions/scene-data";
import { projectRepository } from "@/lib/db/repositories";

// Mock dependencies
vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn().mockResolvedValue({
		user: { id: "user-1" },
	}),
}));

vi.mock("@/lib/db/repositories", () => ({
	projectRepository: {
		findByIdWithAccess: vi.fn(),
	},
	sceneRepository: {
		findByProject: vi.fn(),
	},
}));

describe("getScenesData", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should throw an 'Unauthorized' error if project access is denied", async () => {
		// Arrange
		const projectId = "unauthorized-project-id";
		vi.mocked(projectRepository.findByIdWithAccess).mockResolvedValue(null);

		// Act & Assert
		await expect(getScenesData(projectId)).rejects.toThrow("Unauthorized");

		// Verify that the repository was called correctly
		expect(projectRepository.findByIdWithAccess).toHaveBeenCalledWith(
			projectId,
			"user-1",
		);
	});
});
