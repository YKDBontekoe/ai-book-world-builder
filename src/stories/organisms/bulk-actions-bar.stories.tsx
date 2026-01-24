import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { BulkActionsBar } from "@/components/organisms/book-canvas/panes/bible/bulk-actions-bar";

const meta = {
	title: "Organisms/BulkActionsBar",
	component: BulkActionsBar,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		selectedCount: { control: "number" },
	},
	args: {
		onDelete: fn(),
		onCopy: fn(),
		onDownloadJSON: fn(),
		onClearSelection: fn(),
	},
} satisfies Meta<typeof BulkActionsBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		selectedCount: 5,
	},
};

export const ManySelected: Story = {
	args: {
		selectedCount: 124,
	},
};
