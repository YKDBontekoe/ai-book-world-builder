import type { Meta, StoryObj } from "@storybook/react";
import { StoryWizard } from "@/features/writer/components/story-wizard";
import { TooltipProvider } from "@/components/atoms/tooltip";

const meta = {
	title: "Features/Writer/StoryWizard",
	component: StoryWizard,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<TooltipProvider>
				<Story />
			</TooltipProvider>
		),
	],
	args: {
		projectId: "test-project-id",
		onComplete: () => console.log("Complete"),
	},
} satisfies Meta<typeof StoryWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
