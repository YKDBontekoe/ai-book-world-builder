import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Label } from "@/components/atoms/label";
import { Switch } from "@/components/atoms/switch";

const meta = {
	title: "Design System/Atoms/Switch",
	component: Switch,
	tags: ["autodocs"],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args: any) => {
		const airplaneModeId = React.useId();
		return (
			<div className="flex items-center space-x-2">
				<Switch {...args} id={airplaneModeId} />
				<Label htmlFor={airplaneModeId}>Airplane Mode</Label>
			</div>
		);
	},
};
