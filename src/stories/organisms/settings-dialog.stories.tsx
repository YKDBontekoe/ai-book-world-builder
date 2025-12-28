import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { SettingsDialog } from "@/components/organisms/settings-dialog";

// Mock dependencies
const _availableModels = [
	{ id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
	{ id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic" },
	{ id: "gemini-pro", name: "Gemini Pro", provider: "Google" },
];

const _modelPreferences = {
	light: "gemini-pro",
	middle: "gpt-4",
	large: "claude-3-opus",
};

// We need to mock the server actions since SettingsDialog uses them directly
// In a real setup, we might use MSW or mock the modules globally.
// For this story, we'll assume the component can render without crashing if we don't strictly mock them,
// OR we rely on the fact that server actions fail gracefully in Storybook (often just network errors).
// However, since they are imported from @/app/actions/..., mocking them in Storybook requires
// webpack/vite aliasing or jest.mock equivalent.
//
// A better approach for visual testing is to make the component "dumb" or use a wrapper.
// But `SettingsDialog` has built-in data fetching `useEffect`.
// To make it work in Storybook, we might need to intercept the network or ignore the errors.

const meta = {
	title: "Design System/Organisms/SettingsDialog",
	component: SettingsDialog,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
	argTypes: {
		open: { control: "boolean" },
		onOpenChange: { action: "onOpenChange" },
	},
	args: {
		open: true,
		onOpenChange: (open: boolean) => console.log("onOpenChange", open),
	},
} satisfies Meta<typeof SettingsDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		open: true,
		onOpenChange: (open: boolean) => console.log("onOpenChange", open),
	},
};

export const InteractionTest: Story = {
	args: {
		open: true,
		onOpenChange: (open: boolean) => console.log("onOpenChange", open),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Check if Account tab is active by default
		await expect(canvas.getByText("Connected Accounts")).toBeVisible();

		// Click on Models tab
		const modelsTab = canvas.getByText("AI Models");
		await userEvent.click(modelsTab);

		// Check if Model Configuration is visible
		await expect(canvas.getByText("Model Configuration")).toBeVisible();

		// Verify light/middle/large sections exist
		await expect(canvas.getByText("Light Model")).toBeVisible();
		await expect(canvas.getByText("Middle Model")).toBeVisible();
		await expect(canvas.getByText("Large Model")).toBeVisible();
	},
};
