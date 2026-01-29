import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProjectStructure } from "@/features/writer/actions";
import { WriterProvider } from "@/features/writer/components/writer-context";
import { WriterSidebar } from "@/features/writer/components/writer-sidebar";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes, SceneWithPrev } from "@/lib/types";

// Mock Server Actions
vi.mock("@/features/writer/actions", () => ({
	getProjectStructure: vi.fn(),
	deleteScene: vi.fn(),
	renameScene: vi.fn(),
	createScene: vi.fn(),
	createChapter: vi.fn(),
	renameChapter: vi.fn(),
	deleteChapter: vi.fn(),
	bulkExportScenes: vi.fn(),
	bulkDeleteScenes: vi.fn(),
	generateNextScene: vi.fn(),
}));

// Mock Next Navigation
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		refresh: vi.fn(),
	}),
	usePathname: () => "/projects/p1/write",
	useParams: () => ({ projectId: "p1" }),
}));

// Mock Layout Context
vi.mock("@/features/writer/components/writer-layout-context", () => ({
	useWriterLayoutContext: () => ({
		toggleSidebar: vi.fn(),
	}),
}));

// Mock BookCanvas Context
vi.mock("@/components/organisms/book-canvas/book-canvas-context", () => ({
	useBookCanvasSelection: () => ({
		activeSceneId: null,
	}),
	useBookCanvasActions: () => ({
		setActiveSceneId: vi.fn(),
	}),
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

// Mock ScrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe("WriterSidebar Integration", () => {
	const mockProject: Project = {
		id: "p1",
		name: "Test Project",
		createdAt: new Date(),
		userId: "u1",
		description: null,
		visibility: "private",
		folders: [],
		forkedFromId: null,
		lastViewedSceneId: null,
	};

	const mockStructure: ChapterWithScenes[] = [
		{
			id: "c1",
			title: "Chapter 1",
			sequence: 1,
			status: "planned",
			projectId: "p1",
			outlineId: "o1",
			volumeId: "v1",
			createdAt: new Date(),
			updatedAt: new Date(),
			notes: null,
			scenes: [
				{
					id: "s1",
					title: "Scene 1",
					sequence: 1,
					status: "drafted",
					chapterId: "c1",
					projectId: "p1",
					createdAt: new Date(),
					updatedAt: new Date(),
					prevSceneId: null,
					content: "Content",
					wordCount: 100,
				} as SceneWithPrev,
			],
		},
	];

	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(getProjectStructure).mockResolvedValue({
			success: true,
			data: {
				structure: mockStructure,
				structureText: "Chapter 1\nScene 1",
			},
		});
	});

	const renderSidebar = () => {
		return render(
			<WriterProvider project={mockProject} initialStructure={undefined}>
				<WriterSidebar />
			</WriterProvider>,
		);
	};

	it("fetches and renders project structure", async () => {
		renderSidebar();

		// Verify loading state or wait for data
		await waitFor(() => {
			expect(getProjectStructure).toHaveBeenCalledWith({ projectId: "p1" });
		});

		expect(await screen.findByText("Chapter 1")).toBeInTheDocument();
		expect(await screen.findByText("Scene 1")).toBeInTheDocument();
	});

	it("handles empty structure", async () => {
		vi.mocked(getProjectStructure).mockResolvedValue({
			success: true,
			data: {
				structure: [],
				structureText: "",
			},
		});

		renderSidebar();

		await waitFor(() => {
			expect(getProjectStructure).toHaveBeenCalled();
		});

		expect(await screen.findByText("No chapters yet")).toBeInTheDocument();
		// Use regex to be flexible with exact button text
		expect(
			screen.getByRole("button", { name: /Add First Chapter/i }),
		).toBeInTheDocument();
	});
});
