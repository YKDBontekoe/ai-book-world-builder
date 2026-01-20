import { z } from "zod";

export const issueStateSchema = z.enum(["open", "closed", "all"]).default("open");
export const issueNumberSchema = z.number().int().positive();
export const postCommentSchema = z.object({
	number: z.number(),
	body: z.string().min(1),
});
export const mergePRSchema = z.object({
	number: z.number(),
	method: z.enum(["merge", "squash", "rebase"]).default("merge"),
});

export const repoBranchSchema = z.object({
	repoFullName: z.string().min(1, "Repository is required"),
});

export const pullRequestByBranchSchema = z.object({
	repoFullName: z.string().min(1, "Repository is required"),
	base: z.string().min(1, "Base branch is required"),
	head: z.string().min(1, "Head branch is required"),
});

export const pullRequestStatusSchema = z.object({
	repoFullName: z.string().min(1, "Repository is required"),
	pullRequestNumber: z.number().int().positive(),
});

export const executeFeaturePlanSchema = z.object({
	parentIssue: z.object({
		title: z.string().min(1),
		body: z.string().min(1),
		labels: z.array(z.string()).optional(),
	}),
	childIssues: z.array(
		z.object({
			title: z.string().min(1),
			body: z.string().min(1),
			labels: z.array(z.string()).optional(),
		}),
	),
});
