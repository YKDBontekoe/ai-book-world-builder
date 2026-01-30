import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "@/components/atoms/accordion";
import type { ChapterWithScenes } from "@/lib/types";
import { SidebarChapter } from "./sidebar-chapter";

// Mock data
const mockScenes: ChapterWithScenes["scenes"] = [
	{
		id: "scene-1",
		title: "The Beginning",
		sequence: 1,
		status: "drafted",
		chapterId: "chapter-1",
		projectId: "project-1",
		createdAt: new Date(),
		updatedAt: new Date(),
		prevSceneId: null,
		content: "Scene content...",
		wordCount: 100,
	},
	{
		id: "scene-2",
		title: "The Middle",
		sequence: 2,
		status: "drafting",
		chapterId: "chapter-1",
		projectId: "project-1",
		createdAt: new Date(),
		updatedAt: new Date(),
		prevSceneId: "scene-1",
		content: "Scene content...",
		wordCount: 200,
	},
];

const mockChapter: ChapterWithScenes = {
	id: "chapter-1",
	title: "Chapter 1: The Start",
	sequence: 1,
	status: "planned",
	createdAt: new Date(),
	updatedAt: new Date(),
	outlineId: "outline-1",
	volumeId: "volume-1",
	projectId: "project-1",
	notes: null,
	scenes: mockScenes,
};

const meta: Meta<typeof SidebarChapter> = {
	title: "Writer/Sidebar/SidebarChapter",
	component: SidebarChapter,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<Accordion
				type="multiple"
				defaultValue={["chapter-1"]}
				className="w-80 border p-2 rounded-lg"
			>
				<Story />
			</Accordion>
		),
	],
	argTypes: {
		onSceneSelect: { action: "onSceneSelect" },
		onGenerateNextScene: { action: "onGenerateNextScene" },
		onCreateSceneManually: { action: "onCreateSceneManually" },
		onRenameScene: { action: "onRenameScene" },
		onDeleteScene: { action: "onDeleteScene" },
		onToggleSceneSelect: { action: "onToggleSceneSelect" },
		onRenameChapter: { action: "onRenameChapter" },
		onDeleteChapter: { action: "onDeleteChapter" },
	},
};

export default meta;
type Story = StoryObj<typeof SidebarChapter>;

export const Default: Story = {
	args: {
		chapter: mockChapter,
		activeSceneId: "scene-1",
		isGenerating: false,
		readOnly: false,
		isSelectionMode: false,
		selectedSceneIds: new Set(),
	},
};

export const Generating: Story = {
	args: {
		...Default.args,
		isGenerating: true,
	},
};

export const ReadOnly: Story = {
	args: {
		...Default.args,
		readOnly: true,
	},
};

export const SelectionMode: Story = {
	args: {
		...Default.args,
		isSelectionMode: true,
		selectedSceneIds: new Set(["scene-1"]),
	},
};

export const Empty: Story = {
	args: {
		...Default.args,
		chapter: {
			...mockChapter,
			scenes: [],
		},
	},
};
