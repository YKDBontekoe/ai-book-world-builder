import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import type { GitHubIssue } from "@/app/actions/github";
import { TaskCard } from "@/components/builder/task-card";

const meta: Meta<typeof TaskCard> = {
	title: "Builder/TaskCard",
	component: TaskCard,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		onSelect: fn(),
		onFix: fn(),
	},
};

export default meta;
type Story = StoryObj<typeof TaskCard>;

const baseIssue: GitHubIssue = {
	number: 123,
	title: "Fix the broken button alignment in the header",
	user: { login: "jules-agent", avatar_url: "https://github.com/shadcn.png" },
	created_at: "2023-10-25T12:00:00Z",
	updated_at: "2023-10-25T12:00:00Z",
	state: "open",
	html_url: "#",
	body: "Description",
	comments: 0,
};

export const Issue: Story = {
	args: {
		item: {
			type: "issue",
			data: baseIssue,
		},
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const fixButton = canvas.getByRole("button", { name: /fix/i });
		await userEvent.click(fixButton);
		expect(args.onFix).toHaveBeenCalled();
	},
};

export const IssueClosed: Story = {
	args: {
		item: {
			type: "issue",
			data: {
				...baseIssue,
				state: "closed",
				title: "Feature: Add dark mode toggle (Completed)",
			},
		},
	},
};

export const PullRequest: Story = {
	args: {
		item: {
			type: "pr",
			data: {
				...baseIssue,
				merged_at: null,
				head: { ref: "feature/dark-mode", sha: "123" },
				base: { ref: "main" },
				title: "feat: add dark mode toggle",
			},
		},
	},
};

export const Session: Story = {
	args: {
		item: {
			type: "session",
			data: {
				id: "session-123",
				title: "Brainstorming new features",
				state: "IN_PROGRESS",
				prompt: "Help me design a new feature",
				createTime: "2023-10-25T12:00:00Z",
				updateTime: "2023-10-25T12:00:00Z",
				messages: [],
			},
		},
	},
};
