import type { Meta, StoryObj } from "@storybook/react";
import { KeyValueTable } from "@/components/molecules/key-value-table";

const meta: Meta<typeof KeyValueTable> = {
	title: "Design System/Molecules/KeyValueTable",
	component: KeyValueTable,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
	},
};

export default meta;
type Story = StoryObj<typeof KeyValueTable>;

const sampleData = {
	id: "user_123",
	name: "Alice Wonderland",
	email: "alice@example.com",
	isActive: true,
	role: "admin",
	stats: {
		logins: 42,
		lastLogin: "2023-10-27T10:00:00Z",
	},
	tags: ["vip", "early-access"],
};

export const Default: Story = {
	args: {
		data: sampleData,
	},
};

export const NestedData: Story = {
	args: {
		data: {
			project: "Apollo",
			details: {
				budget: 1000000,
				team: {
					lead: "John Doe",
					members: ["Jane", "Bob"],
				},
			},
			milestones: [
				{ name: "Phase 1", status: "complete" },
				{ name: "Phase 2", status: "pending" },
			],
		},
	},
};

export const Empty: Story = {
	args: {
		data: {},
	},
};
