import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardControls } from "@/components/organisms/dashboard/dashboard-controls";

// Mock useRouter and useSearchParams
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		refresh: vi.fn(),
	}),
	useSearchParams: () => ({
		get: vi.fn(),
	}),
}));

describe("DashboardControls", () => {
	const mockStats = {
		tokenStats: {
			totalCost: 10,
			totalInputTokens: 1000,
			totalOutputTokens: 500,
			byModel: {},
			byFeature: {
				chat: { cost: 5, inputTokens: 500, outputTokens: 250 },
				generation: { cost: 5, inputTokens: 500, outputTokens: 250 },
			},
		},
		usageHistory: [
			{ date: "2023-10-01", cost: 5, tokens: 750 },
			{ date: "2023-10-02", cost: 5, tokens: 750 },
		],
	};

	it("renders the date range selector and export button", () => {
		render(<DashboardControls projectId="test-project" stats={mockStats} />);

		// Check for "Date Range" placeholder or default text
		// Since SelectValue renders the selected value ("All Time" by default), we check for that.
		expect(screen.getByText("All Time")).toBeDefined();

		// Check for Export button
		expect(screen.getByText("Export")).toBeDefined();
	});
});
