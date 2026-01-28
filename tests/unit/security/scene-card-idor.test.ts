import { and, eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateSceneCard } from "@/lib/db/queries/scene";
import { sceneCard } from "@/lib/db/schema";

const mocks = vi.hoisted(() => {
	return {
		mockUpdate: vi.fn(),
		mockSet: vi.fn(),
		mockWhere: vi.fn(),
		mockReturning: vi.fn(),
	};
});

vi.mock("@/lib/db", () => ({
	db: {
		update: mocks.mockUpdate,
	},
}));

describe("Scene Card Security (IDOR)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.mockUpdate.mockReturnValue({ set: mocks.mockSet });
		mocks.mockSet.mockReturnValue({ where: mocks.mockWhere });
		mocks.mockWhere.mockReturnValue({ returning: mocks.mockReturning });
		// Default success response
		mocks.mockReturning.mockResolvedValue([
			{ id: "scene-card-1", sceneId: "scene-1" },
		]);
	});

	it("prevents IDOR: updateSceneCard enforces project ownership when projectId is provided", async () => {
		const sceneId = "target-scene-id";
		const projectId = "owner-project-id";
		const data = { purpose: "Safe Purpose" };

		// Call the function WITH projectId
		await updateSceneCard({ sceneId, projectId, ...data });

		// Verify correct chain was called
		expect(mocks.mockUpdate).toHaveBeenCalledWith(sceneCard);

		// Verify where clause
		expect(mocks.mockWhere).toHaveBeenCalledTimes(1);
		const actualQuery = mocks.mockWhere.mock.calls[0][0];

		// Construct expected SECURE query: WHERE sceneId = target AND projectId = owner
		const expectedSecureQuery = and(
			eq(sceneCard.sceneId, sceneId),
			eq(sceneCard.projectId, projectId),
		);

		// This should now pass with the fix
		expect(actualQuery).toEqual(expectedSecureQuery);
	});

	it("requires privileged flag for ID-only updates", async () => {
		const sceneId = "target-scene-id";
		const data = { purpose: "Insecure Update" };

		// Call the function WITHOUT projectId and WITHOUT privileged flag
		await expect(updateSceneCard({ sceneId, ...data })).rejects.toThrow(
			"Safety check: projectId required for non-privileged updates",
		);
	});

	it("allows ID-only updates when privileged flag is true", async () => {
		const sceneId = "target-scene-id";
		const data = { purpose: "Privileged Update" };

		// Call WITH privileged flag
		await updateSceneCard({ sceneId, ...data, privileged: true });

		// Verify where clause
		expect(mocks.mockWhere).toHaveBeenCalledTimes(1);
		const actualQuery = mocks.mockWhere.mock.calls[0][0];

		// Construct expected ID-only query
		const expectedQuery = eq(sceneCard.sceneId, sceneId);

		expect(actualQuery).toEqual(expectedQuery);
	});
});
