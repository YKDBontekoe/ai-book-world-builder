"use server";

import type { z } from "zod";
import { createAdminAction } from "@/lib/action-middleware";
import {
	getCached,
	invalidateCache,
	invalidateCachePattern,
} from "@/lib/cache";
import type {
	GitHubCheckStatus,
	GitHubPullRequestStatus,
	GitHubPullRequestSummary,
} from "@/lib/github-types";
import { getOctokit, getRepoDetails } from "@/lib/services/github-service";
import {
	issueNumberSchema,
	issueStateSchema,
	mergePRSchema,
	pullRequestByBranchSchema,
	pullRequestStatusSchema,
} from "./schemas";
import type { GitHubPR } from "./types";

function parseRepoFullName(repoFullName: string): {
	owner: string;
	repo: string;
} {
	const [owner, repo] = repoFullName.split("/");
	if (!owner || !repo) {
		throw new Error("Invalid repository identifier");
	}
	return { owner, repo };
}

/**
 * Get pull requests for the repository
 */
const getPullRequestsAction = createAdminAction({
	input: issueStateSchema,
	handler: async ({ input: state }) => {
		return getCached(
			`github:prs:${state}`,
			async () => {
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
			60,
		);
	},
});

export async function getPullRequests(
	input?: z.infer<typeof issueStateSchema>,
): ReturnType<typeof getPullRequestsAction> {
	return getPullRequestsAction(input);
}

/**
 * Get details for a specific pull request
 */
const getPullRequestDetailsAction = createAdminAction({
	input: issueNumberSchema,
	handler: async ({ input: number }) => {
		return getCached(
			`github:pr:${number}`,
			async () => {
				const octokit = getOctokit();
				const { owner, repo } = getRepoDetails();
				const { data } = await octokit.rest.pulls.get({
					owner,
					repo,
					pull_number: number,
				});
				return data as unknown as GitHubPR;
			},
			60,
		);
	},
});

export async function getPullRequestDetails(
	input: z.infer<typeof issueNumberSchema>,
): ReturnType<typeof getPullRequestDetailsAction> {
	return getPullRequestDetailsAction(input);
}

/**
 * Merge a pull request
 */
const mergePullRequestAction = createAdminAction({
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

		// Invalidate caches
		await Promise.all([
			invalidateCachePattern("github:issues:*"),
			invalidateCachePattern("github:prs:*"),
			invalidateCache(`github:pr:${number}`),
		]);
	},
});

export async function mergePullRequest(
	input: z.input<typeof mergePRSchema>,
): ReturnType<typeof mergePullRequestAction> {
	return mergePullRequestAction({
		number: input.number,
		method: input.method ?? "merge",
	});
}

const getGitHubPullRequestByBranchActionInternal = createAdminAction({
	input: pullRequestByBranchSchema,
	handler: async ({ input }): Promise<GitHubPullRequestSummary | null> => {
		// This action is used for checking existence, caching might be tricky if real-time status is needed.
		// However, for general existence check, short cache is fine.
		return getCached(
			`github:pr:branch:${input.repoFullName}:${input.head}:${input.base}`,
			async () => {
				const octokit = getOctokit();
				const { owner, repo } = parseRepoFullName(input.repoFullName);

				const { data } = await octokit.rest.pulls.list({
					owner,
					repo,
					head: `${owner}:${input.head}`,
					base: input.base,
					per_page: 1,
				});
				const prSummary = data[0];
				if (!prSummary) return null;

				// Fetch full details to get mergeable status
				const { data: pr } = await octokit.rest.pulls.get({
					owner,
					repo,
					pull_number: prSummary.number,
				});

				return {
					id: pr.id,
					number: pr.number,
					title: pr.title,
					url: pr.html_url,
					base: pr.base.ref,
					head: pr.head.ref,
					status: {
						state: "unknown",
						mergeable: pr.mergeable ?? null,
						hasConflicts: pr.mergeable_state === "dirty",
						checks: [],
						updatedAt: pr.updated_at ?? new Date().toISOString(),
					},
				};
			},
			30,
		); // 30s cache
	},
});

