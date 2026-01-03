"use server";

import { Octokit } from "octokit";
import { auth } from "@/app/(auth)/auth";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import type { Result } from "@/lib/result";

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

// Helper to ensure the user is an admin
async function requireAdmin() {
	const session = await auth();

	if (!session?.user) {
		throw new UnauthorizedError("You must be logged in to perform this action");
	}

	if (session.user.role !== "admin") {
		throw new ForbiddenError("You do not have permission to perform this action");
	}
}

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

export async function getRepoStats(): Promise<
	Result<{ stars: number; forks: number; openIssues: number }>
> {
	try {
		await requireAdmin();
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		const { data } = await octokit.rest.repos.get({
			owner,
			repo,
		});

		return {
			success: true,
			data: {
				stars: data.stargazers_count,
				forks: data.forks_count,
				openIssues: data.open_issues_count,
			},
		};
	} catch (error) {
		console.error("Failed to fetch repo stats:", error);
		if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to fetch repository statistics" };
	}
}

export async function getIssues(
	state: "open" | "closed" | "all" = "open",
): Promise<Result<GitHubIssue[]>> {
	try {
		await requireAdmin();
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		// The issues endpoint returns both issues and PRs.
		// We filter out PRs to get only issues.
		const { data } = await octokit.rest.issues.listForRepo({
			owner,
			repo,
			state,
			sort: "updated",
			direction: "desc",
			per_page: 100,
		});

		const issues = data.filter((item) => !item.pull_request) as GitHubIssue[];
		return { success: true, data: issues };
	} catch (error) {
		console.error("Failed to fetch issues:", error);
		if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to fetch issues" };
	}
}

export async function getPullRequests(
	state: "open" | "closed" | "all" = "open",
): Promise<Result<GitHubPR[]>> {
	try {
		await requireAdmin();
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

		return { success: true, data: data as unknown as GitHubPR[] };
	} catch (error) {
		console.error("Failed to fetch pull requests:", error);
		if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to fetch pull requests" };
	}
}

export async function getIssueDetails(
	number: number,
): Promise<Result<GitHubIssue>> {
	try {
		await requireAdmin();
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		const { data } = await octokit.rest.issues.get({
			owner,
			repo,
			issue_number: number,
		});
		return { success: true, data: data as GitHubIssue };
	} catch (error) {
		console.error(`Failed to fetch issue #${number}:`, error);
		if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to fetch issue details" };
	}
}

export async function getPullRequestDetails(
	number: number,
): Promise<Result<GitHubPR>> {
	try {
		await requireAdmin();
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		const { data } = await octokit.rest.pulls.get({
			owner,
			repo,
			pull_number: number,
		});
		return { success: true, data: data as unknown as GitHubPR };
	} catch (error) {
		console.error(`Failed to fetch PR #${number}:`, error);
		if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to fetch pull request details" };
	}
}

export async function getComments(
	number: number,
): Promise<Result<GitHubComment[]>> {
	try {
		await requireAdmin();
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		// For PRs, we might want review comments too, but starting with issue comments
		// (which appear on both PRs and Issues) is a safe baseline.
		const { data } = await octokit.rest.issues.listComments({
			owner,
			repo,
			issue_number: number,
		});

		return { success: true, data: data as GitHubComment[] };
	} catch (error) {
		console.error(`Failed to fetch comments for #${number}:`, error);
		if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to fetch comments" };
	}
}

export async function postComment(
	number: number,
	body: string,
): Promise<Result<GitHubComment>> {
	try {
		await requireAdmin();
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		const { data } = await octokit.rest.issues.createComment({
			owner,
			repo,
			issue_number: number,
			body,
		});
		return { success: true, data: data as GitHubComment };
	} catch (error) {
		console.error(`Failed to post comment on #${number}:`, error);
		if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to post comment" };
	}
}

export async function closeIssueOrPR(number: number): Promise<Result<void>> {
	try {
		await requireAdmin();
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		await octokit.rest.issues.update({
			owner,
			repo,
			issue_number: number,
			state: "closed",
		});
		return { success: true, data: undefined };
	} catch (error) {
		console.error(`Failed to close #${number}:`, error);
		if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to close item" };
	}
}

export async function mergePullRequest(
	number: number,
	method: "merge" | "squash" | "rebase" = "merge",
): Promise<Result<void>> {
	try {
		await requireAdmin();
		const octokit = getOctokit();
		const { owner, repo } = getRepoDetails();
		await octokit.rest.pulls.merge({
			owner,
			repo,
			pull_number: number,
			merge_method: method,
		});
		return { success: true, data: undefined };
	} catch (error) {
		console.error(`Failed to merge PR #${number}:`, error);
		if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to merge pull request" };
	}
}
