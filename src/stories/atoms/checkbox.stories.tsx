import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Checkbox } from "@/components/atoms/checkbox";
import { Label } from "@/components/atoms/label";

const meta = {
	title: "Design System/Atoms/Checkbox",
	component: Checkbox,
	tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args: any) => {
		const termsId = React.useId();
		return (
			<div className="flex items-center space-x-2">
				<Checkbox {...args} id={termsId} />
				<Label htmlFor={termsId}>Accept terms and conditions</Label>
			</div>
		);
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		checked: true,
	},
	render: (args: any) => (
		<div className="flex items-center space-x-2">
			<Checkbox {...args} />
			<Label className="text-muted-foreground">Disabled</Label>
		</div>
	),
};
