import type { Meta, StoryObj } from "@storybook/react";
import { WizardReviewStep } from "@/features/writer/components/story-wizard/WizardReviewStep";

const meta = {
	title: "Features/Writer/WizardReviewStep",
	component: WizardReviewStep,
	parameters: {
		layout: "centered",
	},
	args: {
		plan: {
			title: "The Crystal Key",
			logline: "A young girl discovers a key that unlocks a parallel universe.",
			summary: "In a world where magic is banned, Elara finds a crystal key...",
			chapters: [
				{
					title: "The Discovery",
					summary: "Elara finds the key in her grandmother's attic.",
				},
				{
					title: "The Door",
					summary: "Elara finds the door that the key fits.",
				},
				{
					title: "The Other Side",
					summary: "Elara steps through into the magical realm.",
				},
			],
		},
		onUpdatePlan: () => {},
		onUpdateChapter: () => {},
		onDeleteChapter: () => {},
		onAddChapter: () => {},
		onRestart: () => {},
		onCreateStory: () => {},
	},
} satisfies Meta<typeof WizardReviewStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongContent: Story = {
	args: {
		plan: {
			title: "The Chronicles of the Eternal Empire: Rise of the Phoenix",
			logline: "A sprawling epic about the rise and fall of an intergalactic empire spanning thousands of years and involving complex political maneuvering.",
			summary: "In the year 3000, humanity has spread to the stars. The Eternal Empire rules with an iron fist... ".repeat(10),
			chapters: Array.from({ length: 10 }).map((_, i) => ({
				title: `Chapter ${i + 1}: The Beginning of the End part ${i + 1}`,
				summary: "This is a detailed summary of the chapter events... ".repeat(5),
			})),
		},
	},
};
