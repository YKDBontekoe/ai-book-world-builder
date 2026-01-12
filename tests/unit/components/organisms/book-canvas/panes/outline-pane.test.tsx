import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OutlinePane } from "@/components/organisms/book-canvas/panes/outline-pane";

// Mock dependencies
const mockGetOutlineData = vi.hoisted(() => vi.fn());
const mockReorderChapters = vi.hoisted(() => vi.fn());
const mockCreateChapter = vi.hoisted(() => vi.fn());
const mockUpdateChapter = vi.hoisted(() => vi.fn());
const mockDeleteChapter = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions/project-stats", () => ({
	getOutlineData: mockGetOutlineData,
}));

vi.mock("@/app/actions/chapter-ops", () => ({
	reorderChaptersAction: mockReorderChapters,
	createChapterAction: mockCreateChapter,
	updateChapterAction: mockUpdateChapter,
	deleteChapterAction: mockDeleteChapter,
}));

vi.mock("@/components/organisms/book-canvas/book-canvas-context", () => ({
	useBookCanvasLayout: vi.fn().mockReturnValue({ projectId: "project-123" }),
}));

// Mock sonner
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// Mock dnd-kit
vi.mock("@dnd-kit/core", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@dnd-kit/core")>();
	return {
		...actual,
		DndContext: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		useSensor: vi.fn(),
		useSensors: vi.fn(),
	};
});

describe("OutlinePane", () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	const renderPane = () =>
		render(
			<QueryClientProvider client={queryClient}>
				<OutlinePane />
			</QueryClientProvider>,
		);

	it("renders outline data correctly", async () => {
		mockGetOutlineData.mockResolvedValue({
			success: true,
			data: {
				id: "outline-1",
				title: "My Story",
				summary: "A great summary",
				pov: "Third Limited",
				tone: "Dark",
				pacing: "Fast",
				beats: ["Beat 1", "Beat 2"],
				chapters: [
					{
						id: "c1",
						title: "Chapter 1",
						notes: "Note 1",
						status: "planned",
						sequence: 1,
					},
				],
			},
		});

		renderPane();

		// Check basic data
		await waitFor(() => {
			expect(screen.getByText("My Story")).toBeInTheDocument();
			expect(screen.getByText("A great summary")).toBeInTheDocument();
			expect(screen.getByText("Chapter 1")).toBeInTheDocument();
		});

		// Check buttons are present
		expect(
			screen.getByRole("button", { name: /add chapter/i }),
		).toBeInTheDocument();
	});

	it("calls create action when adding a chapter", async () => {
		const user = userEvent.setup();

		mockGetOutlineData.mockResolvedValue({
			success: true,
			data: {
				id: "outline-1",
				title: "My Story",
				chapters: [],
				beats: [],
			},
		});

		mockCreateChapter.mockResolvedValue({ success: true });

		renderPane();

		await waitFor(() =>
			expect(screen.getByText("My Story")).toBeInTheDocument(),
		);

		const addButton = screen.getByRole("button", { name: /add chapter/i });
		expect(addButton).toBeEnabled();

		await user.click(addButton);

		// useMutation calls the function with (variables)
		// but apparently also passes a second argument (context?) in this environment
		// so we check the first argument
		await waitFor(() => {
			expect(mockCreateChapter).toHaveBeenCalledWith(
				expect.objectContaining({
					projectId: "project-123",
					title: "Chapter 1",
				}),
				expect.anything(), // Ignore second argument
			);
		});
	});
});
