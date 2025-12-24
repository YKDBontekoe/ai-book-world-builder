import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Progress } from "@/components/atoms/progress";

const meta: Meta<typeof Progress> = {
	title: "UI/Progress",
	component: Progress,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<div className="w-[300px]">
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
	args: {
		value: 60,
	},
};

export const Indeterminate: Story = {
	render: () => {
		const [progress, setProgress] = React.useState(13);

		React.useEffect(() => {
			const timer = setTimeout(() => setProgress(66), 500);
			return () => clearTimeout(timer);
		}, []);

		return <Progress value={progress} className="w-[60%]" />;
	},
};
