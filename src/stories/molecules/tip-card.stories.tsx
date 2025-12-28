import type { Meta, StoryObj } from "@storybook/react";
import { TipCard } from "@/components/molecules/tip-card";

const meta: Meta<typeof TipCard> = {
	title: "Design System/Molecules/TipCard",
	component: TipCard,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<div className="w-[400px]">
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof TipCard>;

export const Info: Story = {
	args: {
		variant: "info",
		children: "This is a helpful tip for the user.",
	},
};

export const Warning: Story = {
	args: {
		variant: "warning",
		children: "This action cannot be undone.",
	},
};

export const Success: Story = {
	args: {
		variant: "success",
		children: "Operation completed successfully.",
	},
};

export const ErrorState: Story = {
	args: {
		variant: "error",
		children: "An error occurred while processing.",
	},
};
