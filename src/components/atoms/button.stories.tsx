import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within } from "@storybook/test";
import { Button } from "./button";

const meta = {
	title: "Atoms/Button",
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
			options: ["default", "sm", "lg", "icon", "pill"],
		},
		asChild: {
			control: "boolean",
		},
	},
	args: {
		onClick: fn(),
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "Button",
		variant: "default",
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button", { name: /button/i });
		await userEvent.click(button);
	},
};

export const Destructive: Story = {
	args: {
		children: "Destructive",
		variant: "destructive",
	},
};

export const Outline: Story = {
	args: {
		children: "Outline",
		variant: "outline",
	},
};

export const Secondary: Story = {
	args: {
		children: "Secondary",
		variant: "secondary",
	},
};

export const Ghost: Story = {
	args: {
		children: "Ghost",
		variant: "ghost",
	},
};

export const Link: Story = {
	args: {
		children: "Link",
		variant: "link",
	},
};

export const Glass: Story = {
	args: {
		children: "Glass",
		variant: "glass",
	},
};

export const Small: Story = {
	args: {
		children: "Small",
		size: "sm",
	},
};

export const Large: Story = {
	args: {
		children: "Large",
		size: "lg",
	},
};

export const Icon: Story = {
	args: {
		children: "icon",
		size: "icon",
	},
};

export const Pill: Story = {
	args: {
		children: "Pill Button",
		size: "pill",
	},
};
