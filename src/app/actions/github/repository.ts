"use server";

import type { z } from "zod";
import { createAdminAction } from "@/lib/action-middleware";
import type { GitHubBranch, GitHubRepository } from "@/lib/github-types";
import { getOctokit, getRepoDetails } from "@/lib/services/github-service";
import { repoBranchSchema } from "./schemas";

/**
 * Get repository statistics
 */
const getRepoStatsAction = createAdminAction({
	handler: async ({ user }) => {
		const octokit = getOctokit();
		const { owner, repo } = await getRepoDetails(user.id);
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
	input: z.infer<typeof repoBranchSchema>,
): ReturnType<typeof listGitHubBranchesActionInternal> {
	return listGitHubBranchesActionInternal(input);
}
