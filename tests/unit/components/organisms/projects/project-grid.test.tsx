import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { ProjectGrid } from "@/components/organisms/projects/project-grid";
import type { Project } from "@/lib/db/schema";

// Mock dependencies
vi.mock("framer-motion", () => {
	const motion =
		(Component: React.ElementType) =>
		(props: React.ComponentProps<typeof Component>) => <Component {...props} />;
	const div = ({
		children,
		className,
		...props
	}: React.HTMLAttributes<HTMLDivElement>) => (
		<div className={className} {...props}>
			{children}
		</div>
	);
	return { motion: Object.assign(motion, { div }) };
});

vi.mock("@/components/molecules/glass-card", () => ({
	GlassCard: ({
		children,
		className,
		...props
	}: React.HTMLAttributes<HTMLDivElement>) => (
		<div className={className} {...props}>
			{children}
		</div>
	),
}));

vi.mock("@/components/organisms/projects/project-actions-menu", () => ({
	ProjectActionsMenu: () => <div data-testid="project-actions-menu" />,
}));

vi.mock("@/components/organisms/projects/project-preview-sheet", () => ({
	ProjectPreviewSheet: () => <div data-testid="project-preview-sheet" />,
}));

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		className,
	}: {
		children: React.ReactNode;
		href: string;
		className?: string;
	}) => (
		<a href={href} className={className}>
			{children}
		</a>
	),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
	FolderIcon: ({ className }: { className?: string }) => (
		<span data-testid="folder-icon" className={className} />
	),
	CalendarIcon: ({ className }: { className?: string }) => (
		<span data-testid="calendar-icon" className={className} />
	),
	Globe: ({ className }: { className?: string }) => (
		<span data-testid="globe-icon" className={className} />
	),
	Eye: ({ className }: { className?: string }) => (
		<span data-testid="eye-icon" className={className} />
	),
	Check: ({ className }: { className?: string }) => (
		<span data-testid="check-icon" className={className} />
	),
}));

const mockProject: Project = {
	id: "proj-1",
	name: "Test Project",
	description: "A test project description",
	createdAt: new Date("2023-01-01"),
	userId: "user-1",
	visibility: "private",
	folders: [],
	forkedFromId: null,
	lastViewedSceneId: null,
};

describe("ProjectGrid", () => {
	it("renders project card correctly", () => {
		render(
			<ProjectGrid
				projects={[mockProject]}
				selectedIds={new Set()}
				onSelect={vi.fn()}
			/>,
		);

		expect(screen.getByText("Test Project")).toBeInTheDocument();
		expect(screen.getByText("A test project description")).toBeInTheDocument();
	});

	it("calls onSelect with correct arguments when clicked", () => {
		const onSelect = vi.fn();
		render(
			<ProjectGrid
				projects={[mockProject]}
				selectedIds={new Set()}
				onSelect={onSelect}
			/>,
		);

		const trigger = screen.getByRole("button", { name: "Select project" });
		fireEvent.click(trigger);

		expect(onSelect).toHaveBeenCalledWith("proj-1", false);
	});

	it("calls onSelect with shiftKey when clicked with shift", () => {
		const onSelect = vi.fn();
		render(
			<ProjectGrid
				projects={[mockProject]}
				selectedIds={new Set()}
				onSelect={onSelect}
			/>,
		);

		const trigger = screen.getByRole("button", { name: "Select project" });
		fireEvent.click(trigger, { shiftKey: true });

		expect(onSelect).toHaveBeenCalledWith("proj-1", true);
	});

	it("calls onSelect when Enter key is pressed", () => {
		const onSelect = vi.fn();
		render(
			<ProjectGrid
				projects={[mockProject]}
				selectedIds={new Set()}
				onSelect={onSelect}
			/>,
		);

		const trigger = screen.getByRole("button", { name: "Select project" });
		fireEvent.keyDown(trigger, { key: "Enter" });

		expect(onSelect).toHaveBeenCalledTimes(1);
	});

	it("calls onSelect with shiftKey when Enter key is pressed with Shift", () => {
		const onSelect = vi.fn();
		render(
			<ProjectGrid
				projects={[mockProject]}
				selectedIds={new Set()}
				onSelect={onSelect}
			/>,
		);

		const trigger = screen.getByRole("button", { name: "Select project" });
		fireEvent.keyDown(trigger, { key: "Enter", shiftKey: true });

		expect(onSelect).toHaveBeenCalledWith("proj-1", true);
	});

	it("calls onSelect with shiftKey when Space key is pressed with Shift", () => {
		const onSelect = vi.fn();
		render(
			<ProjectGrid
				projects={[mockProject]}
				selectedIds={new Set()}
				onSelect={onSelect}
			/>,
		);

		const trigger = screen.getByRole("button", { name: "Select project" });
		fireEvent.keyDown(trigger, { key: " ", shiftKey: true });

		expect(onSelect).toHaveBeenCalledWith("proj-1", true);
	});
});
