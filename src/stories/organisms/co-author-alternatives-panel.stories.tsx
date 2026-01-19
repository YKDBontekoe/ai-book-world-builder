import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
	type CoAuthorAlternative,
	CoAuthorAlternativesPanel,
} from "@/components/organisms/editor/co-author-alternatives-panel";

const alternatives: CoAuthorAlternative[] = [
	{
		id: "alt-1",
		intent: "Tighter pacing",
		tone: "Urgent",
		text: "The storm snapped across the harbor, dragging the crew into motion before they had time to think.",
	},
	{
		id: "alt-2",
		intent: "More sensory detail",
		tone: "Cinematic",
		text: "Salt spray lashed the deck as thunder rolled, the harbor lights smearing into neon streaks through the rain.",
	},
	{
		id: "alt-3",
		intent: "Voice-forward",
		tone: "Wry",
		text: "Of course the harbor chose that moment to erupt; the crew had barely finished their coffee.",
	},
];

const meta: Meta<typeof CoAuthorAlternativesPanel> = {
	title: "Organisms/Editor/CoAuthorAlternativesPanel",
	component: CoAuthorAlternativesPanel,
	args: {
		alternatives,
		isLoading: false,
		onApply: fn(),
		onDismiss: fn(),
		onRefresh: fn(),
	},
};

export default meta;

type Story = StoryObj<typeof CoAuthorAlternativesPanel>;

export const Default: Story = {};

export const Loading: Story = {
	args: {
		isLoading: true,
	},
};