export async function getGitHubPullRequestByBranchAction(
	input: z.infer<typeof pullRequestByBranchSchema>,
): ReturnType<typeof getGitHubPullRequestByBranchActionInternal> {
	return getGitHubPullRequestByBranchActionInternal(input);
}

const getGitHubPullRequestStatusActionInternal = createAdminAction({
	input: pullRequestStatusSchema,
	handler: async ({ input }): Promise<GitHubPullRequestStatus> => {
		// Status checks update frequently, so keep cache short (10s)
		return getCached(
			`github:pr:status:${input.repoFullName}:${input.pullRequestNumber}`,
			async () => {
				const octokit = getOctokit();
				const { owner, repo } = parseRepoFullName(input.repoFullName);

				const { data: pr } = await octokit.rest.pulls.get({
					owner,
					repo,
					pull_number: input.pullRequestNumber,
				});
				const { data: checks } = await octokit.rest.checks.listForRef({
					owner,
					repo,
					ref: pr.head.sha,
				});

				const mappedChecks: GitHubCheckStatus[] = checks.check_runs.map(
					(run) => {
						let status: GitHubCheckStatus["status"] = "queued";
						if (run.status === "completed") status = "completed";
						else if (run.status === "in_progress") status = "in_progress";

						let conclusion: GitHubCheckStatus["conclusion"] = null;
						switch (run.conclusion) {
							case "success":
							case "failure":
							case "neutral":
							case "cancelled":
							case "skipped":
								conclusion = run.conclusion;
								break;
							case "timed_out":
							case "action_required":
								conclusion = "failure";
								break;
						}

						return {
							name: run.name,
							status,
							conclusion,
							detailsUrl: run.html_url ?? undefined,
						};
					},
				);

				const hasFailure = mappedChecks.some(
					(check) => check.conclusion && check.conclusion !== "success",
				);
				const isPending = mappedChecks.some(
					(check) =>
						check.status === "queued" || check.status === "in_progress",
				);

				let state: GitHubPullRequestStatus["state"] = "unknown";
				if (hasFailure) {
					state = "failure";
				} else if (isPending) {
					state = "pending";
				} else if (mappedChecks.length > 0) {
					state = "success";
				}

				return {
					state,
					mergeable: pr.mergeable ?? null,
					hasConflicts: pr.mergeable_state === "dirty",
					checks: mappedChecks,
					updatedAt: pr.updated_at ?? new Date().toISOString(),
				};
			},
			10,
		);
	},
});

export async function getGitHubPullRequestStatusAction(
	input: z.infer<typeof pullRequestStatusSchema>,
): ReturnType<typeof getGitHubPullRequestStatusActionInternal> {
	return getGitHubPullRequestStatusActionInternal(input);
}

const mergeGitHubPullRequestActionInternal = createAdminAction({
	input: pullRequestStatusSchema,
	handler: async ({ input }): Promise<void> => {
		const octokit = getOctokit();
		const { owner, repo } = parseRepoFullName(input.repoFullName);

		await octokit.rest.pulls.merge({
			owner,
			repo,
			pull_number: input.pullRequestNumber,
			merge_method: "merge",
		});

		// Invalidate relevant caches
		await Promise.all([
			invalidateCachePattern(`github:pr:status:${input.repoFullName}:*`),
			invalidateCachePattern(`github:pr:branch:${input.repoFullName}:*`),
			invalidateCachePattern("github:prs:*"),
			invalidateCachePattern("github:issues:*"),
			invalidateCache(`github:pr:${input.pullRequestNumber}`), // Also invalidate specific PR
		]);
	},
});

export async function mergeGitHubPullRequestAction(
	input: z.infer<typeof pullRequestStatusSchema>,
): ReturnType<typeof mergeGitHubPullRequestActionInternal> {
	return mergeGitHubPullRequestActionInternal(input);
}
