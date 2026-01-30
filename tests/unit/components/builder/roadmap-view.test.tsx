import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { RenderResult } from "@testing-library/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { JSX } from "react";
import type { MockInstance } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getIssues } from "@/app/actions/github";
import type { GitHubIssue } from "@/app/actions/github/types";
import { discoverFeaturesAction } from "@/app/actions/jules-ai";
import type { SuggestedFeature } from "@/components/builder/roadmap-view";
import { RoadmapView } from "@/components/builder/roadmap-view";
import type { Result } from "@/lib/result";

// Mock dependencies
vi.mock("@/app/actions/github", () => ({
	getIssues: vi.fn(),
}));

vi.mock("@/app/actions/jules-ai", () => ({
	discoverFeaturesAction: vi.fn(),
}));

vi.mock("@/components/builder/create-feature-dialog", () => ({
	CreateFeatureDialog: ({ trigger }: { trigger?: React.ReactNode }) => (
		<div data-testid="create-feature-dialog">
			{trigger || <button type="button">Create Feature</button>}
		</div>
	),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
	Brain: () => <span data-testid="icon-brain" />,
	ExternalLink: () => <span data-testid="icon-external-link" />,
	Hammer: () => <span data-testid="icon-hammer" />,
	Lightbulb: () => <span data-testid="icon-lightbulb" />,
	Loader2: () => <span data-testid="icon-loader" />,
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

describe("RoadmapView", () => {
	let mockGetIssues: MockInstance<
		[string?],
		Promise<Result<GitHubIssue[]>>
	>;
	let mockDiscoverFeatures: MockInstance<
		[unknown?],
		Promise<Result<SuggestedFeature[]>>
	>;

	beforeEach(() => {
		vi.resetAllMocks();
		mockGetIssues = vi.mocked(getIssues);
		mockDiscoverFeatures = vi.mocked(discoverFeaturesAction);

		mockGetIssues.mockResolvedValue({ success: true, data: [] });
	});

	it("renders successfully", async () => {
		renderWithClient(<RoadmapView />);
		await waitFor(() => {
			expect(screen.getByText("Product Roadmap")).toBeInTheDocument();
		});
	});

	it("displays friendly error message and logs raw error on generic failure", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		mockDiscoverFeatures.mockRejectedValue(
			new Error("Some internal server error"),
		);

		renderWithClient(<RoadmapView />);

		// Click Brainstorm Ideas
		const brainstormBtn = screen.getByText("Brainstorm Ideas");
		fireEvent.click(brainstormBtn);

		await waitFor(() => {
			// Check user friendly message
			expect(
				screen.getByText("Something went wrong while brainstorming ideas."),
			).toBeInTheDocument();
			// Ensure raw error is NOT shown to user
			expect(
				screen.queryByText("Some internal server error"),
			).not.toBeInTheDocument();
		});

		// Check logging
		expect(consoleSpy).toHaveBeenCalledWith(
			"Brainstorming error:",
			expect.any(Error),
		);
		consoleSpy.mockRestore();
	});

	it("displays specific friendly message for context length exceeded", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		mockDiscoverFeatures.mockRejectedValue(
			new Error("Error: context_length_exceeded limit 8000"),
		);

		renderWithClient(<RoadmapView />);

		const brainstormBtn = screen.getByText("Brainstorm Ideas");
		fireEvent.click(brainstormBtn);

		await waitFor(() => {
			expect(
				screen.getByText(
					"Project context is too large. Try archiving old documents.",
				),
			).toBeInTheDocument();
		});

		consoleSpy.mockRestore();
	});

	it("displays specific friendly message for rate limit", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		mockDiscoverFeatures.mockRejectedValue(
			new Error("429: rate_limit exceeded"),
		);

		renderWithClient(<RoadmapView />);

		const brainstormBtn = screen.getByText("Brainstorm Ideas");
		fireEvent.click(brainstormBtn);

		await waitFor(() => {
			expect(
				screen.getByText(
					"AI service usage limit reached. Please try again later.",
				),
			).toBeInTheDocument();
		});

		consoleSpy.mockRestore();
	});

	it("displays specific friendly message for auth error", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		mockDiscoverFeatures.mockRejectedValue(
			new Error("401 Unauthorized"),
		);

		renderWithClient(<RoadmapView />);

		const brainstormBtn = screen.getByText("Brainstorm Ideas");
		fireEvent.click(brainstormBtn);

		await waitFor(() => {
			expect(
				screen.getByText(
					"Authorization failed. Please check your Jules API key.",
				),
			).toBeInTheDocument();
		});

		consoleSpy.mockRestore();
	});

	it("displays suggestions on success", async () => {
		const suggestions: SuggestedFeature[] = [
			{
				title: "New Cool Feature",
				description: "Description of feature",
				reasoning: "Good idea",
				impact: "High",
				type: "Feature",
			},
		];
		mockDiscoverFeatures.mockResolvedValue({
			success: true,
			data: suggestions,
		});

		renderWithClient(<RoadmapView />);

		const brainstormBtn = screen.getByText("Brainstorm Ideas");
		fireEvent.click(brainstormBtn);

		await waitFor(() => {
			expect(screen.getByText("New Cool Feature")).toBeInTheDocument();
			expect(screen.getByText("High Impact")).toBeInTheDocument();
		});
	});
});
