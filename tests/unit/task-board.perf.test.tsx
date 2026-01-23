import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TaskBoard } from "@/components/builder/task-board";
import type { TaskItem } from "@/components/builder/task-card";

// Hoist the spy so it can be used in the mock factory
const { TaskCardSpy } = vi.hoisted(() => {
	return { TaskCardSpy: vi.fn() };
});

// Mock the TaskCard component to be memoized
vi.mock("@/components/builder/task-card", async () => {
	const React = await import("react");

	const MockComponent = (props: { item: TaskItem }) => {
		TaskCardSpy(props);
		const { item } = props;
		const id = item.type === "session" ? item.data.id : item.data.number;
		return (
			<div data-testid="task-card">
				{item.type} - {id}
			</div>
		);
	};

	// Wrap in React.memo to verify prop stability from parent
	return {
		TaskCard: React.memo(MockComponent),
	};
});

// Mock the actions
vi.mock("@/app/actions/github", () => ({
	getIssues: vi.fn(),
	getPullRequests: vi.fn(),
}));

vi.mock("@/app/actions/jules", () => ({
	getJulesSessionsAction: vi.fn(),
	listJulesSourcesAction: vi
		.fn()
		.mockResolvedValue({ success: true, data: [] }),
}));

vi.mock("@/app/actions/builder", () => ({
	startFixSessionAction: vi.fn(),
}));

import { getIssues, getPullRequests } from "@/app/actions/github";
import { getJulesSessionsAction } from "@/app/actions/jules";

describe("TaskBoard Performance", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
					staleTime: 0,
				},
			},
		});
		vi.clearAllMocks();
		TaskCardSpy.mockClear();

		// Setup default mock returns
		(getIssues as any).mockImplementation((state: string) => {
			if (state === "open") {
				return Promise.resolve({
					success: true,
					data: [
						{
							number: 1,
							title: "Issue 1",
							user: { login: "user1" },
							updated_at: "2023-01-01",
						},
						{
							number: 2,
							title: "Issue 2",
							user: { login: "user1" },
							updated_at: "2023-01-01",
						},
					],
				});
			}
			return Promise.resolve({ success: true, data: [] });
		});

		(getPullRequests as any).mockResolvedValue({ success: true, data: [] });
		(getJulesSessionsAction as any).mockResolvedValue({
			success: true,
			data: { sessions: [] },
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("should not re-render Issue cards when Sessions update", async () => {
		// Initial Render
		render(
			<QueryClientProvider client={queryClient}>
				<TaskBoard />
			</QueryClientProvider>,
		);

		// Expect 2 items (issues)
		await waitFor(() =>
			expect(screen.getAllByTestId("task-card")).toHaveLength(2),
		);

		const initialRenderCount = TaskCardSpy.mock.calls.length;
		console.log("Initial render count:", initialRenderCount);

		// Update Sessions data (simulate polling)
		(getJulesSessionsAction as any).mockResolvedValue({
			success: true,
			data: {
				sessions: [
					{
						id: "session-1",
						state: "STATE_RUNNING",
						title: "New Session",
						prompt: "Fixing things",
					},
				],
			},
		});

		// Invalidate queries to trigger re-fetch
		await act(async () => {
			await queryClient.invalidateQueries({ queryKey: ["jules", "sessions"] });
		});

		await waitFor(() =>
			expect(screen.getAllByTestId("task-card")).toHaveLength(3),
		); // 2 issues + 1 session

		const finalRenderCount = TaskCardSpy.mock.calls.length;
		const additionalRenders = finalRenderCount - initialRenderCount;

		console.log(`Additional renders: ${additionalRenders} (Expected: 1)`);

		// Expectation:
		// With optimization (stable props + memoized component),
		// existing 2 issue cards should NOT re-render.
		// Only the 1 new session card should render.
		// Total additional renders = 1.

		expect(additionalRenders).toBe(1);
	});
});
