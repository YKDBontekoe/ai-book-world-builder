import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { KanbanView } from "@/components/organisms/book-canvas/panes/kanban-view";
import * as writerContext from "@/components/organisms/writer/writer-context";

// Mocks
vi.mock("@tanstack/react-query", () => ({
	useMutation: () => ({ mutate: vi.fn() }),
	useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("@/app/actions/writer/scene", () => ({
	deleteScene: vi.fn(),
	updateSceneTitle: vi.fn(),
}));

vi.mock("@/app/actions/writer/scene-status", () => ({
	updateSceneStatus: vi.fn(),
}));

// Mock Dnd Context to avoid complex dnd interactions in unit test
vi.mock("@dnd-kit/core", async () => {
	const actual = await vi.importActual("@dnd-kit/core");
	return {
		...actual,
		DndContext: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		useSensor: vi.fn(),
		useSensors: vi.fn(),
	};
});

const mockScenes = [
	{
		id: "scene-1",
		title: "Scene 1",
		sequence: 1,
		status: "planned",
		chapterId: "chapter-1",
		content: "Content 1",
		projectId: "project-1",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: "scene-2",
		title: "Scene 2",
		sequence: 2,
		status: "drafting",
		chapterId: "chapter-1",
		content: "Content 2",
		projectId: "project-1",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: "scene-3",
		title: "Other Scene",
		sequence: 1,
		status: "planned",
		chapterId: "chapter-2",
		content: "Content 3",
		projectId: "project-1",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const mockChapters = [
	{
		id: "chapter-1",
		title: "Chapter 1",
		sequence: 1,
		scenes: [mockScenes[0], mockScenes[1]],
		projectId: "project-1",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: "chapter-2",
		title: "Chapter 2",
		sequence: 2,
		scenes: [mockScenes[2]],
		projectId: "project-1",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

describe("KanbanView", () => {
	const mockSetActiveSceneId = vi.fn();
	const mockSetIsCanvasOpen = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
		vi.spyOn(writerContext, "useWriterContext").mockReturnValue({
			setActiveSceneId: mockSetActiveSceneId,
			setIsCanvasOpen: mockSetIsCanvasOpen,
		} as any);
	});

	it("renders all scenes in correct columns", () => {
		render(<KanbanView chapters={mockChapters as any} projectId="project-1" />);

		expect(screen.getByText("Scene 1")).toBeInTheDocument();
		expect(screen.getByText("Scene 2")).toBeInTheDocument();
		expect(screen.getByText("Other Scene")).toBeInTheDocument();
	});

	it("filters scenes by search query", () => {
		render(<KanbanView chapters={mockChapters as any} projectId="project-1" />);

		const searchInput = screen.getByPlaceholderText("Search scenes...");
		fireEvent.change(searchInput, { target: { value: "Other" } });

		expect(screen.queryByText("Scene 1")).not.toBeInTheDocument();
		expect(screen.getByText("Other Scene")).toBeInTheDocument();
	});

	it("navigates to scene when opening in editor", async () => {
		render(<KanbanView chapters={mockChapters as any} projectId="project-1" />);

		// Find the card (trigger for context menu)
		const card = screen.getByText("Scene 1").closest("div[role='button']");
		expect(card).toBeInTheDocument();

		// Right click to open context menu
		if (card) {
			fireEvent.contextMenu(card);
		}

		// Click "Open in Editor"
		const openButton = await screen.findByText("Open in Editor");
		fireEvent.click(openButton);

		expect(mockSetActiveSceneId).toHaveBeenCalledWith("scene-1");
		expect(mockSetIsCanvasOpen).toHaveBeenCalledWith(false);
	});
});
