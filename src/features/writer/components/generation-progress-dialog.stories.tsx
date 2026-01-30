import type { Meta, StoryObj } from "@storybook/react";
import { GenerationProgressDialog } from "./generation-progress-dialog";

const meta: Meta<typeof GenerationProgressDialog> = {
	title: "Features/Writer/GenerationProgressDialog",
	component: GenerationProgressDialog,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
	},
	args: {
		open: true,
		onOpenChange: () => {},
		onCancel: () => {},
		scenes: [],
		phase: "planning",
	},
};

export default meta;
type Story = StoryObj<typeof GenerationProgressDialog>;

export const Planning: Story = {
	args: {
		phase: "planning",
		scenes: [],
	},
};

export const Generating: Story = {
	args: {
		phase: "generating",
		scenes: [
			{ id: "1", title: "Scene 1: The Beginning", status: "complete" },
			{ id: "2", title: "Scene 2: The Middle", status: "generating" },
			{ id: "3", title: "Scene 3: The End", status: "pending" },
		],
	},
};

export const GeneratingWithError: Story = {
	args: {
		phase: "generating",
		scenes: [
			{ id: "1", title: "Scene 1: The Beginning", status: "complete" },
			{ id: "2", title: "Scene 2: The Middle", status: "error" },
			{ id: "3", title: "Scene 3: The End", status: "pending" },
		],
	},
};

export const Complete: Story = {
	args: {
		phase: "complete",
		scenes: [
			{ id: "1", title: "Scene 1: The Beginning", status: "complete" },
			{ id: "2", title: "Scene 2: The Middle", status: "complete" },
			{ id: "3", title: "Scene 3: The End", status: "complete" },
		],
	},
};

export const ErrorStory: Story = {
	args: {
		phase: "error",
		error: "Failed to generate plan. Please try again.",
		scenes: [],
	},
};
