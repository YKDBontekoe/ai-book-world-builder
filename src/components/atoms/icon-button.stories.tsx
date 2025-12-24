import type { Meta, StoryObj } from "@storybook/react";
import { Search } from "lucide-react";
import { IconButton } from "@/components/atoms/icon-button";
import { TooltipProvider } from "@/components/atoms/tooltip";

const meta: Meta<typeof IconButton> = {
	title: "UI/IconButton",
	component: IconButton,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<TooltipProvider>
				<Story />
			</TooltipProvider>
		),
	],
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
	args: {
		icon: Search,
		"aria-label": "Search",
	},
};

export const WithTooltip: Story = {
	args: {
		icon: Search,
		tooltip: "Search database",
		srLabel: "Search",
	},
};

export const Sizes: Story = {
	render: () => (
		<div className="flex gap-4 items-center">
			<IconButton icon={Search} size="xs" tooltip="Extra Small" />
			<IconButton icon={Search} size="sm" tooltip="Small" />
			<IconButton icon={Search} size="md" tooltip="Medium" />
		</div>
	),
};
