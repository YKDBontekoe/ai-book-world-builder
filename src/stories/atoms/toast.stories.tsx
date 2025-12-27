import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "sonner";
import { Button } from "@/components/atoms/button";
import { toast } from "@/components/atoms/toast";

const meta: Meta = {
	title: "Design System/Atoms/Toast",
	decorators: [
		(Story) => (
			<div>
				<Toaster />
				<Story />
			</div>
		),
	],
	parameters: {
		layout: "centered",
	},
};

export default meta;

export const Default: StoryObj = {
	render: () => (
		<div className="flex flex-col gap-4">
			<Button
				onClick={() =>
					toast({
						type: "success",
						description: "Operation successful!",
					})
				}
			>
				Show Success Toast
			</Button>
			<Button
				variant="destructive"
				onClick={() =>
					toast({
						type: "error",
						description: "Something went wrong.",
					})
				}
			>
				Show Error Toast
			</Button>
		</div>
	),
};

export const LongText: StoryObj = {
	render: () => (
		<Button
			onClick={() =>
				toast({
					type: "success",
					description:
						"This is a very long success message that should probably wrap to multiple lines if the container is small enough or the text is just too long for a single line.",
				})
			}
		>
			Show Long Toast
		</Button>
	),
};
