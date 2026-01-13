import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SuggestedActions } from "@/components/organisms/chat/suggested-actions";

// Removed vi.mock("@/lib/api-client") in favor of MSW

vi.mock("@/lib/utils", () => ({
	cn: (...args: any[]) => args.join(" "),
}));

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
});

const defaultProps = {
	chatId: "test-chat-id",
	sendMessage: vi.fn(),
	selectedVisibilityType: "private" as const,
	messages: [{ id: "1", role: "user", content: "Hello" }] as any[], // Add a message to trigger fetch
	selectedModelId: "gpt-4o" as const,
	isCompact: false,
	selectedProject: { id: "p1", name: "Test Project" } as any, // Add project to trigger fetch
};

describe("SuggestedActions", () => {
	it("renders grid with correct classes", async () => {
		render(
			<QueryClientProvider client={queryClient}>
				<SuggestedActions {...defaultProps} />
			</QueryClientProvider>,
		);

		const container = await screen.findByTestId("suggested-actions");
		// We expect the class to contain the new grid definition
		expect(container.className).toContain(
			"grid-cols-[repeat(auto-fit,minmax(260px,1fr))]",
		);
	});

	it("fetches and displays suggestions from API (MSW)", async () => {
		render(
			<QueryClientProvider client={queryClient}>
				<SuggestedActions {...defaultProps} />
			</QueryClientProvider>,
		);

		// Wait for the mock data from MSW to appear
		const suggestion = await screen.findByText("Mocked Suggestion");
		expect(suggestion).toBeInTheDocument();
		expect(screen.getByText("Mocked reasoning")).toBeInTheDocument();
	});
});
