import { Octokit } from "octokit";

export const getOctokit = (): Octokit => {
	const token = process.env.GITHUB_TOKEN;
	if (!token) {
		throw new Error("GITHUB_TOKEN is not set in environment variables");
	}
	return new Octokit({ auth: token });
};

export const getRepoDetails = (): {
	fullName: string;
	owner: string;
	repo: string;
} => {
	const owner = process.env.GITHUB_OWNER || "YKDBontekoe";
	const repo = process.env.GITHUB_REPO || "ai-book-world-builder";
	return { fullName: `${owner}/${repo}`, owner, repo };
};
