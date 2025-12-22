import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const meta = {
	title: "UI/Textarea",
	component: Textarea,
	tags: ["autodocs"],
	args: {
		placeholder: "Type your message here.",
	},
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLabel: Story = {
	render: (args: any) => {
		const messageId = React.useId();
		return (
			<div className="grid w-full gap-1.5">
				<Label htmlFor={messageId}>Your Message</Label>
				<Textarea {...args} id={messageId} />
			</div>
		);
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		placeholder: "Disabled textarea",
	},
};
