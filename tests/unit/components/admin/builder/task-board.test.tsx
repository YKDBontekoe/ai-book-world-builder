import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { RenderResult } from "@testing-library/react";
import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import type { JSX, ReactNode } from "react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startFixSessionAction } from "@/app/actions/builder";
import { getIssues, getPullRequests } from "@/app/actions/github";
import {
	getJulesSessionsAction,
	listJulesSourcesAction,
} from "@/app/actions/jules";
import { TaskBoard } from "@/components/admin/builder/task-board";

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

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// Mock lucide-react to avoid SVG complexity in tests
vi.mock("lucide-react", () => ({
	AlertCircle: () => <span data-testid="icon-alert" />,
	Bot: () => <span data-testid="icon-bot" />,
	GitPullRequest: () => <span data-testid="icon-pr" />,
}));

// Mock GlassCard to forward onClick
vi.mock("@/components/molecules/glass-card", () => ({
	GlassCard: ({
		children,
		className,
		onClick,
	}: {
		children: ReactNode;
		className?: string;
		onClick?: () => void;
	}) => (
		<button
			className={className}
			onClick={onClick}
			data-testid="glass-card"
			type="button"
		>
			{children}
		</button>
	),
}));

vi.mock("@/components/admin/github/item-detail", () => ({
	ItemDetail: ({ onBack }: { onBack: () => void }) => (
		<div>
			<h1>Item Detail</h1>
			<button type="button" onClick={onBack}>
				Back
			</button>
		</div>
	),
}));

vi.mock("@/components/admin/jules/jules-chat", () => ({
	JulesChat: ({ onBack }: { onBack: () => void }) => (
		<div>
			<h1>Jules Chat</h1>
			<button type="button" onClick={onBack}>
				Back
			</button>
		</div>
	),
}));

vi.mock("@/components/admin/builder/create-feature-dialog", () => ({
	CreateFeatureDialog: () => <button type="button">Create Feature</button>,
}));

// Setup QueryClient
const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
			},
		},
	});

const renderWithClient = (ui: JSX.Element): RenderResult => {
	const queryClient = createTestQueryClient();
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
};

// Helper to create a complete mock issue
const createMockIssue = (overrides = {}) => ({
	number: 1,
	title: "Test Issue",
	body: "Test Body",
	state: "open",
	user: { login: "testuser", avatar_url: "http://example.com/avatar.png" },
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
	html_url: "http://github.com/test/issue/1",
	comments: 0,
	...overrides,
});

const createMockSession = (overrides = {}) => ({
	id: "sessions/123",
	prompt: "Test Session",
	state: "IN_PROGRESS",
	title: "Test Session Title",
	createTime: new Date().toISOString(),
	updateTime: new Date().toISOString(),
	sourceContext: {
		source: "source1",
		githubRepoContext: { startingBranch: "main" },
	},
	url: "http://jules.google.com/sessions/123",
	...overrides,
});

