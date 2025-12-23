import 'server-only';

const JULES_API_BASE = "https://jules.googleapis.com/v1alpha";

export interface JulesSource {
  name: string;
  id: string;
  githubRepo: {
    owner: string;
    repo: string;
  };
}

export interface JulesSession {
  name: string;
  id: string;
  title: string;
  prompt: string;
  outputs?: Array<{
    pullRequest?: {
      url: string;
      title: string;
    }
  }>;
}

export class JulesClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.JULES_API_KEY || "";
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
        throw new Error(`Jules API Error: ${response.status} ${response.statusText} - ${text}`);
    }
    return response.json() as Promise<T>;
  }

  async listSources(): Promise<JulesSource[]> {
      const data = await this.request<{ sources: JulesSource[] }>("/sources");
      return data.sources || [];
  }

  async createSession(params: {
      prompt: string;
      sourceName: string;
      startingBranch?: string;
      automationMode?: "AUTO_CREATE_PR" | "AUTOMATION_MODE_UNSPECIFIED";
      title?: string;
  }): Promise<JulesSession> {
      const body = {
          prompt: params.prompt,
          sourceContext: {
              source: params.sourceName,
              githubRepoContext: {
                  startingBranch: params.startingBranch || "main"
              }
          },
          automationMode: params.automationMode || "AUTOMATION_MODE_UNSPECIFIED",
          title: params.title
      };

      return this.request<JulesSession>("/sessions", {
          method: "POST",
          body: JSON.stringify(body)
      });
  }
}
