import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
	title: "UI/Input",
	component: Input,
	tags: ["autodocs"],
	argTypes: {
		type: {
			control: "select",
			options: ["text", "password", "email", "number", "date"],
		},
		disabled: {
			control: "boolean",
		},
	},
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		placeholder: "Type here...",
	},
};

export const WithLabel: Story = {
	render: (args: any) => {
		const emailId = React.useId();
		return (
			<div className="grid w-full max-w-sm items-center gap-1.5">
				<Label htmlFor={emailId}>Email</Label>
				<Input {...args} type="email" id={emailId} placeholder="Email" />
			</div>
		);
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		placeholder: "Disabled input",
	},
};

export const File: Story = {
	args: {
		type: "file",
	},
};
