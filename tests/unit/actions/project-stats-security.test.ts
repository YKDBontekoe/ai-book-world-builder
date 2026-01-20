import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoisted mocks
const {
	mockGetProjectByIdWithAccess,
	mockGetEntitiesForProject,
	mockGetRelationshipsForProject,
	mockGetOutlinesForProject,
	mockGetChaptersForProject,
	mockAuth,
} = vi.hoisted(() => ({
	mockGetProjectByIdWithAccess: vi.fn(),
	mockGetEntitiesForProject: vi.fn(),
	mockGetRelationshipsForProject: vi.fn(),
	mockGetOutlinesForProject: vi.fn(),
	mockGetChaptersForProject: vi.fn(),
	mockAuth: vi.fn(),
}));

// Apply mocks
vi.mock("@/lib/db/queries", () => ({
	getProjectByIdWithAccess: mockGetProjectByIdWithAccess,
	getEntitiesForProject: mockGetEntitiesForProject,
	getRelationshipsForProject: mockGetRelationshipsForProject,
	getOutlinesForProject: mockGetOutlinesForProject,
	getChaptersForProject: mockGetChaptersForProject,
	// Mock other dependencies if needed, but for now we focus on these
	getBookGenerationForProject: vi.fn(),
	db: {},
}));

vi.mock("@/app/(auth)/auth", () => ({
	auth: mockAuth,
}));

// Import the action under test
import { getProjectStats } from "@/app/actions/project-stats";

describe("Project Stats Security", () => {
	const ATTACKER_ID = "attacker-123";
	const VICTIM_ID = "victim-456";
	const PROJECT_ID = "123e4567-e89b-12d3-a456-426614174000";

	beforeEach(() => {
		vi.clearAllMocks();
		mockAuth.mockResolvedValue({ user: { id: ATTACKER_ID } });
	});

	it("should fail when accessing a private project belonging to another user", async () => {
		// Setup: Private project owned by victim
		// Note: The action implementation should call this.
		mockGetProjectByIdWithAccess.mockResolvedValue(null); // Simulate access denied or project not found for this user

		// Setup: Data queries would return data if called (simulating IDOR)
		mockGetEntitiesForProject.mockResolvedValue([{ id: "e1", kind: "character" }]);
		mockGetRelationshipsForProject.mockResolvedValue([]);
		mockGetOutlinesForProject.mockResolvedValue([]);
		mockGetChaptersForProject.mockResolvedValue([]);

		const result = await getProjectStats({ projectId: PROJECT_ID });

		// We expect it to fail securely
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toMatch(/permission/i);
		}

		// Verify that getProjectByIdWithAccess was called
		expect(mockGetProjectByIdWithAccess).toHaveBeenCalledWith({
			id: PROJECT_ID,
			userId: ATTACKER_ID,
		});

		// Verify that data queries were NOT called (defense in depth)
		expect(mockGetEntitiesForProject).not.toHaveBeenCalled();
	});
});
