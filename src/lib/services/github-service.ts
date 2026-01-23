import { eq } from "drizzle-orm";
import { Octokit } from "octokit";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema/auth";

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
		throw new Error(
			"GITHUB_OWNER and GITHUB_REPO must be set in environment variables or user preferences",
		);
	}

	return { fullName: `${owner}/${repo}`, owner, repo };
};
