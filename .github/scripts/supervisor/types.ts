export type AuthorType = "jules" | "bot" | "human";

export type ActionType =
  | "mention_jules"
  | "invoke_jules_api"
  | "trigger_coderabbit"
  | "none";

export interface SupervisorResult {
  action: ActionType;
  prNumber?: number;
  branch?: string;
  message?: string;   // For @mentions
  prompt?: string;    // For Jules API
  authorType?: AuthorType;
}

export interface GitHubEvent {
  action?: string;
  workflow_run?: {
    id: number;
    conclusion: string;
    head_sha: string;
  };
  review?: {
    body: string;
    user: { login: string };
    state: string;
  };
  issue_comment?: {
    body: string;
    user: { login: string };
    issue: { number: number; pull_request?: object };
  };
  pull_request?: {
    number: number;
    head: { ref: string };
    user: { login: string };
    draft: boolean;
  };
}
