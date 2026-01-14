import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoisted mocks
const { mockGetProjectByIdWithAccess, mockGetProjectStats, mockAuth } =
	vi.hoisted(() => ({
		mockGetProjectByIdWithAccess: vi.fn(),
		mockGetProjectStats: vi.fn(),
		mockAuth: vi.fn(),
	}));

// Apply mocks
vi.mock("@/lib/db/queries", () => ({
	getProjectByIdWithAccess: mockGetProjectByIdWithAccess,
}));

vi.mock("@/lib/dashboard-queries", () => ({
	getProjectStats: mockGetProjectStats,
	getGlobalStats: vi.fn(),
}));

vi.mock("@/app/(auth)/auth", () => ({
	auth: mockAuth,
}));

// Import the action under test
import { getDashboardStatsAction } from "@/app/actions/dashboard";

describe("Dashboard Action Security", () => {
	const ATTACKER_ID = "attacker-123";
	const OWNER_ID = "owner-456";
	const PROJECT_ID = "123e4567-e89b-12d3-a456-426614174000";

	beforeEach(() => {
		vi.clearAllMocks();
		mockAuth.mockResolvedValue({ user: { id: ATTACKER_ID } });
	});

	it("should leak cost data for public projects to non-owners (reproduction)", async () => {
		// Setup: Public project owned by someone else
		mockGetProjectByIdWithAccess.mockResolvedValue({
			id: PROJECT_ID,
			userId: OWNER_ID,
			visibility: "public",
			name: "Public Project",
		});

		// Setup: Stats containing sensitive cost info
		mockGetProjectStats.mockResolvedValue({
			tokenStats: {
				totalCost: 100.5, // Sensitive!
				totalInputTokens: 1000,
				totalOutputTokens: 500,
				byModel: {},
				byFeature: {
					chat: { cost: 50, inputTokens: 500, outputTokens: 250 },
					generation: { cost: 50.5, inputTokens: 500, outputTokens: 250 },
				},
			},
			entityStats: {},
			activityStats: {},
			usageHistory: [{ date: "2023-10-27", cost: 10.5, tokens: 100 }],
		});

		const result = await getDashboardStatsAction({ projectId: PROJECT_ID });

		expect(result).toBeDefined();

		if (result.success) {
			const stats = result.data.stats;
			// This confirms the fix: Non-owner sees redacted costs
			expect(stats.tokenStats.totalCost).toBe(0);
			expect(stats.usageHistory[0].cost).toBe(0);
		} else {
			throw new Error("Action failed unexpectedly: " + result.error);
		}
	});
});
