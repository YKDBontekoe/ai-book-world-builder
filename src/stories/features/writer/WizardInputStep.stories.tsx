import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { WizardInputStep } from "@/features/writer/components/story-wizard/WizardInputStep";
import { STORY_TEMPLATES } from "@/lib/story-templates";

const meta: Meta<typeof WizardInputStep> = {
	title: "Features/Writer/WizardInputStep",
	component: WizardInputStep,
	tags: ["autodocs"],
	args: {
		templates: STORY_TEMPLATES,
		prompt: "",
		style: {
			genre: "General Fiction",
			pov: "Third Person Limited",
			tone: "Neutral",
		},
		onPromptChange: fn(),
		onStyleChange: fn(),
		onApplyTemplate: fn(),
		onGenerate: fn(),
	},
};

export default meta;
type Story = StoryObj<typeof WizardInputStep>;

export const Default: Story = {};

export const WithPrompt: Story = {
	args: {
		prompt: "A story about a robot.",
	},
};
