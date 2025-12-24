import type { Meta, StoryObj } from "@storybook/react";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";

const meta: Meta<typeof LoadingSpinner> = {
	title: "UI/LoadingSpinner",
	component: LoadingSpinner,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
	},
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
	args: {
		size: "md",
		variant: "default",
	},
};

export const Sizes: Story = {
	render: () => (
		<div className="flex gap-4 items-center">
			<LoadingSpinner size="xs" />
			<LoadingSpinner size="sm" />
			<LoadingSpinner size="md" />
			<LoadingSpinner size="lg" />
		</div>
	),
};

export const Variants: Story = {
	render: () => (
		<div className="flex gap-4 items-center bg-zinc-100 p-4 rounded">
			<LoadingSpinner variant="primary" />
			<LoadingSpinner variant="muted" />
			<LoadingSpinner variant="success" />
			<LoadingSpinner variant="warning" />
			<LoadingSpinner variant="error" />
		</div>
	),
};
