export type GitHubPermission = {
	admin: boolean;
	push: boolean;
	pull: boolean;
};

export interface GitHubRepository {
	id: number;
	name: string;
	fullName: string;
	owner: string;
	defaultBranch: string;
	private: boolean;
	permissions?: GitHubPermission;
}

export interface GitHubBranch {
	name: string;
	protected: boolean;
}

export type GitHubCheckStatus = {
	name: string;
	status: "queued" | "in_progress" | "completed";
	conclusion:
		| "success"
		| "failure"
		| "neutral"
		| "cancelled"
		| "skipped"
		| null;
	detailsUrl?: string;
};

export type GitHubPullRequestStatus = {
	state: "pending" | "success" | "failure" | "error" | "unknown";
	mergeable: boolean | null;
	hasConflicts: boolean;
	checks: GitHubCheckStatus[];
	updatedAt: string;
};

export interface GitHubPullRequestSummary {
	id: number;
	number: number;
	title: string;
	url: string;
	base: string;
	head: string;
	status: GitHubPullRequestStatus;
}
