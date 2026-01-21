import type { Meta, StoryObj } from "@storybook/react";
import { WizardGeneratingStep } from "@/features/writer/components/story-wizard/WizardGeneratingStep";

const meta: Meta<typeof WizardGeneratingStep> = {
	title: "Features/Writer/WizardGeneratingStep",
	component: WizardGeneratingStep,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof WizardGeneratingStep>;

export const Default: Story = {
	args: {},
};

export const CustomMessage: Story = {
	args: {
		message: "Creating your world...",
	},
};
