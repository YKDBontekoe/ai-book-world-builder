import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/atoms/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";

const meta = {
	title: "Design System/Atoms/Tooltip",
	component: Tooltip,
	tags: ["autodocs"],
	decorators: [
		(Story: any) => (
			<TooltipProvider>
				<Story />
			</TooltipProvider>
		),
	],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args: any) => (
		<Tooltip {...args}>
			<TooltipTrigger asChild>
				<Button variant="outline">Hover</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>Add to library</p>
			</TooltipContent>
		</Tooltip>
	),
};
