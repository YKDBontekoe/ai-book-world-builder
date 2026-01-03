import "server-only";

const JULES_API_BASE = "https://jules.googleapis.com/v1alpha";

// --- Types ---

export type JulesSessionState =
	| "STATE_UNSPECIFIED"
	| "QUEUED"
	| "PLANNING"
	| "AWAITING_PLAN_APPROVAL"
	| "AWAITING_USER_FEEDBACK"
	| "IN_PROGRESS"
	| "PAUSED"
	| "FAILED"
	| "COMPLETED";

export type JulesAutomationMode =
	| "AUTOMATION_MODE_UNSPECIFIED"
	| "AUTO_CREATE_PR";

export interface JulesSource {
	name: string; // full resource name
	id: string;
	githubRepo: {
		owner: string;
		repo: string;
		isPrivate: boolean;
		defaultBranch: { displayName: string };
		branches: Array<{ displayName: string }>;
	};
}

export interface JulesSession {
	name: string; // full resource name e.g. sessions/abc
	id: string;
	prompt: string;
	title: string;
	state: JulesSessionState;
	url: string;
	sourceContext: {
		source: string;
		githubRepoContext: {
			startingBranch: string;
		};
	};
	requirePlanApproval?: boolean;
	automationMode?: JulesAutomationMode;
	outputs?: Array<{
		pullRequest?: {
			url: string;
			title: string;
			description: string;
		};
	}>;
	createTime: string;
	updateTime: string;
}

export interface JulesPlanStep {
	id: string;
	index: number;
	title: string;
	description: string;
	state?:
		| "STATE_UNSPECIFIED"
		| "PENDING"
		| "IN_PROGRESS"
		| "COMPLETED"
		| "FAILED"
		| "SKIPPED";
}

export interface JulesPlan {
	id: string;
	steps: JulesPlanStep[];
	createTime: string;
}

export interface JulesArtifact {
	changeSet?: {
		source: string;
		gitPatch: {
			baseCommitId: string;
			unidiffPatch: string;
			suggestedCommitMessage: string;
		};
	};
	bashOutput?: {
		command: string;
		output: string;
		exitCode: number;
	};
	media?: {
		mimeType: string;
		data: string; // base64
	};
}

export interface JulesActivity {
	name: string;
	id: string;
	originator: "ORIGINATOR_UNSPECIFIED" | "USER" | "AGENT" | "SYSTEM";
	description: string;
	createTime: string;
	artifacts?: JulesArtifact[];

	// Event Types
	planGenerated?: {
		plan: JulesPlan;
	};
	planApproved?: {
		planId: string;
	};
	userMessaged?: {
		userMessage: string;
	};
	agentMessaged?: {
		agentMessage: string;
	};
	progressUpdated?: {
		title: string;
		description: string;
	};
	sessionCompleted?: Record<string, never>;
	sessionFailed?: {
		reason: string;
	};
	// Legacy/Helper fields for our UI mapping if needed,
	// but we should strictly use the doc fields now.
}

// --- Client ---

export class JulesClient {
	private apiKey: string;

	constructor(apiKey?: string) {
		this.apiKey = apiKey || process.env.JULES_API_KEY || "";
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		if (!this.apiKey) {
			throw new Error("JULES_API_KEY is missing");
		}
		const url = `${JULES_API_BASE}${endpoint}`;
		const headers: Record<string, string> = {
			"X-Goog-Api-Key": this.apiKey,
			"Content-Type": "application/json",
			...(options.headers as Record<string, string>),
		};

		const response = await fetch(url, { ...options, headers });
		if (!response.ok) {
			const text = await response.text();
			throw new Error(
				`Jules API Error: ${response.status} ${response.statusText} - ${text}`,
			);
		}
		// Some endpoints return empty bodies (like approvePlan)
		if (
			response.status === 204 ||
			response.headers.get("content-length") === "0"
		) {
			return {} as T;
		}
		// Safely handle empty JSON responses
		try {
			return (await response.json()) as T;
		} catch {
			return {} as T;
		}
	}

