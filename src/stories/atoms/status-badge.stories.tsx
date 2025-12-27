import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "@/components/atoms/status-badge";

const meta: Meta<typeof StatusBadge> = {
	title: "Design System/Atoms/StatusBadge",
	component: StatusBadge,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
	},
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Default: Story = {
	args: {
		children: "Info",
		status: "info",
	},
};

export const Success: Story = {
	args: {
		children: "Success",
		status: "success",
	},
};

export const Warning: Story = {
	args: {
		children: "Warning",
		status: "warning",
	},
};

export const Error: Story = {
	args: {
		children: "Error",
		status: "error",
	},
};

export const Pending: Story = {
	args: {
		children: "Pending",
		status: "pending",
	},
};

export const Running: Story = {
	args: {
		children: "Running",
		status: "running",
	},
};

export const NoIcon: Story = {
	args: {
		children: "Custom Status",
		status: "info",
		showIcon: false,
	},
};
