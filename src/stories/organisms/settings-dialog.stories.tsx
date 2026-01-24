import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/button";
import { SettingsDialog } from "@/components/organisms/settings-dialog";
import { AppearanceProvider } from "@/components/providers/appearance-provider";

const meta: Meta<typeof SettingsDialog> = {
	title: "Organisms/SettingsDialog",
	component: SettingsDialog,
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => {
			const queryClient = useMemo(() => new QueryClient(), []);
			return (
				<QueryClientProvider client={queryClient}>
					<AppearanceProvider>
						<Story />
					</AppearanceProvider>
				</QueryClientProvider>
			);
		},
	],
};

export default meta;

type Story = StoryObj<typeof SettingsDialog>;

export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setOpen(true)}>Open Settings</Button>
				<SettingsDialog open={open} onOpenChange={setOpen} />
			</>
		);
	},
};
