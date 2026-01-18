import type { Meta, StoryObj } from "@storybook/react";
import { JulesSessionSetup } from "./jules-session-setup";

const meta = {
	title: "Admin/Jules/SessionSetup",
	component: JulesSessionSetup,
} satisfies Meta<typeof JulesSessionSetup>;

export default meta;

type Story = StoryObj<typeof JulesSessionSetup>;

export const Default: Story = {
	args: {
		onSessionCreated: () => {},
		presetData: {
			repositories: [
				{
					id: 1,
					name: "ai-book-world-builder",
					fullName: "YKDBontekoe/ai-book-world-builder",
					owner: "YKDBontekoe",
					defaultBranch: "main",
					private: true,
					permissions: { admin: true, push: true, pull: true },
				},
			],
			branches: [
				{ name: "main", protected: true },
				{ name: "release", protected: false },
			],
			sources: [
				{
					name: "sources/123",
					id: "123",
					githubRepo: {
						owner: "YKDBontekoe",
						repo: "ai-book-world-builder",
						isPrivate: true,
						defaultBranch: { displayName: "main" },
						branches: [{ displayName: "main" }, { displayName: "release" }],
					},
				},
			],
		},
	},
};
