"use server";

import { z } from "zod";
import { createAdminAction } from "@/lib/action-middleware";
import {
	OctogitClient,
	type OctogitComment,
	type OctogitIssue,
	type OctogitPullRequest,
	type OctogitRepoStats,
} from "@/lib/octogit-client";

// ============================================================================
// Types & Initialization
// ============================================================================

const getRepoDetails = (): { fullName: string } => {
	const owner = process.env.GITHUB_OWNER || "YKDBontekoe";
	const repo = process.env.GITHUB_REPO || "ai-book-world-builder";
	return { fullName: `${owner}/${repo}` };
};

const octogit = new OctogitClient();

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
const executeFeaturePlanSchema = z.object({
	parentIssue: z.object({
		title: z.string(),
		body: z.string(),
		labels: z.array(z.string()).optional(),
	}),
	childIssues: z.array(
		z.object({
			title: z.string(),
			body: z.string(),
			labels: z.array(z.string()).optional(),
		}),
	),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get repository statistics
 */
export const getRepoStats = createAdminAction({
	handler: async () => {
		const { fullName } = getRepoDetails();
		const data: OctogitRepoStats = await octogit.getRepoStats(fullName);
		return data;
	},
});

/**
 * Get issues for the repository
 */
export const getIssues = createAdminAction({
	input: issueStateSchema,
	handler: async ({ input: state }) => {
		const { fullName } = getRepoDetails();
		const data: OctogitIssue[] = await octogit.listIssues({
			repoFullName: fullName,
			state,
		});
		return data.filter((item) => !item.pull_request) as GitHubIssue[];
	},
});

/**
 * Get pull requests for the repository
 */
export const getPullRequests = createAdminAction({
	input: issueStateSchema,
	handler: async ({ input: state }) => {
		const { fullName } = getRepoDetails();
		const data: OctogitPullRequest[] = await octogit.listPullRequests({
			repoFullName: fullName,
			state,
		});
		return data as GitHubPR[];
	},
});

/**
 * Get details for a specific issue
 */
export const getIssueDetails = createAdminAction({
	input: issueNumberSchema,
	handler: async ({ input: number }) => {
		const { fullName } = getRepoDetails();
		const data: OctogitIssue = await octogit.getIssue({
			repoFullName: fullName,
			issueNumber: number,
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
		const { fullName } = getRepoDetails();
		const data: OctogitPullRequest = await octogit.getPullRequest({
			repoFullName: fullName,
			pullRequestNumber: number,
		});
		return data as GitHubPR;
	},
});

/**
 * Get comments for an issue or pull request
 */
export const getComments = createAdminAction({
	input: issueNumberSchema,
	handler: async ({ input: number }) => {
		const { fullName } = getRepoDetails();
		const data: OctogitComment[] = await octogit.listComments({
			repoFullName: fullName,
			issueNumber: number,
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
		const { fullName } = getRepoDetails();
		const data: OctogitComment = await octogit.createComment({
			repoFullName: fullName,
			issueNumber: number,
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
		const { fullName } = getRepoDetails();
		await octogit.updateIssue({
			repoFullName: fullName,
			issueNumber: number,
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
		const { fullName } = getRepoDetails();
		await octogit.mergePullRequestWithMethod({
			repoFullName: fullName,
			pullRequestNumber: number,
			method,
		});
	},
});

/**
 * Executes a feature plan by creating a parent issue and child task issues.
 */
export const executeFeaturePlanAction = createAdminAction({
	input: executeFeaturePlanSchema,
	handler: async ({ input }) => {
		const { fullName } = getRepoDetails();

		// 1. Create Parent Issue
		const parentRes = await octogit.createIssue({
			repoFullName: fullName,
			title: input.parentIssue.title,
			body: input.parentIssue.body,
			labels: input.parentIssue.labels,
		});

		const parentNumber = parentRes.number;
		const createdIssues: number[] = [parentNumber];

		// 2. Create Child Issues
		for (const child of input.childIssues) {
			const childRes = await octogit.createIssue({
				repoFullName: fullName,
				title: child.title,
				body: `${child.body}\n\nRelated to #${parentNumber}`,
				labels: child.labels,
			});
			createdIssues.push(childRes.number);
		}

		// 3. Update Parent with checklist of children
		const checklist = createdIssues
			.slice(1)
			.map((num) => `- [ ] #${num}`)
			.join("\n");
		await octogit.updateIssue({
			repoFullName: fullName,
			issueNumber: parentNumber,
			body: `${input.parentIssue.body}\n\n### Tasks\n${checklist}`,
		});

		return { parentNumber, createdIssues };
	},
});
