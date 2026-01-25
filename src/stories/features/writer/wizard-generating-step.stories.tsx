import type { Meta, StoryObj } from "@storybook/react";
import { WizardGeneratingStep } from "@/features/writer/components/story-wizard/WizardGeneratingStep";

const meta = {
	title: "Features/Writer/WizardGeneratingStep",
	component: WizardGeneratingStep,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof WizardGeneratingStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
	args: {
		message: "Generating your story plan...",
	},
};

export const Creating: Story = {
	args: {
		message: "Building your story structure...",
	},
};
