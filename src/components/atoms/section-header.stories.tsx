import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { StatusBadge } from "@/components/atoms/status-badge";
import { SectionHeader } from "@/components/molecules/section-header";

const meta: Meta<typeof SectionHeader> = {
	title: "UI/SectionHeader",
	component: SectionHeader,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
	},
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Default: Story = {
	args: {
		title: "Project Settings",
		description: "Manage your project configuration and preferences.",
	},
};

export const WithIcon: Story = {
	args: {
		title: "General",
		description: "Basic information about your project.",
		icon: Settings,
	},
};

export const WithAction: Story = {
	args: {
		title: "Team Members",
		description: "Invite and manage team members.",
		action: (
			<Button size="sm">
				<Plus className="mr-2 h-4 w-4" />
				Invite
			</Button>
		),
	},
};

export const WithMetadata: Story = {
	args: {
		title: "Deployment",
		metadata: <StatusBadge status="success">Live</StatusBadge>,
		description: "Your project is currently deployed.",
	},
};
