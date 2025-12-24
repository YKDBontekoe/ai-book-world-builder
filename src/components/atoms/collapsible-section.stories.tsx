import type { Meta, StoryObj } from "@storybook/react";
import { Settings } from "lucide-react";
import { CollapsibleSection } from "@/components/atoms/collapsible-section";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";

const meta: Meta<typeof CollapsibleSection> = {
	title: "UI/CollapsibleSection",
	component: CollapsibleSection,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
	},
	argTypes: {
		icon: {
			control: false, // Disable control for icon since it's a component
		},
	},
};

export default meta;
type Story = StoryObj<typeof CollapsibleSection>;

export const Default: Story = {
	args: {
		title: "General Settings",
		icon: <Settings className="h-4 w-4" />,
	},
	render: (args) => (
		<CollapsibleSection {...args}>
			<div className="grid gap-4">
				<div className="grid gap-2">
					<Label htmlFor="name">Name</Label>
					<Input id="name" defaultValue="My Project" />
				</div>
				<div className="grid gap-2">
					<Label htmlFor="desc">Description</Label>
					<Input id="desc" placeholder="Enter description" />
				</div>
			</div>
		</CollapsibleSection>
	),
};

export const OpenByDefault: Story = {
	args: {
		defaultOpen: true,
		title: "Advanced Settings",
		icon: <Settings className="h-4 w-4" />,
		accentColor: "violet",
	},
	render: (args) => (
		<CollapsibleSection {...args}>
			<div className="p-2 text-sm text-muted-foreground">
				Advanced configuration options appear here.
			</div>
		</CollapsibleSection>
	),
};
