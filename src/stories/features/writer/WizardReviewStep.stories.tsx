import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { WizardReviewStep } from "@/features/writer/components/story-wizard/WizardReviewStep";
import type { BookPlan } from "@/lib/services/schemas/story-schemas";

const mockPlan: BookPlan = {
	title: "My Great Story",
	logline: "A hero saves the world.",
	summary: "Full summary here.",
	chapters: [
		{ title: "The Beginning", summary: "Hero wakes up." },
		{ title: "The Middle", summary: "Hero fights." },
		{ title: "The End", summary: "Hero wins." },
	],
};

const meta: Meta<typeof WizardReviewStep> = {
	title: "Features/Writer/WizardReviewStep",
	component: WizardReviewStep,
	tags: ["autodocs"],
	args: {
		plan: mockPlan,
		onUpdatePlan: fn(),
		onUpdateChapter: fn(),
		onDeleteChapter: fn(),
		onAddChapter: fn(),
		onRestart: fn(),
		onCreateStory: fn(),
	},
};

export default meta;
type Story = StoryObj<typeof WizardReviewStep>;

export const Default: Story = {};
