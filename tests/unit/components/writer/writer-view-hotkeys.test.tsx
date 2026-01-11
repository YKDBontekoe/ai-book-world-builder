import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WriterView } from "@/features/writer/components/writer-view";
import { toast } from "sonner";
import type { Project } from "@/lib/db/schema";
import { BookCanvasProvider } from "@/components/organisms/book-canvas/book-canvas-context";

// Inline mock data
const mockProject: Project = {
	id: "project-1",
	userId: "user-1",
	name: "Test Project",
	description: "Test Description",
	visibility: "private",
	createdAt: new Date(),
	updatedAt: new Date(),
	archivedAt: null,
	deletedAt: null,
	wordCount: 0,
	coverImage: null,
	defaultChapterId: null,
	lastViewedSceneId: null,
	folders: [],
    customMetadata: null,
    forkedFromId: null
};

// Mock dependencies
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		refresh: vi.fn(),
	}),
}));

vi.mock("sonner", () => ({
	toast: {
		info: vi.fn(),
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock("@/features/writer/components/writer-sidebar", () => ({
	WriterSidebar: () => <div data-testid="writer-sidebar">Sidebar</div>,
}));

vi.mock("@/features/writer/components/writer-editor", () => ({
	WriterEditor: () => <div data-testid="writer-editor">Editor</div>,
}));

vi.mock("@/components/organisms/book-canvas/book-canvas", () => ({
	BookCanvas: () => <div data-testid="book-canvas">Canvas</div>,
}));

vi.mock("@/features/writer/components/power-dock", () => ({
	PowerDock: () => <div data-testid="power-dock">PowerDock</div>,
}));

vi.mock("@/features/writer/components/tools/writer-spotlight", () => ({
	WriterSpotlight: () => <div data-testid="writer-spotlight">Spotlight</div>,
}));

// Mock Resizable Panel Group (simplified)
vi.mock("@/components/atoms/resizable", () => ({
	ResizablePanelGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ResizablePanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ResizableHandle: () => <div />,
}));

describe("WriterView Hotkeys", () => {
	const user = userEvent.setup();

	it("toggles sidebar on Cmd+B", async () => {
		render(
			<BookCanvasProvider>
				<WriterView project={mockProject} />
			</BookCanvasProvider>
		);

		// Wait for mount
		await waitFor(() => expect(screen.getByTestId("writer-editor")).toBeInTheDocument());

		// Trigger Cmd+B
		await user.keyboard("{Meta>}b{/Meta}");

		// Expect toast
		await waitFor(() => {
			expect(toast.info).toHaveBeenCalledWith(
				expect.stringContaining("Toggled Sidebar"),
				expect.any(Object)
			);
		});
	});
});
