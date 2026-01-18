"use server";

import { z } from "zod";
import { createAdminAction } from "@/lib/action-middleware";
import {
	OctogitClient,
	type OctogitBranch,
	type OctogitPullRequestSummary,
	type OctogitPullRequestStatus,
	type OctogitRepository,
} from "@/lib/octogit-client";

const octogit = new OctogitClient();

const repoIdSchema = z.object({
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

export const listOctogitRepositoriesAction = createAdminAction({
	handler: async (): Promise<OctogitRepository[]> => {
		return await octogit.listRepositories();
	},
});

export const listOctogitBranchesAction = createAdminAction({
	input: repoIdSchema,
	handler: async ({ input }): Promise<OctogitBranch[]> => {
		return await octogit.listBranches(input.repoFullName);
	},
});

export const getOctogitPullRequestByBranchAction = createAdminAction({
	input: pullRequestByBranchSchema,
	handler: async ({ input }): Promise<OctogitPullRequestSummary | null> => {
		return await octogit.getPullRequestByBranch({
			repoFullName: input.repoFullName,
			base: input.base,
			head: input.head,
		});
	},
});

export const getOctogitPullRequestStatusAction = createAdminAction({
	input: pullRequestStatusSchema,
	handler: async ({ input }): Promise<OctogitPullRequestStatus> => {
		return await octogit.getPullRequestStatus({
			repoFullName: input.repoFullName,
			pullRequestNumber: input.pullRequestNumber,
		});
	},
});

export const mergeOctogitPullRequestAction = createAdminAction({
	input: pullRequestStatusSchema,
	handler: async ({ input }): Promise<void> => {
		await octogit.mergePullRequest({
			repoFullName: input.repoFullName,
			pullRequestNumber: input.pullRequestNumber,
		});
	},
});
