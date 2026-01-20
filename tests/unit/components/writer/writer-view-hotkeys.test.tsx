import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BookCanvasProvider } from "@/components/organisms/book-canvas/book-canvas-context";
import { WriterView } from "@/features/writer/components/writer-view";
import type { Project } from "@/lib/db/schema";

// Inline mock data satisfying Project type
const mockProject: Project = {
	id: "project-1",
	userId: "user-1",
	name: "Test Project",
	description: "Test Description",
	visibility: "private",
	createdAt: new Date(),
	// updatedAt removed - it does NOT exist in Project schema in src/lib/db/schema/projects.ts
	folders: [],
	forkedFromId: null,
	lastViewedSceneId: null,
};

// Mock dependencies
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		refresh: vi.fn(),
	}),
}));

vi.mock("usehooks-ts", () => ({
	useMediaQuery: () => false, // Desktop mode
	useDebounceCallback: (fn: any) => fn,
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

// Mock the server action file itself to prevent it from trying to load DB in test env
vi.mock("@/features/writer/actions", () => ({
	getProjectStructure: vi
		.fn()
		.mockResolvedValue({ structure: [], structureText: "" }),
	updateSceneContent: vi.fn(),
	createChapterSnapshot: vi.fn(),
}));

// Mock Resizable Panel Group (simplified)
vi.mock("@/components/atoms/resizable", () => ({
	ResizablePanelGroup: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	ResizablePanel: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	ResizableHandle: () => <div />,
}));

describe("WriterView Hotkeys", () => {
	it("toggles sidebar on Cmd+B", async () => {
		const user = userEvent.setup();
		render(
			<BookCanvasProvider>
				<WriterView project={mockProject} />
			</BookCanvasProvider>,
		);

		// Wait for mount and verify initial state (sidebar open on desktop)
		await waitFor(() =>
			expect(screen.getByTestId("writer-editor")).toBeInTheDocument(),
		);
		expect(screen.getByTestId("writer-sidebar")).toBeInTheDocument();

		// Trigger Cmd+B
		await user.keyboard("{Meta>}b{/Meta}");

		// Expect sidebar to be gone
		await waitFor(() => {
			expect(screen.queryByTestId("writer-sidebar")).not.toBeInTheDocument();
		});

		// Trigger Cmd+B again
		await user.keyboard("{Meta>}b{/Meta}");

		// Expect sidebar to be back
		await waitFor(() => {
			expect(screen.getByTestId("writer-sidebar")).toBeInTheDocument();
		});
	});
});
