import type { Meta, StoryObj } from "@storybook/react";
import { ProjectGrid } from "@/components/organisms/projects/project-grid";
import type { Project } from "@/lib/db/schema";

const meta: Meta<typeof ProjectGrid> = {
	title: "Organisms/Projects/ProjectGrid",
	component: ProjectGrid,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProjectGrid>;

const mockProjects: Project[] = [
	{
		id: "1",
		name: "Cyberpunk Novel",
		description: "A gritty story set in Neo-Tokyo.",
		createdAt: new Date("2024-01-01"),
		userId: "user1",
		visibility: "private",
		folders: [],
        forkedFromId: null,
        lastViewedSceneId: null,
	},
	{
		id: "2",
		name: "Fantasy Epic",
		description: "Dragons and magic in a lost world.",
		createdAt: new Date("2024-01-02"),
		userId: "user1",
		visibility: "public",
		folders: [],
        forkedFromId: null,
        lastViewedSceneId: null,
	},
];

export const Default: Story = {
	args: {
		projects: mockProjects,
		selectedIds: new Set(),
        onSelect: () => {},
	},
};

export const SelectionMode: Story = {
	args: {
		projects: mockProjects,
		selectedIds: new Set(["1"]),
        onSelect: () => {},
	},
};
