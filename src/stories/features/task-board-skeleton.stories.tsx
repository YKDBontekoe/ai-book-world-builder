import type { Meta, StoryObj } from "@storybook/react";
import { TaskBoardSkeleton } from "@/components/builder/task-board-skeleton";

const meta = {
	title: "Features/Builder/TaskBoardSkeleton",
	component: TaskBoardSkeleton,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof TaskBoardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="h-screen w-full bg-slate-950 p-8 flex flex-col">
			<TaskBoardSkeleton />
		</div>
	),
};
