import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SceneNavigation } from "@/features/writer/components/left-sidebar/scene-navigation";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

// Mock dependencies
vi.mock("@/features/writer/actions", () => ({
	createNewChapter: vi.fn(),
	createSceneInChapter: vi.fn(),
	deleteScene: vi.fn(),
	generateScene: vi.fn(),
	updateSceneTitle: vi.fn(),
}));

vi.mock("@/features/writer/components/left-sidebar/scene-item", () => ({
	SceneItem: ({ title }: { title: string }) => (
		<div data-testid="scene-item">{title}</div>
	),
}));

vi.mock("@/components/molecules/empty-state", () => ({
	EmptyState: ({
		title,
		action,
	}: {
		title: string;
		action: React.ReactNode;
	}) => (
		<div data-testid="empty-state">
			<h2>{title}</h2>
			{action}
		</div>
	),
}));

describe("SceneNavigation", () => {
	const mockProject = { id: "p1" } as Project;

	it("renders empty state when there are no chapters", () => {
		render(
			<SceneNavigation
				project={mockProject}
				activeSceneId={null}
				onSceneSelect={vi.fn()}
				structure={[]}
				loading={false}
			/>,
		);

		expect(screen.getByTestId("empty-state")).toBeInTheDocument();
		expect(screen.getByText("No chapters yet")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /add first chapter/i }),
		).toBeInTheDocument();
	});

	it("renders chapters list when structure is present", () => {
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
				scenes: [],
			},
		];

		render(
			<SceneNavigation
				project={mockProject}
				activeSceneId={null}
				onSceneSelect={vi.fn()}
				structure={structure}
				loading={false}
			/>,
		);

		expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
		expect(screen.getByText("Chapter 1")).toBeInTheDocument();
	});

	it("filters scenes based on search input", async () => {
		const user = userEvent.setup();
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
						title: "Battle of the Deep",
						chapterId: "c1",
						sequence: 1,
						content: "",
						status: "draft",
						createdAt: new Date(),
						updatedAt: new Date(),
					} as any,
					{
						id: "s2",
						title: "Quiet Morning",
						chapterId: "c1",
						sequence: 2,
						content: "",
						status: "draft",
						createdAt: new Date(),
						updatedAt: new Date(),
					} as any,
				],
			},
			{
				id: "c2",
				title: "Chapter 2",
				projectId: "p1",
				sequence: 2,
				volumeId: "v1",
				outlineId: "o1",
				status: "active",
				notes: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				scenes: [
					{
						id: "s3",
						title: "Another Battle",
						chapterId: "c2",
						sequence: 1,
						content: "",
						status: "draft",
						createdAt: new Date(),
						updatedAt: new Date(),
					} as any,
				],
			},
		];

		render(
			<SceneNavigation
				project={mockProject}
				activeSceneId={null}
				onSceneSelect={vi.fn()}
				structure={structure}
				loading={false}
			/>,
		);

		const searchInput = screen.getByPlaceholderText(/search scenes/i);
		await user.type(searchInput, "Battle");

		await waitFor(() => {
			expect(screen.queryByText("Quiet Morning")).not.toBeInTheDocument();
		});

		expect(screen.getByText("Battle of the Deep")).toBeInTheDocument();
		expect(screen.getByText("Another Battle")).toBeInTheDocument();
	});
});
