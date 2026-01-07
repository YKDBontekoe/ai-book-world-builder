"use server";

import { Octokit } from "octokit";
import { z } from "zod";
import { createAdminAction } from "@/lib/action-middleware";

// ============================================================================
// Types & Initialization
// ============================================================================

// Initialize Octokit with the token from environment
const getOctokit = () => {
	const token = process.env.GITHUB_TOKEN;
	if (!token) {
		throw new Error("GITHUB_TOKEN is not set in environment variables");
	}
	return new Octokit({ auth: token });
};

const getRepoDetails = () => {
	const owner = process.env.GITHUB_OWNER || "YKDBontekoe";
	const repo = process.env.GITHUB_REPO || "ai-book-world-builder";
	return { owner, repo };
};

export type GitHubIssue = {
	number: number;
	title: string;
	body: string | null;
	state: string;
	user: {
		login: string;
		avatar_url: string;
	} | null;
	created_at: string;
	updated_at: string;
	html_url: string;
	comments: number;
	pull_request?: object;
};

export type GitHubPR = GitHubIssue & {
	merged_at: string | null;
	head: {
		ref: string;
		sha: string;
	};
	base: {
		ref: string;
	};
};

export type GitHubComment = {
	id: number;
	body: string | undefined;
	user: {
		login: string;
		avatar_url: string;
	} | null;
	created_at: string;
	html_url: string;
};

// ============================================================================
// Validation Schemas
// ============================================================================

const issueStateSchema = z.enum(["open", "closed", "all"]).default("open");
const issueNumberSchema = z.number();
const postCommentSchema = z.object({
	number: z.number(),
	body: z.string().min(1),
});
const mergePRSchema = z.object({
	number: z.number(),
	method: z.enum(["merge", "squash", "rebase"]).default("merge"),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get repository statistics
 */
export const getRepoStats = createAdminAction({
	handler: async () => {
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		const { data } = await octokit.rest.repos.get({
			owner,
			repo,
		});

		return {
			stars: data.stargazers_count,
			forks: data.forks_count,
			openIssues: data.open_issues_count,
		};
	},
});

/**
 * Get issues for the repository
 */
export const getIssues = createAdminAction({
	input: issueStateSchema,
	handler: async ({ input: state }) => {
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		const { data } = await octokit.rest.issues.listForRepo({
			owner,
			repo,
			state,
			sort: "updated",
			direction: "desc",
			per_page: 100,
		});

		return data.filter((item: any) => !item.pull_request) as GitHubIssue[];
	},
});

/**
 * Get pull requests for the repository
 */
export const getPullRequests = createAdminAction({
	input: issueStateSchema,
	handler: async ({ input: state }) => {
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		const { data } = await octokit.rest.pulls.list({
			owner,
			repo,
			state,
			sort: "updated",
			direction: "desc",
			per_page: 100,
		});

		return data as unknown as GitHubPR[];
	},
});

/**
 * Get details for a specific issue
 */
export const getIssueDetails = createAdminAction({
	input: issueNumberSchema,
	handler: async ({ input: number }) => {
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		const { data } = await octokit.rest.issues.get({
			owner,
			repo,
			issue_number: number,
		});
		return data as GitHubIssue;
	},
});

/**
 * Get details for a specific pull request
 */
export const getPullRequestDetails = createAdminAction({
	input: issueNumberSchema,
	handler: async ({ input: number }) => {
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		const { data } = await octokit.rest.pulls.get({
			owner,
			repo,
			pull_number: number,
		});
		return data as unknown as GitHubPR;
	},
});

/**
 * Get comments for an issue or pull request
 */
export const getComments = createAdminAction({
	input: issueNumberSchema,
	handler: async ({ input: number }) => {
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		const { data } = await octokit.rest.issues.listComments({
			owner,
			repo,
			issue_number: number,
		});

		return data as GitHubComment[];
	},
});

/**
 * Post a comment on an issue or pull request
 */
export const postComment = createAdminAction({
	input: postCommentSchema,
	handler: async ({ input: { number, body } }) => {
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		const { data } = await octokit.rest.issues.createComment({
			owner,
			repo,
			issue_number: number,
			body,
		});
		return data as GitHubComment;
	},
});

/**
 * Close an issue or pull request
 */
export const closeIssueOrPR = createAdminAction({
	input: issueNumberSchema,
	handler: async ({ input: number }) => {
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		await octokit.rest.issues.update({
			owner,
			repo,
			issue_number: number,
			state: "closed",
		});
	},
});

/**
 * Merge a pull request
 */
export const mergePullRequest = createAdminAction({
	input: mergePRSchema,
	handler: async ({ input: { number, method } }) => {
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		await octokit.rest.pulls.merge({
			owner,
			repo,
			pull_number: number,
			merge_method: method,
		});
	},
});
