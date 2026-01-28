import type { Meta, StoryObj } from "@storybook/react";
import { ChapterActions } from "./chapter-actions";

const meta: Meta<typeof ChapterActions> = {
	title: "Features/Writer/ChapterActions",
	component: ChapterActions,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
	},
	args: {
		chapterId: "chapter-1",
		onUpdate: () => console.log("onUpdate"),
	},
};

export default meta;
type Story = StoryObj<typeof ChapterActions>;

export const Default: Story = {};

export const ReadOnly: Story = {
	args: {
		isReadOnly: true,
	},
};
