"use server";

import type { z } from "zod";
import { createAdminAction } from "@/lib/action-middleware";
import {
	getCached,
	invalidateCache,
	invalidateCachePattern,
} from "@/lib/cache";
import { getOctokit, getRepoDetails } from "@/lib/services/github-service";
import {
	executeFeaturePlanSchema,
	issueNumberSchema,
	issueStateSchema,
	postCommentSchema,
} from "./schemas";
import type { GitHubComment, GitHubIssue } from "./types";

/**
 * Get issues for the repository
 */
const getIssuesAction = createAdminAction({
	input: issueStateSchema,
	handler: async ({ input: state }) => {
		return getCached(
			`github:issues:${state}`,
			async () => {
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
				return data.filter((item) => !item.pull_request) as GitHubIssue[];
			},
			60,
		);
	},
});

export async function getIssues(
	input?: z.infer<typeof issueStateSchema>,
): ReturnType<typeof getIssuesAction> {
	return getIssuesAction(input);
}

/**
 * Get details for a specific issue
 */
const getIssueDetailsAction = createAdminAction({
	input: issueNumberSchema,
	handler: async ({ input: number }) => {
		return getCached(
			`github:issue:${number}`,
			async () => {
				const octokit = getOctokit();
				const { owner, repo } = getRepoDetails();
				const { data } = await octokit.rest.issues.get({
					owner,
					repo,
					issue_number: number,
				});
				return data as GitHubIssue;
			},
			60,
		);
	},
});

export async function getIssueDetails(
	input: z.infer<typeof issueNumberSchema>,
): ReturnType<typeof getIssueDetailsAction> {
	return getIssueDetailsAction(input);
}

/**
 * Get comments for an issue or pull request
 */
const getCommentsAction = createAdminAction({
	input: issueNumberSchema,
	handler: async ({ input: number }) => {
		return getCached(
			`github:comments:${number}`,
			async () => {
				const octokit = getOctokit();
				const { owner, repo } = getRepoDetails();
				const { data } = await octokit.rest.issues.listComments({
					owner,
					repo,
					issue_number: number,
				});
				return data as GitHubComment[];
			},
			60,
		);
	},
});

export async function getComments(
	input: z.infer<typeof issueNumberSchema>,
): ReturnType<typeof getCommentsAction> {
	return getCommentsAction(input);
}

/**
 * Post a comment on an issue or pull request
 */
const postCommentAction = createAdminAction({
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

		// Invalidate caches
		await Promise.all([
			invalidateCachePattern("github:issues:*"),
			invalidateCachePattern("github:prs:*"),
			invalidateCache(`github:issue:${number}`),
			invalidateCache(`github:comments:${number}`),
		]);

		return data as GitHubComment;
	},
});

export async function postComment(
	input: z.infer<typeof postCommentSchema>,
): ReturnType<typeof postCommentAction> {
	return postCommentAction(input);
}

/**
 * Close an issue or pull request
 */
const closeIssueOrPRAction = createAdminAction({
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

		// Invalidate caches
		await Promise.all([
			invalidateCachePattern("github:issues:*"),
			invalidateCachePattern("github:prs:*"),
			invalidateCache(`github:issue:${number}`),
		]);
	},
});

export async function closeIssueOrPR(
	input: z.infer<typeof issueNumberSchema>,
): ReturnType<typeof closeIssueOrPRAction> {
	return closeIssueOrPRAction(input);
}

/**
 * Executes a feature plan by creating a parent issue and child task issues.
 */
const executeFeaturePlanActionInternal = createAdminAction({
	input: executeFeaturePlanSchema,
	handler: async ({ input }) => {
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();

		// 1. Create Parent Issue
		const parentRes = await octokit.rest.issues.create({
			owner,
			repo,
			title: input.parentIssue.title,
			body: input.parentIssue.body,
			labels: input.parentIssue.labels,
		});

		const parentNumber = parentRes.data.number;
		const createdIssues: number[] = [parentNumber];

		// 2. Create Child Issues
		for (const child of input.childIssues) {
			const childRes = await octokit.rest.issues.create({
				owner,
				repo,
				title: child.title,
				body: `${child.body}\n\nRelated to #${parentNumber}`,
				labels: child.labels,
			});
			createdIssues.push(childRes.data.number);
		}

		// 3. Update Parent with checklist of children
		const checklist = createdIssues
			.slice(1)
			.map((num) => `- [ ] #${num}`)
			.join("\n");
		await octokit.rest.issues.update({
			owner,
			repo,
			issue_number: parentNumber,
			body: `${input.parentIssue.body}\n\n### Tasks\n${checklist}`,
		});

		// Invalidate caches
		await invalidateCachePattern("github:issues:*");

		return { parentNumber, createdIssues };
	},
});

export async function executeFeaturePlanAction(
	input: z.infer<typeof executeFeaturePlanSchema>,
): ReturnType<typeof executeFeaturePlanActionInternal> {
	return executeFeaturePlanActionInternal(input);
}
