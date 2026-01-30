import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta = {
	title: "Atoms/Popover",
	component: Popover,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<Popover {...args}>
			<PopoverTrigger asChild>
				<Button variant="outline">Open Popover</Button>
			</PopoverTrigger>
			<PopoverContent>
				<div className="space-y-2">
					<h4 className="font-medium leading-none">Dimensions</h4>
					<p className="text-sm text-muted-foreground">
						Set the dimensions for the layer.
					</p>
				</div>
			</PopoverContent>
		</Popover>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("button", { name: /Open Popover/i });

		await userEvent.click(trigger);

		const body = within(document.body);
		const content = await body.findByText("Dimensions");
		await expect(content).toBeVisible();
	},
};
