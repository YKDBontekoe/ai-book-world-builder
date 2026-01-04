import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TaskBoard } from "@/components/admin/builder/task-board";
import { getIssues, getPullRequests } from "@/app/actions/github";
import { getJulesSessionsAction, listJulesSourcesAction } from "@/app/actions/jules";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { JSX } from "react";

// Mock dependencies
vi.mock("@/app/actions/github", () => ({
	getIssues: vi.fn(),
	getPullRequests: vi.fn(),
}));

vi.mock("@/app/actions/jules", () => ({
	getJulesSessionsAction: vi.fn(),
	listJulesSourcesAction: vi.fn(),
}));

vi.mock("@/app/actions/builder", () => ({
	startFixSessionAction: vi.fn(),
}));

vi.mock("@/components/molecules/glass-card", () => ({
	GlassCard: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

// Setup QueryClient
const createTestQueryClient = () => new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
});

const renderWithClient = (ui: JSX.Element) => {
	const queryClient = createTestQueryClient();
	return render(
		<QueryClientProvider client={queryClient}>
			{ui}
		</QueryClientProvider>
	);
};

describe("TaskBoard", () => {
	beforeEach(() => {
		vi.resetAllMocks();

		// Default successful mocks
		(listJulesSourcesAction as any).mockResolvedValue({ success: true, data: [] });
		(getIssues as any).mockResolvedValue({ success: true, data: [] });
		(getPullRequests as any).mockResolvedValue({ success: true, data: [] });
		(getJulesSessionsAction as any).mockResolvedValue({ success: true, data: { sessions: [] } });
	});

	it("renders successfully with empty data", async () => {
		renderWithClient(<TaskBoard />);
		await waitFor(() => {
			expect(screen.getByText("Backlog")).toBeInTheDocument();
		});
	});

	it("handles non-array API responses gracefully without crashing", async () => {
		// Simulate API returning non-array data (e.g. unexpected object or error masked as success)
		// This reproduces the "TypeError: (intermediate value).map is not a function" scenario
		(getIssues as any).mockResolvedValue({ success: true, data: { unexpected: "object" } });
		(getPullRequests as any).mockResolvedValue({ success: true, data: { unexpected: "object" } });
		(getJulesSessionsAction as any).mockResolvedValue({ success: true, data: { sessions: { unexpected: "object" } } });

		renderWithClient(<TaskBoard />);

		// Should not crash, and should render empty columns
		await waitFor(() => {
			expect(screen.getByText("Backlog")).toBeInTheDocument();
			expect(screen.getAllByText("No items")).toHaveLength(4); // 4 columns
		});
	});

	it("handles failed API responses gracefully", async () => {
		(getIssues as any).mockResolvedValue({ success: false, error: "Failed" });
		(getPullRequests as any).mockResolvedValue({ success: false, error: "Failed" });
		(getJulesSessionsAction as any).mockResolvedValue({ success: false, error: "Failed" });

		renderWithClient(<TaskBoard />);

		await waitFor(() => {
			expect(screen.getByText("Backlog")).toBeInTheDocument();
			expect(screen.getAllByText("No items")).toHaveLength(4);
		});
	});
});
