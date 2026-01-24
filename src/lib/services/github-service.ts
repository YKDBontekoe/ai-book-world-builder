import { eq } from "drizzle-orm";
import { Octokit } from "octokit";
import type { z } from "zod";
import type { executeFeaturePlanSchema } from "@/app/actions/github/schemas";
import { invalidateCachePattern } from "@/lib/cache";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema/auth";
import { GitHubConfigError } from "@/lib/errors";

let cachedOctokit: Octokit | null = null;

export const getOctokit = (): Octokit => {
	if (cachedOctokit) return cachedOctokit;

	const token = process.env.GITHUB_TOKEN;
	if (!token) {
		throw new Error("GITHUB_TOKEN is not set in environment variables");
	}
	cachedOctokit = new Octokit({ auth: token });
	return cachedOctokit;
};

export const getRepoDetails = async (
	userId?: string,
): Promise<{
	fullName: string;
	owner: string;
	repo: string;
}> => {
	// Try to get from user preferences first if userId is provided
	if (userId) {
		try {
			const [prefs] = await db
				.select({ julesPreferences: userPreferences.julesPreferences })
				.from(userPreferences)
				.where(eq(userPreferences.userId, userId));

			if (prefs?.julesPreferences?.repository) {
				const [owner, repo] = prefs.julesPreferences.repository.split("/");
				if (owner && repo) {
					return {
						fullName: prefs.julesPreferences.repository,
						owner,
						repo,
					};
				}
			}
		} catch (error) {
			console.warn("Failed to fetch user preferences for GitHub repo:", error);
			// Continue to fallback
		}
	}

	const owner = process.env.GITHUB_OWNER;
	const repo = process.env.GITHUB_REPO;

	if (!owner || !repo) {
		throw new GitHubConfigError();
	}

	return { fullName: `${owner}/${repo}`, owner, repo };
};

export const executeFeaturePlan = async (
	userId: string,
	plan: z.infer<typeof executeFeaturePlanSchema>,
) => {
	const octokit = getOctokit();
	const { owner, repo, fullName } = await getRepoDetails(userId);

	// 1. Create Parent Issue
	const parentRes = await octokit.rest.issues.create({
		owner,
		repo,
		title: plan.parentIssue.title,
		body: plan.parentIssue.body,
		labels: plan.parentIssue.labels,
	});

	const parentNumber = parentRes.data.number;
	const createdIssues: number[] = [parentNumber];

	// 2. Create Child Issues
	for (const child of plan.childIssues) {
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
		body: `${plan.parentIssue.body}\n\n### Tasks\n${checklist}`,
	});

	// Invalidate caches
	await invalidateCachePattern(`github:issues:${fullName}:*`);

	return { parentNumber, createdIssues };
};
