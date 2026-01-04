import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectBrowser } from "@/components/organisms/projects/project-browser";
import type { Project } from "@/lib/db/schema";

// Mock ProjectGrid
vi.mock("@/components/organisms/projects/project-grid", () => ({
	ProjectGrid: ({ projects }: { projects: any[] }) => (
		<div data-testid="project-grid">
			{projects.map((p) => (
				<div key={p.id} data-testid="project-item">
					{p.name}
				</div>
			))}
		</div>
	),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
	Search: () => <svg data-testid="icon-search" />,
	ArrowUpDown: () => <svg data-testid="icon-sort" />,
	ArrowDownAZ: () => <svg data-testid="icon-az" />,
	ArrowUpAZ: () => <svg data-testid="icon-za" />,
	Clock: () => <svg data-testid="icon-clock" />,
	ChevronDown: () => <svg data-testid="icon-chevron-down" />,
	ChevronUp: () => <svg data-testid="icon-chevron-up" />,
	Check: () => <svg data-testid="icon-check" />,
	LayoutGrid: () => <svg data-testid="icon-grid" />,
	List: () => <svg data-testid="icon-list" />,
	X: () => <svg data-testid="icon-x" />,
	Eye: () => <svg data-testid="icon-eye" />,
	Download: () => <svg data-testid="icon-download" />,
	Copy: () => <svg data-testid="icon-copy" />,
	Trash2: () => <svg data-testid="icon-trash" />,
	Undo2: () => <svg data-testid="icon-undo" />,
	Filter: () => <svg data-testid="icon-filter" />,
	CheckSquare: () => <svg data-testid="icon-check-square" />,
	FileJson: () => <svg data-testid="icon-file-json" />,
	FileText: () => <svg data-testid="icon-file-text" />,
	Calendar: () => <svg data-testid="icon-calendar" />,
}));

const mockProjects: Project[] = [
	{
		id: "1",
		name: "Alpha Project",
		description: "First project",
		createdAt: new Date("2023-01-01"),
		userId: "user1",
		visibility: "private",
		folders: [],
		forkedFromId: null,
		lastViewedSceneId: null,
	},
	{
		id: "2",
		name: "Beta Project",
		description: "Second project",
		createdAt: new Date("2023-02-01"),
		userId: "user1",
		visibility: "private",
		folders: [],
		forkedFromId: null,
		lastViewedSceneId: null,
	},
	{
		id: "3",
		name: "Gamma Project",
		description: "Third project",
		createdAt: new Date("2023-03-01"),
		userId: "user1",
		visibility: "private",
		folders: [],
		forkedFromId: null,
		lastViewedSceneId: null,
	},
];

describe("ProjectBrowser", () => {
	it("renders all projects initially", () => {
		render(<ProjectBrowser projects={mockProjects} />);
		expect(screen.getAllByTestId("project-item")).toHaveLength(3);
	});

	it("filters projects by name", () => {
		render(<ProjectBrowser projects={mockProjects} />);
		const input = screen.getByPlaceholderText("Search projects...");
		fireEvent.change(input, { target: { value: "Alpha" } });
		expect(screen.getAllByTestId("project-item")).toHaveLength(1);
		expect(screen.getByText("Alpha Project")).toBeInTheDocument();
	});

	it("sorts projects by newest (default)", () => {
		render(<ProjectBrowser projects={mockProjects} />);
		const items = screen.getAllByTestId("project-item");
		// Gamma is newest (March)
		expect(items[0]).toHaveTextContent("Gamma Project");
		expect(items[1]).toHaveTextContent("Beta Project");
		expect(items[2]).toHaveTextContent("Alpha Project");
	});
});
