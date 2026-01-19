import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { SceneNavigation } from "@/features/writer/components/left-sidebar/scene-navigation";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

// Polyfill ResizeObserver
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

// Mock dependencies
vi.mock("@/features/writer/actions", () => ({
	createNewChapter: vi.fn(),
	createSceneInChapter: vi.fn(),
	deleteScene: vi.fn(),
	generateScene: vi.fn(),
	updateSceneTitle: vi.fn(),
	bulkDeleteScenes: vi.fn().mockResolvedValue({ success: true }),
	bulkExportScenes: vi.fn(),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		loading: vi.fn(),
		custom: vi.fn().mockReturnValue("toast-id"),
		dismiss: vi.fn(),
	},
}));

vi.mock("@/features/writer/components/left-sidebar/scene-item", () => ({
	SceneItem: ({ scene, onDelete, onToggleSelect }: any) => (
		<div data-testid={`scene-item-${scene.id}`}>
			{scene.title}
			<button
				type="button"
				onClick={() => onDelete(scene.id)}
				aria-label={`Delete ${scene.title}`}
			>
				Delete
			</button>
			<button
				type="button"
				onClick={() => onToggleSelect(scene.id)}
				aria-label={`Select ${scene.title}`}
			>
				Select
			</button>
		</div>
	),
}));

describe("SceneNavigation Undo Delete", () => {
	const mockProject = { id: "p1" } as Project;
	const structure: ChapterWithScenes[] = [
		{
			id: "c1",
			title: "Chapter 1",
			projectId: "p1",
			sequence: 1,
			volumeId: "v1",
			outlineId: "o1",
			status: "active",
			notes: null,
			createdAt: new Date(),
			updatedAt: new Date(),
			scenes: [
				{
					id: "s1",
					title: "Scene 1",
					chapterId: "c1",
					sequence: 1,
					content: "",
					status: "draft",
					createdAt: new Date(),
					updatedAt: new Date(),
				} as any,
				{
					id: "s2",
					title: "Scene 2",
					chapterId: "c1",
					sequence: 2,
					content: "",
					status: "draft",
					createdAt: new Date(),
					updatedAt: new Date(),
				} as any,
			],
		},
	];

	it("optimistically removes scene", async () => {
		const user = userEvent.setup();
		render(
			<SceneNavigation
				project={mockProject}
				activeSceneId={null}
				onSceneSelect={vi.fn()}
				structure={structure}
				loading={false}
			/>,
		);

		// Find delete button for Scene 1
		const deleteButton = screen.getByRole("button", {
			name: /delete scene 1/i,
		});
		await user.click(deleteButton);

		// Scene 1 should be gone from UI
		await waitFor(() => {
			expect(screen.queryByText("Scene 1")).not.toBeInTheDocument();
		});

		// Scene 2 should still be there
		expect(screen.getByText("Scene 2")).toBeInTheDocument();

		// Toast should be shown
		expect(toast.custom).toHaveBeenCalled();
	});

	it("restores scene when undo is clicked", async () => {
		const user = userEvent.setup();

		let toastRenderFn: any;
		(toast.custom as any).mockImplementation((fn: any) => {
			toastRenderFn = fn;
			return "toast-id";
		});

		render(
			<SceneNavigation
				project={mockProject}
				activeSceneId={null}
				onSceneSelect={vi.fn()}
				structure={structure}
				loading={false}
			/>,
		);

		// Delete Scene 1
		const deleteButton = screen.getByRole("button", {
			name: /delete scene 1/i,
		});
		await user.click(deleteButton);

		// Verify gone
		await waitFor(() => {
			expect(screen.queryByText("Scene 1")).not.toBeInTheDocument();
		});

		// Verify toast custom was called and we captured the render fn
		expect(toastRenderFn).toBeDefined();

		// Render the toast content
		// Note: Render toast in a separate container/render call as it would happen in real app
		const { getByText } = render(toastRenderFn("toast-id"));

		const undoButton = getByText("Undo");

		// Use userEvent to click undo
		await user.click(undoButton);

		// Verify Scene 1 is back
		await waitFor(() => {
			expect(screen.getByText("Scene 1")).toBeInTheDocument();
		});
	});
});