	// --- Sources ---

	async listSources(
		pageSize = 20,
		pageToken?: string,
	): Promise<{ sources: JulesSource[]; nextPageToken?: string }> {
		const params = new URLSearchParams({ pageSize: pageSize.toString() });
		if (pageToken) params.append("pageToken", pageToken);

		const data = await this.request<{
			sources: JulesSource[];
			nextPageToken?: string;
		}>(`/sources?${params.toString()}`);
		return { sources: data.sources || [], nextPageToken: data.nextPageToken };
	}

	async getSource(sourceName: string): Promise<JulesSource> {
		// sourceName should be 'sources/{id}'
		// If only id is passed, we might need to handle it, but API expects full name usually
		// but let's assume strict usage or simple prepend if missing
		const path = sourceName.startsWith("sources/")
			? sourceName
			: `sources/${sourceName}`;
		return this.request<JulesSource>(`/${path}`);
	}

	// --- Sessions ---

	async listSessions(
		pageSize = 20,
		pageToken?: string,
	): Promise<{ sessions: JulesSession[]; nextPageToken?: string }> {
		const params = new URLSearchParams({ pageSize: pageSize.toString() });
		if (pageToken) params.append("pageToken", pageToken);

		const data = await this.request<{
			sessions: JulesSession[];
			nextPageToken?: string;
		}>(`/sessions?${params.toString()}`);
		return { sessions: data.sessions || [], nextPageToken: data.nextPageToken };
	}

	async getSession(sessionId: string): Promise<JulesSession> {
		const name = sessionId.startsWith("sessions/")
			? sessionId
			: `sessions/${sessionId}`;
		return this.request<JulesSession>(`/${name}`);
	}

	async createSession(params: {
		prompt: string;
		sourceName: string;
		startingBranch?: string;
		automationMode?: JulesAutomationMode;
		title?: string;
		requirePlanApproval?: boolean;
	}): Promise<JulesSession> {
		const body = {
			prompt: params.prompt,
			sourceContext: {
				source: params.sourceName,
				githubRepoContext: {
					startingBranch: params.startingBranch || "main",
				},
			},
			automationMode: params.automationMode || "AUTOMATION_MODE_UNSPECIFIED",
			title: params.title,
			requirePlanApproval: params.requirePlanApproval,
		};

		return this.request<JulesSession>("/sessions", {
			method: "POST",
			body: JSON.stringify(body),
		});
	}

	async approvePlan(sessionId: string): Promise<void> {
		const name = sessionId.startsWith("sessions/")
			? sessionId
			: `sessions/${sessionId}`;
		await this.request(`/${name}:approvePlan`, {
			method: "POST",
			body: JSON.stringify({}),
		});
	}

	async sendMessage(sessionId: string, prompt: string): Promise<void> {
		const name = sessionId.startsWith("sessions/")
			? sessionId
			: `sessions/${sessionId}`;
		await this.request(`/${name}:sendMessage`, {
			method: "POST",
			body: JSON.stringify({ prompt }),
		});
	}

	// --- Activities ---

	async listActivities(
		sessionId: string,
		pageSize = 50,
		pageToken?: string,
	): Promise<{ activities: JulesActivity[]; nextPageToken?: string }> {
		const name = sessionId.startsWith("sessions/")
			? sessionId
			: `sessions/${sessionId}`;

		const params = new URLSearchParams({ pageSize: pageSize.toString() });
		if (pageToken) params.append("pageToken", pageToken);

		const data = await this.request<{
			activities: JulesActivity[];
			nextPageToken?: string;
		}>(`/${name}/activities?${params.toString()}`);
		return {
			activities: data.activities || [],
			nextPageToken: data.nextPageToken,
		};
	}
}