describe("TaskBoard", () => {
	beforeEach(() => {
		vi.resetAllMocks();

		// Default successful mocks
		vi.mocked(listJulesSourcesAction).mockResolvedValue({
			success: true,
			data: [{ name: "source1" }],
		} as any);
		vi.mocked(getIssues).mockResolvedValue({ success: true, data: [] } as any);
		vi.mocked(getPullRequests).mockResolvedValue({
			success: true,
			data: [],
		} as any);
		vi.mocked(getJulesSessionsAction).mockResolvedValue({
			success: true,
			data: { sessions: [] },
		} as any);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("renders successfully with empty data", async () => {
		renderWithClient(<TaskBoard />);
		await waitFor(() => {
			expect(screen.getByText("Backlog")).toBeInTheDocument();
		});
	});

	it("handles non-array API responses gracefully without crashing", async () => {
		vi.mocked(getIssues).mockResolvedValue({
			success: true,
			data: { unexpected: "object" },
		} as any);
		vi.mocked(getPullRequests).mockResolvedValue({
			success: true,
			data: { unexpected: "object" },
		} as any);
		vi.mocked(getJulesSessionsAction).mockResolvedValue({
			success: true,
			data: { sessions: { unexpected: "object" } },
		} as any);

		renderWithClient(<TaskBoard />);

		await waitFor(() => {
			expect(screen.getByText("Backlog")).toBeInTheDocument();
			expect(screen.getAllByText("No items")).toHaveLength(4);
		});
	});

	it("handles failed API responses gracefully", async () => {
		vi.mocked(getIssues).mockResolvedValue({
			success: false,
			error: "Failed",
		} as any);
		vi.mocked(getPullRequests).mockResolvedValue({
			success: false,
			error: "Failed",
		} as any);
		vi.mocked(getJulesSessionsAction).mockResolvedValue({
			success: false,
			error: "Failed",
		} as any);

		renderWithClient(<TaskBoard />);

		await waitFor(() => {
			expect(screen.getByText("Backlog")).toBeInTheDocument();
			expect(screen.getAllByText("No items")).toHaveLength(4);
		});
	});

	it("renders items and handles navigation to details", async () => {
		const mockIssue = createMockIssue();
		vi.mocked(getIssues).mockResolvedValue({
			success: true,
			data: [mockIssue],
		} as any);

		renderWithClient(<TaskBoard />);

		// Wait for data to load and render
		// Use partial match function to handle potential whitespace issues in JSDOM
		await waitFor(() => {
			const headings = screen.getAllByRole("heading");
			const issueHeading = headings.find((h) =>
				h.textContent?.includes("Test Issue"),
			);
			expect(issueHeading).toBeInTheDocument();
		});

		// Click the card (glass-card div)
		const cards = screen.getAllByTestId("glass-card");
		fireEvent.click(cards[0]);

		// Wait for navigation
		await waitFor(
			() => {
				expect(screen.getByText(/Item Detail/)).toBeInTheDocument();
			},
			{ timeout: 3000 },
		);

		fireEvent.click(screen.getByText(/Back/));

		await screen.findByText("Backlog");
	});

	it("renders session items and handles navigation to chat", async () => {
		const mockSession = createMockSession();
		vi.mocked(getJulesSessionsAction).mockResolvedValue({
			success: true,
			data: { sessions: [mockSession] },
		} as any);

		renderWithClient(<TaskBoard />);

		await screen.findByText(/Test Session Title/);

		const cards = screen.getAllByTestId("glass-card");
		fireEvent.click(cards[0]);

		await screen.findByText(/Jules Chat/);
	});

	it("shows CreateFeatureDialog when sources are available", async () => {
		renderWithClient(<TaskBoard />);

		await waitFor(() => {
			expect(screen.getByText(/Create Feature/)).toBeInTheDocument();
		});
	});

	it("handles start fix action success", async () => {
		const mockIssue = createMockIssue();
		vi.mocked(getIssues).mockResolvedValue({
			success: true,
			data: [mockIssue],
		} as any);
		vi.mocked(startFixSessionAction).mockResolvedValue({
			success: true,
			data: {},
		} as any);
		vi.spyOn(window, "confirm").mockReturnValue(true);

		renderWithClient(<TaskBoard />);

		await waitFor(() => {
			const fixButton = screen
				.getAllByRole("button")
				.find((b) => b.textContent?.includes("Fix"));
			expect(fixButton).toBeInTheDocument();
			if (fixButton) {
				fireEvent.click(fixButton);
			}
		});

		await waitFor(() => {
			expect(startFixSessionAction).toHaveBeenCalledWith({ issueNumber: 1 });
			expect(toast.success).toHaveBeenCalledWith(
				"Jules is working on the fix!",
			);
		});
	});

	it("handles start fix action failure", async () => {
		const mockIssue = createMockIssue();
		vi.mocked(getIssues).mockResolvedValue({
			success: true,
			data: [mockIssue],
		} as any);
		vi.mocked(startFixSessionAction).mockResolvedValue({
			success: false,
			error: "Failed to start",
		} as any);
		vi.spyOn(window, "confirm").mockReturnValue(true);

		renderWithClient(<TaskBoard />);

		await waitFor(() => {
			const fixButton = screen
				.getAllByRole("button")
				.find((b) => b.textContent?.includes("Fix"));
			expect(fixButton).toBeInTheDocument();
			if (fixButton) {
				fireEvent.click(fixButton);
			}
		});

		await waitFor(() => {
			expect(startFixSessionAction).toHaveBeenCalled();
			expect(toast.error).toHaveBeenCalledWith(
				expect.stringContaining("Failed to start"),
			);
		});
	});

	it("polls for session updates", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const mockSession = createMockSession({ title: "Initial Title" });
		const updatedSession = createMockSession({ title: "Updated Title" });

		const mockGetSessions = vi.mocked(getJulesSessionsAction);
		mockGetSessions
			.mockResolvedValueOnce({
				success: true,
				data: { sessions: [mockSession] },
			} as any)
			.mockResolvedValue({
				success: true,
				data: { sessions: [updatedSession] },
			} as any);

		renderWithClient(<TaskBoard />);

		await waitFor(() => {
			expect(screen.getByText("Initial Title")).toBeInTheDocument();
		});

		await act(async () => {
			vi.advanceTimersByTime(11000);
		});

		await waitFor(
			() => {
				expect(mockGetSessions).toHaveBeenCalledTimes(2);
				expect(screen.getByText("Updated Title")).toBeInTheDocument();
			},
			{ timeout: 3000 },
		);
	});
});
