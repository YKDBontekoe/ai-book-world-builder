import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	sceneRepository: {
		findById: vi.fn(),
		delete: vi.fn(),
	},
	ensureProjectAccess: vi.fn(),
	invalidateCache: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
	sceneRepository: mocks.sceneRepository,
}));

vi.mock("@/lib/actions-utils", () => ({
	ensureProjectAccess: mocks.ensureProjectAccess,
}));

vi.mock("@/lib/cache", () => ({
	invalidateCache: mocks.invalidateCache,
}));

// Import
import { deleteScenes } from "@/features/writer/actions/scene";

describe("deleteScenes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

    const id1 = "123e4567-e89b-12d3-a456-426614174000";
    const id2 = "123e4567-e89b-12d3-a456-426614174001";
    const projectId = "123e4567-e89b-12d3-a456-426614174002";

	it("should delete multiple scenes and invalidate cache", async () => {
		const sceneIds = [id1, id2];

		// Setup mocks
		// First call for s1, second for s2
		mocks.sceneRepository.findById
			.mockResolvedValueOnce({ id: id1, projectId })
			.mockResolvedValueOnce({ id: id2, projectId });

		mocks.ensureProjectAccess.mockResolvedValue({ project: { id: projectId } });
		mocks.sceneRepository.delete.mockResolvedValue(undefined);

		const result = await deleteScenes(sceneIds);

		expect(result.success).toBe(true);
		expect(mocks.sceneRepository.findById).toHaveBeenCalledWith(id1);
		expect(mocks.sceneRepository.findById).toHaveBeenCalledWith(id2);
		expect(mocks.ensureProjectAccess).toHaveBeenCalledTimes(2);
		expect(mocks.sceneRepository.delete).toHaveBeenCalledWith(id1);
		expect(mocks.sceneRepository.delete).toHaveBeenCalledWith(id2);
		expect(mocks.invalidateCache).toHaveBeenCalledWith(`project-structure:${projectId}`);
	});

	it("should return error for empty list", async () => {
		const result = await deleteScenes([]);
        // Validation fails because min(1)
		expect(result.success).toBe(false);
	});

	it("should skip deletion if scene not found", async () => {
		const sceneIds = [id1, id2];

		// s1 found, s2 not found
		mocks.sceneRepository.findById
			.mockResolvedValueOnce({ id: id1, projectId })
			.mockResolvedValueOnce(null);

		mocks.ensureProjectAccess.mockResolvedValue({ project: { id: projectId } });

		const result = await deleteScenes(sceneIds);

		expect(result.success).toBe(true);
		expect(mocks.sceneRepository.delete).toHaveBeenCalledTimes(1);
		expect(mocks.sceneRepository.delete).toHaveBeenCalledWith(id1);
		expect(mocks.invalidateCache).toHaveBeenCalledWith(`project-structure:${projectId}`);
	});
});
