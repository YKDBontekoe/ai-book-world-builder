import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/atoms/button";

const meta = {
	title: "UI/Button",
	component: Button,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: [
				"default",
				"destructive",
				"outline",
				"secondary",
				"ghost",
				"link",
				"glass",
			],
		},
		size: {
			control: "select",
			options: ["default", "sm", "lg", "icon"],
		},
		asChild: {
			control: false,
		},
	},
	args: {
		children: "Button",
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		variant: "default",
	},
};

export const Secondary: Story = {
	args: {
		variant: "secondary",
	},
};

export const Destructive: Story = {
	args: {
		variant: "destructive",
	},
};

export const Outline: Story = {
	args: {
		variant: "outline",
	},
};

export const Ghost: Story = {
	args: {
		variant: "ghost",
	},
};

export const Link: Story = {
	args: {
		variant: "link",
	},
};

export const Glass: Story = {
	args: {
		variant: "glass",
	},
	parameters: {
		backgrounds: {
			default: "dark",
		},
	},
};

export const Small: Story = {
	args: {
		size: "sm",
		children: "Small Button",
	},
};

export const Large: Story = {
	args: {
		size: "lg",
		children: "Large Button",
	},
};
