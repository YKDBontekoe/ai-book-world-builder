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
});
