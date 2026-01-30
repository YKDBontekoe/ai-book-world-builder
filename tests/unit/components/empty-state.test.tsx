import { fireEvent, render, screen } from "@testing-library/react";
import { Folder } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { EmptyState } from "@/components/molecules/empty-state";

describe("EmptyState", () => {
	it("renders title and description", () => {
		render(
			<EmptyState
				title="No projects"
				description="Create a project to get started"
			/>,
		);
		expect(screen.getByText("No projects")).toBeInTheDocument();
		expect(
			screen.getByText("Create a project to get started"),
		).toBeInTheDocument();
	});

	it("renders icon when provided", () => {
		const { container } = render(
			<EmptyState title="No projects" icon={Folder} />,
		);
		// Lucide icons render as SVG
		const svg = container.querySelector("svg");
		expect(svg).toBeInTheDocument();
	});

	it("renders action button", () => {
		render(
			<EmptyState
				title="No projects"
				action={<button type="button">Create Project</button>}
			/>,
		);
		expect(screen.getByText("Create Project")).toBeInTheDocument();
	});

	it("renders glass variant correctly", () => {
		render(<EmptyState title="Glass" variant="glass" />);
		const container = screen.getByTestId("empty-state-container");
		// GlassCard adds glass-panel class
		expect(container.className).toContain("glass-panel");
	});

	it("should have no accessibility violations", async () => {
		const { container } = render(
			<EmptyState
				title="No projects"
				description="Description"
				icon={Folder}
				action={<button type="button">Action</button>}
			/>,
		);
		const results = await axe(container);
		expect(results.violations).toEqual([]);
	});

	it("handles suggestions", () => {
		const handleSuggestion = vi.fn();
		render(
			<EmptyState
				title="Search"
				suggestions={["Term 1", "Term 2"]}
				onSuggestionClick={handleSuggestion}
			/>,
		);

		fireEvent.click(screen.getByText("Term 1"));
		expect(handleSuggestion).toHaveBeenCalledWith("Term 1");
	});
});
