import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SceneNavigation } from "@/components/organisms/writer/left-sidebar/scene-navigation";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

// Mock dependencies
vi.mock("@/app/actions/writer", () => ({
	bulkDeleteScenes: vi.fn(),
	createNewChapter: vi.fn(),
	createSceneInChapter: vi.fn(),
	deleteScene: vi.fn(),
	generateScene: vi.fn(),
	restoreScenes: vi.fn(),
	updateSceneTitle: vi.fn(),
}));

vi.mock("@/app/actions/scene-ops", () => ({
	bulkDeleteScenes: vi.fn().mockResolvedValue({ success: true }),
	restoreScenes: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		loading: vi.fn(),
	},
}));

// Mock SceneItem to simplify testing
vi.mock("@/components/organisms/writer/left-sidebar/scene-item", () => ({
	SceneItem: ({
		scene,
		onSelect,
		selectionMode,
		isSelected,
	}: {
		scene: { id: string; title: string };
		onSelect: (id: string) => void;
		selectionMode: boolean;
		isSelected: boolean;
	}) => (
		<div data-testid={`scene-${scene.id}`}>
			<span>{scene.title}</span>
			{selectionMode && (
				<input
					type="checkbox"
					checked={isSelected}
					onChange={() => onSelect(scene.id)}
					data-testid={`checkbox-${scene.id}`}
				/>
			)}
		</div>
	),
}));

const mockProject: Project = {
	id: "project-1",
	userId: "user-1",
	name: "Test Project",
	createdAt: new Date(),
	updatedAt: new Date(),
	active: true,
	visibility: "private",
	description: "",
	lastViewedSceneId: null,
};

const mockStructure: ChapterWithScenes[] = [
	{
		id: "chapter-1",
		title: "Chapter 1",
		sequence: 1,
		scenes: [
			{
				id: "scene-1",
				title: "Scene 1",
				sequence: 1,
				chapterId: "chapter-1",
				projectId: "project-1",
				content: "Content 1",
				status: "drafted",
				prevSceneId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			},
			{
				id: "scene-2",
				title: "Scene 2",
				sequence: 2,
				chapterId: "chapter-1",
				projectId: "project-1",
				content: "Content 2",
				status: "drafted",
				prevSceneId: "scene-1",
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			},
		],
		createdAt: new Date(),
		updatedAt: new Date(),
		status: "planned",
		notes: null,
		outlineId: "outline-1",
		volumeId: "volume-1",
		projectId: "project-1",
	},
];

describe("SceneNavigation", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders chapters and scenes", () => {
		render(
			<SceneNavigation
				project={mockProject}
				activeSceneId={null}
				onSceneSelect={vi.fn()}
				structure={mockStructure}
				loading={false}
			/>,
		);

		expect(screen.getByText("Chapter 1")).toBeDefined();
		expect(screen.getByText("Scene 1")).toBeDefined();
		expect(screen.getByText("Scene 2")).toBeDefined();
	});

	it("toggles selection mode", () => {
		render(
			<SceneNavigation
				project={mockProject}
				activeSceneId={null}
				onSceneSelect={vi.fn()}
				structure={mockStructure}
				loading={false}
			/>,
		);

		// Click the select button (we need to find it by aria-label or icon if possible, but mock implementation might vary)
		// Assuming the Select button has a title "Select Scenes"
		const selectButton = screen.getByTitle("Select Scenes");
		fireEvent.click(selectButton);

		// Checkboxes should appear
		expect(screen.getByTestId("checkbox-scene-1")).toBeDefined();
		expect(screen.getByTestId("checkbox-scene-2")).toBeDefined();
	});

	it("selects scenes and shows bulk delete action", async () => {
		render(
			<SceneNavigation
				project={mockProject}
				activeSceneId={null}
				onSceneSelect={vi.fn()}
				structure={mockStructure}
				loading={false}
			/>,
		);

		// Enter selection mode
		fireEvent.click(screen.getByTitle("Select Scenes"));

		// Select scenes
		fireEvent.click(screen.getByTestId("checkbox-scene-1"));
		fireEvent.click(screen.getByTestId("checkbox-scene-2"));

		// Check bulk delete button appears
		expect(screen.getByText("2 selected")).toBeDefined();
		const deleteButton = screen.getByText("Delete");
		expect(deleteButton).toBeDefined();
	});

	it("calls bulkDeleteScenes when delete is clicked", async () => {
		const { bulkDeleteScenes } = await import("@/app/actions/scene-ops");

		render(
			<SceneNavigation
				project={mockProject}
				activeSceneId={null}
				onSceneSelect={vi.fn()}
				structure={mockStructure}
				loading={false}
			/>,
		);

		// Enter selection mode
		fireEvent.click(screen.getByTitle("Select Scenes"));

		// Select scene 1
		fireEvent.click(screen.getByTestId("checkbox-scene-1"));

		// Click delete
		const deleteButton = screen.getByText("Delete");
		fireEvent.click(deleteButton);

		await waitFor(() => {
			expect(bulkDeleteScenes).toHaveBeenCalledWith("project-1", ["scene-1"]);
		});
	});
});
