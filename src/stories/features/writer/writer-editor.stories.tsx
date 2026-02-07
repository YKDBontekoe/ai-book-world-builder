import type { Meta, StoryObj } from "@storybook/react";
import { WriterProvider } from "@/features/writer/components/writer-context";
import { WriterControlProvider } from "@/features/writer/components/writer-control-context";
import { WriterEditor } from "@/features/writer/components/writer-editor";
import { WriterLayoutContext } from "@/features/writer/components/writer-layout-context";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

// Mock data
const mockProject: Project = {
	id: "project-1",
	name: "Test Project",
	description: "A test project description",
	userId: "user-1",
	createdAt: new Date(),
	visibility: "private",
	folders: [],
	forkedFromId: null,
	lastViewedSceneId: null,
};

const mockScenes = [
	{
		id: "scene-1",
		title: "Scene 1",
		content: "This is the content of scene 1.",
		chapterId: "chapter-1",
		createdAt: new Date(),
		updatedAt: new Date(),
		sequence: 0,
		projectId: "project-1",
		wordCount: 100,
		status: "draft",
		prevSceneId: null,
	},
	{
		id: "scene-2",
		title: "Scene 2",
		content: "This is the content of scene 2.",
		chapterId: "chapter-1",
		createdAt: new Date(),
		updatedAt: new Date(),
		sequence: 1,
		projectId: "project-1",
		wordCount: 150,
		status: "draft",
		prevSceneId: "scene-1",
	},
];

const mockStructure: ChapterWithScenes[] = [
	{
		id: "chapter-1",
		title: "Chapter 1",
		sequence: 0,
		projectId: "project-1",
		createdAt: new Date(),
		updatedAt: new Date(),
		scenes: mockScenes,
		outlineId: "outline-1",
		volumeId: "volume-1",
		notes: null,
		status: "planned",
	},
];

// Layout Context Mock
const defaultLayoutContext = {
	isSidebarOpen: true,
	toggleSidebar: () => {},
	isCanvasOpen: false,
	toggleCanvas: () => {},
	viewMode: "standard" as const,
	toggleZenMode: () => {},
	isTypewriterMode: false,
	toggleTypewriterMode: () => {},
	isDirectorMode: false,
	toggleDirectorMode: () => {},
};

const meta: Meta<typeof WriterEditor> = {
	title: "Features/Writer/WriterEditor",
	component: WriterEditor,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<div className="h-screen w-full flex flex-col bg-background">
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof WriterEditor>;

const Template = (args: {
	initialStructure?: ChapterWithScenes[];
	isReadOnly?: boolean;
	lastViewedSceneId?: string;
}) => (
	<WriterLayoutContext.Provider value={defaultLayoutContext}>
		<WriterProvider
			project={{
				...mockProject,
				lastViewedSceneId: args.lastViewedSceneId || null,
			}}
			initialStructure={args.initialStructure}
			isReadOnly={args.isReadOnly}
		>
			<WriterControlProvider>
				<WriterEditor />
			</WriterControlProvider>
		</WriterProvider>
	</WriterLayoutContext.Provider>
);

export const Default: Story = {
	render: () => (
		<Template initialStructure={mockStructure} lastViewedSceneId="scene-1" />
	),
};

export const EmptyProject: Story = {
	render: () => <Template initialStructure={[]} />,
};

export const NoSelection: Story = {
	render: () => <Template initialStructure={mockStructure} />,
};

export const ReadOnly: Story = {
	render: () => (
		<Template
			initialStructure={mockStructure}
			lastViewedSceneId="scene-1"
			isReadOnly={true}
		/>
	),
};
