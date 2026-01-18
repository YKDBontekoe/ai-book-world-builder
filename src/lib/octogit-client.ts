import "server-only";

const OCTOGIT_API_BASE = process.env.OCTOGIT_API_BASE || "";
const OCTOGIT_API_KEY = process.env.OCTOGIT_API_KEY || "";

export type OctogitPermission = {
	admin: boolean;
	push: boolean;
	pull: boolean;
};

export interface OctogitRepository {
	id: string;
	name: string;
	fullName: string;
	owner: string;
	defaultBranch: string;
	private: boolean;
	permissions?: OctogitPermission;
}

export type OctogitRepoStats = {
	stars: number;
	forks: number;
	openIssues: number;
};

export type OctogitIssue = {
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
	labels?: Array<{ name: string }>;
};

export type OctogitPullRequest = OctogitIssue & {
	merged_at: string | null;
	head: {
		ref: string;
		sha: string;
	};
	base: {
		ref: string;
	};
	status?: OctogitPullRequestStatus;
};

export type OctogitComment = {
	id: number;
	body: string | undefined;
	user: {
		login: string;
		avatar_url: string;
	} | null;
	created_at: string;
	html_url: string;
};

export interface OctogitBranch {
	name: string;
	protected: boolean;
}

export type OctogitCheckStatus = {
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

export type OctogitPullRequestStatus = {
	state: "pending" | "success" | "failure" | "error" | "unknown";
	mergeable: boolean | null;
	hasConflicts: boolean;
	checks: OctogitCheckStatus[];
	updatedAt: string;
};

export interface OctogitPullRequestSummary {
	id: string;
	number: number;
	title: string;
	url: string;
	base: string;
	head: string;
	status: OctogitPullRequestStatus;
}

export class OctogitClient {
	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		if (!OCTOGIT_API_BASE) {
			throw new Error("OCTOGIT_API_BASE is missing");
		}
		if (!OCTOGIT_API_KEY) {
			throw new Error("OCTOGIT_API_KEY is missing");
		}

		const url = `${OCTOGIT_API_BASE}${endpoint}`;
		const headers: Record<string, string> = {
			Authorization: `Bearer ${OCTOGIT_API_KEY}`,
			"Content-Type": "application/json",
			...(options.headers as Record<string, string>),
		};

		const response = await fetch(url, { ...options, headers });
		if (!response.ok) {
			const text = await response.text();
			throw new Error(
				`Octogit API Error: ${response.status} ${response.statusText} - ${text}`,
			);
		}

		if (
			response.status === 204 ||
			response.headers.get("content-length") === "0"
		) {
			return {} as T;
		}

		return (await response.json()) as T;
	}

	async listRepositories(): Promise<OctogitRepository[]> {
		const data = await this.request<
			OctogitRepository[] | { repositories?: OctogitRepository[] }
		>("/repos");
		return Array.isArray(data) ? data : data.repositories ?? [];
	}

	async listBranches(repoFullName: string): Promise<OctogitBranch[]> {
		const data = await this.request<OctogitBranch[] | { branches?: OctogitBranch[] }>(
			`/repos/${repoFullName}/branches`,
		);
		return Array.isArray(data) ? data : data.branches ?? [];
	}

	async getPullRequestByBranch(params: {
		repoFullName: string;
		base: string;
		head: string;
	}): Promise<OctogitPullRequestSummary | null> {
		const query = new URLSearchParams({
			base: params.base,
			head: params.head,
		});
		const data = await this.request<
			OctogitPullRequestSummary | { pullRequest?: OctogitPullRequestSummary }
		>(`/repos/${params.repoFullName}/pulls/by-branch?${query.toString()}`);
		if ("pullRequest" in data) {
			return data.pullRequest ?? null;
		}
		return data;
	}

	async getPullRequestStatus(params: {
		repoFullName: string;
		pullRequestNumber: number;
	}): Promise<OctogitPullRequestStatus> {
		return await this.request<OctogitPullRequestStatus>(
			`/repos/${params.repoFullName}/pulls/${params.pullRequestNumber}/status`,
		);
	}

	async mergePullRequest(params: {
		repoFullName: string;
		pullRequestNumber: number;
	}): Promise<void> {
		await this.request(
			`/repos/${params.repoFullName}/pulls/${params.pullRequestNumber}/merge`,
			{
				method: "POST",
				body: JSON.stringify({}),
			},
		);
	}

	async getRepoStats(repoFullName: string): Promise<OctogitRepoStats> {
		return await this.request<OctogitRepoStats>(`/repos/${repoFullName}/stats`);
	}

	async listIssues(params: {
		repoFullName: string;
		state: "open" | "closed" | "all";
	}): Promise<OctogitIssue[]> {
		const query = new URLSearchParams({ state: params.state });
		return await this.request<OctogitIssue[]>(
			`/repos/${params.repoFullName}/issues?${query.toString()}`,
		);
	}

	async listPullRequests(params: {
		repoFullName: string;
		state: "open" | "closed" | "all";
	}): Promise<OctogitPullRequest[]> {
		const query = new URLSearchParams({ state: params.state });
		return await this.request<OctogitPullRequest[]>(
			`/repos/${params.repoFullName}/pulls?${query.toString()}`,
		);
	}

	async getIssue(params: {
		repoFullName: string;
		issueNumber: number;
	}): Promise<OctogitIssue> {
		return await this.request<OctogitIssue>(
			`/repos/${params.repoFullName}/issues/${params.issueNumber}`,
		);
	}

	async getPullRequest(params: {
		repoFullName: string;
		pullRequestNumber: number;
	}): Promise<OctogitPullRequest> {
		return await this.request<OctogitPullRequest>(
			`/repos/${params.repoFullName}/pulls/${params.pullRequestNumber}`,
		);
	}

	async listComments(params: {
		repoFullName: string;
		issueNumber: number;
	}): Promise<OctogitComment[]> {
		return await this.request<OctogitComment[]>(
			`/repos/${params.repoFullName}/issues/${params.issueNumber}/comments`,
		);
	}

	async createComment(params: {
		repoFullName: string;
		issueNumber: number;
		body: string;
	}): Promise<OctogitComment> {
		return await this.request<OctogitComment>(
			`/repos/${params.repoFullName}/issues/${params.issueNumber}/comments`,
			{
				method: "POST",
				body: JSON.stringify({ body: params.body }),
			},
		);
	}

	async updateIssue(params: {
		repoFullName: string;
		issueNumber: number;
		body?: string;
		state?: "open" | "closed";
	}): Promise<void> {
		await this.request(
			`/repos/${params.repoFullName}/issues/${params.issueNumber}`,
			{
				method: "PATCH",
				body: JSON.stringify({
					body: params.body,
					state: params.state,
				}),
			},
		);
	}

	async createIssue(params: {
		repoFullName: string;
		title: string;
		body: string;
		labels?: string[];
	}): Promise<OctogitIssue> {
		return await this.request<OctogitIssue>(`/repos/${params.repoFullName}/issues`, {
			method: "POST",
			body: JSON.stringify({
				title: params.title,
				body: params.body,
				labels: params.labels,
			}),
		});
	}

	async mergePullRequestWithMethod(params: {
		repoFullName: string;
		pullRequestNumber: number;
		method: "merge" | "squash" | "rebase";
	}): Promise<void> {
		await this.request(
			`/repos/${params.repoFullName}/pulls/${params.pullRequestNumber}/merge`,
			{
				method: "POST",
				body: JSON.stringify({ method: params.method }),
			},
		);
	}
}
