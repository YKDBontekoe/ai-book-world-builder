import type { Meta, StoryObj } from "@storybook/react";
import { JulesPullRequestCard } from "./jules-pr-card";

const meta = {
	title: "Admin/Jules/PullRequestCard",
	component: JulesPullRequestCard,
} satisfies Meta<typeof JulesPullRequestCard>;

export default meta;

type Story = StoryObj<typeof JulesPullRequestCard>;

export const Default: Story = {
	args: {
		repoFullName: "YKDBontekoe/ai-book-world-builder",
		baseBranch: "main",
		headBranch: "jules/session-123",
		canMerge: true,
		isMerging: false,
		onMerge: () => {},
		onAskFollowUp: () => {},
		pullRequest: {
			id: "pr-99",
			number: 99,
			title: "Improve onboarding flow",
			url: "https://github.com/YKDBontekoe/ai-book-world-builder/pull/99",
			base: "main",
			head: "jules/session-123",
			status: {
				state: "success",
				mergeable: true,
				hasConflicts: false,
				updatedAt: new Date().toISOString(),
				checks: [
					{
						name: "CI",
						status: "completed",
						conclusion: "success",
						detailsUrl: "https://github.com",
					},
					{
						name: "Lint",
						status: "completed",
						conclusion: "success",
						detailsUrl: "https://github.com",
					},
				],
			},
		},
	},
};
