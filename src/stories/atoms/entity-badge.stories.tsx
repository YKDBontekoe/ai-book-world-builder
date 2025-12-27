import type { Meta, StoryObj } from "@storybook/react";
import { EntityBadge } from "@/components/atoms/entity-badge";

const meta: Meta<typeof EntityBadge> = {
	title: "Design System/Atoms/EntityBadge",
	component: EntityBadge,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
	},
	argTypes: {
		type: {
			control: "select",
			options: [
				"character",
				"location",
				"item",
				"event",
				"organization",
				"default",
			],
		},
	},
};

export default meta;
type Story = StoryObj<typeof EntityBadge>;

export const Default: Story = {
	args: {
		type: "default",
		children: "Entity Name",
	},
};

export const Character: Story = {
	args: {
		type: "character",
		children: "Sherlock Holmes",
	},
};

export const Location: Story = {
	args: {
		type: "location",
		children: "Baker Street",
	},
};

export const NoIcon: Story = {
	args: {
		type: "item",
		children: "Magnifying Glass",
		showIcon: false,
	},
};
