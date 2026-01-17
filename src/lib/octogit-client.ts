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

export interface OctogitPullRequest {
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
	}): Promise<OctogitPullRequest | null> {
		const query = new URLSearchParams({
			base: params.base,
			head: params.head,
		});
		const data = await this.request<
			OctogitPullRequest | { pullRequest?: OctogitPullRequest }
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
		await this.request(`/repos/${params.repoFullName}/pulls/${params.pullRequestNumber}/merge`, {
			method: "POST",
			body: JSON.stringify({}),
		});
	}
}
