import { Octokit } from "octokit";

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

export const getRepoDetails = (): {
	fullName: string;
	owner: string;
	repo: string;
} => {
	const owner = process.env.GITHUB_OWNER;
	const repo = process.env.GITHUB_REPO;

	if (!owner || !repo) {
		throw new Error(
			"GITHUB_OWNER and GITHUB_REPO must be set in environment variables",
		);
	}

	return { fullName: `${owner}/${repo}`, owner, repo };
};
