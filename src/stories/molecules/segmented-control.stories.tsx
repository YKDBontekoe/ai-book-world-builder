import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { SegmentedControl } from "@/components/molecules/segmented-control";

const meta: Meta<typeof SegmentedControl> = {
	title: "Molecules/SegmentedControl",
	component: SegmentedControl,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: { type: "select" },
			options: ["sm", "md"],
		},
	},
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

const options = [
	{ id: "daily", label: "Daily" },
	{ id: "weekly", label: "Weekly" },
	{ id: "monthly", label: "Monthly" },
	{ id: "yearly", label: "Yearly" },
];

export const Default: Story = {
	render: (args) => {
		const [value, setValue] = useState("daily");
		return (
			<SegmentedControl
				{...args}
				options={options}
				value={value}
				onChange={setValue}
			/>
		);
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const weeklyButton = canvas.getByRole("button", { name: "Weekly" });
		await userEvent.click(weeklyButton);
		const weeklyButtonAfter = canvas.getByRole("button", { name: "Weekly" });
		await expect(weeklyButtonAfter).toHaveAttribute("aria-pressed", "true");
	},
};

export const Medium: Story = {
	render: (args) => {
		const [value, setValue] = useState("daily");
		return (
			<SegmentedControl
				{...args}
				size="md"
				options={options}
				value={value}
				onChange={setValue}
			/>
		);
	},
};

export const TwoOptions: Story = {
	render: (args) => {
		const [value, setValue] = useState("login");
		return (
			<SegmentedControl
				{...args}
				options={[
					{ id: "login", label: "Login" },
					{ id: "register", label: "Register" },
				]}
				value={value}
				onChange={setValue}
			/>
		);
	},
};
