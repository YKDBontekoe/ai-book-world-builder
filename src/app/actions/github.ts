"use server";

import { Octokit } from "octokit";
import { z } from "zod";
import { createAdminAction } from "@/lib/action-middleware";
import type {
	GitHubBranch,
	GitHubCheckStatus,
	GitHubPullRequestStatus,
	GitHubPullRequestSummary,
	GitHubRepository,
} from "@/lib/github-types";

// ============================================================================
// Types & Initialization
// ============================================================================

const getOctokit = (): Octokit => {
	const token = process.env.GITHUB_TOKEN;
	if (!token) {
		throw new Error("GITHUB_TOKEN is not set in environment variables");
	}
	return new Octokit({ auth: token });
};

const getRepoDetails = (): {
	fullName: string;
	owner: string;
	repo: string;
} => {
	const owner = process.env.GITHUB_OWNER || "YKDBontekoe";
	const repo = process.env.GITHUB_REPO || "ai-book-world-builder";
	return { fullName: `${owner}/${repo}`, owner, repo };
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

const _repoFullNameSchema = z.object({
	repoFullName: z.string().min(1, "Repository is required"),
});

const repoBranchSchema = z.object({
	repoFullName: z.string().min(1, "Repository is required"),
});

const pullRequestByBranchSchema = z.object({
	repoFullName: z.string().min(1, "Repository is required"),
	base: z.string().min(1, "Base branch is required"),
	head: z.string().min(1, "Head branch is required"),
});

const pullRequestStatusSchema = z.object({
	repoFullName: z.string().min(1, "Repository is required"),
	pullRequestNumber: z.number().int().positive(),
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
const getRepoStatsAction = createAdminAction({
	handler: async () => {
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		const { data } = await octokit.rest.repos.get({ owner, repo });
		return {
			stars: data.stargazers_count,
			forks: data.forks_count,
			openIssues: data.open_issues_count,
		};
	},
});

export async function getRepoStats(): ReturnType<typeof getRepoStatsAction> {
	return getRepoStatsAction();
}

/**
 * Get issues for the repository
 */
const getIssuesAction = createAdminAction({
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
		return data.filter((item) => !item.pull_request) as GitHubIssue[];
	},
});

export async function getIssues(
	input?: z.infer<typeof issueStateSchema>,
): ReturnType<typeof getIssuesAction> {
	return getIssuesAction(input);
}

/**
 * Get pull requests for the repository
 */
const getPullRequestsAction = createAdminAction({
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

export async function getPullRequests(
	input?: z.infer<typeof issueStateSchema>,
): ReturnType<typeof getPullRequestsAction> {
	return getPullRequestsAction(input);
}

/**
 * Get details for a specific issue
 */
const getIssueDetailsAction = createAdminAction({
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

export async function getIssueDetails(
	input?: z.infer<typeof issueNumberSchema>,
): ReturnType<typeof getIssueDetailsAction> {
	return getIssueDetailsAction(input);
}

/**
 * Get details for a specific pull request
 */
const getPullRequestDetailsAction = createAdminAction({
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

export async function getPullRequestDetails(
	input?: z.infer<typeof issueNumberSchema>,
): ReturnType<typeof getPullRequestDetailsAction> {
	return getPullRequestDetailsAction(input);
}

/**
 * Get comments for an issue or pull request
 */
const getCommentsAction = createAdminAction({
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

export async function getComments(
	input?: z.infer<typeof issueNumberSchema>,
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
		return data as GitHubComment;
	},
});

export async function postComment(
	input?: z.infer<typeof postCommentSchema>,
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
	},
});

export async function closeIssueOrPR(
	input?: z.infer<typeof issueNumberSchema>,
): ReturnType<typeof closeIssueOrPRAction> {
	return closeIssueOrPRAction(input);
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
	},
});

export async function mergePullRequest(
	input?: z.infer<typeof mergePRSchema>,
): ReturnType<typeof mergePullRequestAction> {
	return mergePullRequestAction(input);
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

		return { parentNumber, createdIssues };
	},
});

export async function executeFeaturePlanAction(
	input?: z.infer<typeof executeFeaturePlanSchema>,
): ReturnType<typeof executeFeaturePlanActionInternal> {
	return executeFeaturePlanActionInternal(input);
}

const listGitHubRepositoriesActionInternal = createAdminAction({
	handler: async (): Promise<GitHubRepository[]> => {
		const octokit = getOctokit();
		const { data } = await octokit.rest.repos.listForAuthenticatedUser({
			per_page: 100,
			sort: "updated",
		});
		return data.map((repo) => ({
			id: repo.id,
			name: repo.name,
			fullName: repo.full_name,
			owner: repo.owner?.login ?? "",
			defaultBranch: repo.default_branch ?? "main",
			private: repo.private ?? false,
			permissions: repo.permissions
				? {
						admin: repo.permissions.admin ?? false,
						push: repo.permissions.push ?? false,
						pull: repo.permissions.pull ?? false,
					}
				: undefined,
		}));
	},
});

export async function listGitHubRepositoriesAction(): ReturnType<
	typeof listGitHubRepositoriesActionInternal
> {
	return listGitHubRepositoriesActionInternal();
}

const listGitHubBranchesActionInternal = createAdminAction({
	input: repoBranchSchema,
	handler: async ({ input }): Promise<GitHubBranch[]> => {
		const octokit = getOctokit();
		const [owner, repo] = input.repoFullName.split("/");
		if (!owner || !repo) {
			throw new Error("Invalid repository identifier");
		}
		const { data } = await octokit.rest.repos.listBranches({
			owner,
			repo,
			per_page: 100,
		});
		return data.map((branch) => ({
			name: branch.name,
			protected: branch.protected,
		}));
	},
});

export async function listGitHubBranchesAction(
	input?: z.infer<typeof repoBranchSchema>,
): ReturnType<typeof listGitHubBranchesActionInternal> {
	return listGitHubBranchesActionInternal(input);
}

const getGitHubPullRequestByBranchActionInternal = createAdminAction({
	input: pullRequestByBranchSchema,
	handler: async ({ input }): Promise<GitHubPullRequestSummary | null> => {
		const octokit = getOctokit();
		const [owner, repo] = input.repoFullName.split("/");
		if (!owner || !repo) {
			throw new Error("Invalid repository identifier");
		}
		const { data } = await octokit.rest.pulls.list({
			owner,
			repo,
			head: `${owner}:${input.head}`,
			base: input.base,
			per_page: 1,
		});
		const pr = data[0];
		if (!pr) return null;
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
});

export async function getGitHubPullRequestByBranchAction(
	input?: z.infer<typeof pullRequestByBranchSchema>,
): ReturnType<typeof getGitHubPullRequestByBranchActionInternal> {
	return getGitHubPullRequestByBranchActionInternal(input);
}

const getGitHubPullRequestStatusActionInternal = createAdminAction({
	input: pullRequestStatusSchema,
	handler: async ({ input }): Promise<GitHubPullRequestStatus> => {
		const octokit = getOctokit();
		const [owner, repo] = input.repoFullName.split("/");
		if (!owner || !repo) {
			throw new Error("Invalid repository identifier");
		}
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

		const mappedChecks: GitHubCheckStatus[] = checks.check_runs.map((run) => ({
			name: run.name,
			status: run.status,
			conclusion: run.conclusion,
			detailsUrl: run.html_url,
		}));

		const hasFailure = mappedChecks.some(
			(check) => check.conclusion && check.conclusion !== "success",
		);
		const isPending = mappedChecks.some(
			(check) => check.status === "queued" || check.status === "in_progress",
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
});

export async function getGitHubPullRequestStatusAction(
	input?: z.infer<typeof pullRequestStatusSchema>,
): ReturnType<typeof getGitHubPullRequestStatusActionInternal> {
	return getGitHubPullRequestStatusActionInternal(input);
}

const mergeGitHubPullRequestActionInternal = createAdminAction({
	input: pullRequestStatusSchema,
	handler: async ({ input }): Promise<void> => {
		const octokit = getOctokit();
		const [owner, repo] = input.repoFullName.split("/");
		if (!owner || !repo) {
			throw new Error("Invalid repository identifier");
		}
		await octokit.rest.pulls.merge({
			owner,
			repo,
			pull_number: input.pullRequestNumber,
			merge_method: "merge",
		});
	},
});

export async function mergeGitHubPullRequestAction(
	input?: z.infer<typeof pullRequestStatusSchema>,
): ReturnType<typeof mergeGitHubPullRequestActionInternal> {
	return mergeGitHubPullRequestActionInternal(input);
}
