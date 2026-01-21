import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { TooltipProvider } from "@/components/atoms/tooltip";
import {
	STORY_TEMPLATES,
	StoryWizard,
} from "@/features/writer/components/story-wizard";

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

export const CustomTemplates: Story = {
	args: {
		templates: [
			STORY_TEMPLATES[0],
			{
				...STORY_TEMPLATES[1],
				label: "Custom Template",
				description: "This is a custom template injected via props.",
			},
		],
	},
};

export const TemplateInteraction: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Check if templates are rendered
		const heroTemplate = canvas.getByText("The Hero's Journey");
		await expect(heroTemplate).toBeInTheDocument();

		// Click the template
		await userEvent.click(heroTemplate);

		// Check if prompt is updated
		const promptInput = canvas.getByPlaceholderText(
			/e.g. A cyberpunk detective/i,
		) as HTMLTextAreaElement;
		await expect(promptInput.value).toContain(
			"A young farm boy discovers he is the heir",
		);

		// Check if style is updated (e.g. Genre)
		// Note: Radix UI Select trigger usually displays the selected value.
		// We look for "Fantasy" in the document (it might be in the trigger).
		const fantasyText = canvas.getByText("Fantasy");
		await expect(fantasyText).toBeInTheDocument();
	},
};
