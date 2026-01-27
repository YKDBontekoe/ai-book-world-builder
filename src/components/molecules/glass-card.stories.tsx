import type { Meta, StoryObj } from "@storybook/react";
import { GlassCard } from "./glass-card";

const meta = {
	title: "Molecules/GlassCard",
	component: GlassCard,
	parameters: {
		layout: "centered",
		backgrounds: {
			default: "dark",
			values: [
				{ name: "light", value: "#f0f0f0" },
				{ name: "dark", value: "#1a1a1a" },
			],
		},
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "interactive", "subtle", "liquid"],
		},
		size: {
			control: "select",
			options: ["default", "sm", "lg", "none"],
		},
		gradient: {
			control: "boolean",
		},
		interactive: {
			control: "boolean",
		},
	},
} satisfies Meta<typeof GlassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: (
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Glass Card</h3>
				<p className="text-sm text-muted-foreground">
					This is a glass card component with translucent background.
				</p>
			</div>
		),
		variant: "default",
	},
};

export const Interactive: Story = {
	args: {
		...Default.args,
		variant: "interactive",
		interactive: true,
	},
};

export const Subtle: Story = {
	args: {
		...Default.args,
		variant: "subtle",
	},
};

export const Liquid: Story = {
	args: {
		...Default.args,
		variant: "liquid",
	},
};

export const WithGradient: Story = {
	args: {
		...Default.args,
		gradient: true,
	},
};
