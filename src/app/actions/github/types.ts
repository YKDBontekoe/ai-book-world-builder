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
