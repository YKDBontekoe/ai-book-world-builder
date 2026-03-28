import { Octokit } from "octokit";
import { CONFIG, log } from "./utils";

export class GitHubClient {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
    const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
    this.owner = owner;
    this.repo = repo;
  }

  async postComment(prNumber: number, body: string): Promise<void> {
    try {
      await this.octokit.rest.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: prNumber,
        body,
      });
    } catch (e) {
      log(`Error posting comment: ${e}`);
    }
  }

  async getPrDetails(prNumber: number): Promise<{ branch: string; author: string; title: string } | null> {
    try {
      const { data } = await this.octokit.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
      });
      return {
        branch: data.head.ref,
        author: data.user.login,
        title: data.title
      };
    } catch (e) {
      log(`Error getting PR details: ${e}`);
      return null;
    }
  }

  async getPrsForCommit(sha: string): Promise<Array<{ number: number; head: { ref: string }; user: { login: string }; draft: boolean }>> {
    try {
      const { data } = await this.octokit.rest.repos.listPullRequestsAssociatedWithCommit({
        owner: this.owner,
        repo: this.repo,
        commit_sha: sha,
      });
      return data.map((pr) => ({
        number: pr.number,
        head: { ref: pr.head.ref },
        user: { login: pr.user?.login || "" },
        draft: pr.draft || false,
      }));
    } catch (e) {
      log(`Error getting PRs for commit: ${e}`);
      return [];
    }
  }

  async getCommitAuthor(sha: string): Promise<string> {
    try {
      const { data } = await this.octokit.rest.repos.getCommit({
        owner: this.owner,
        repo: this.repo,
        ref: sha,
      });
      return data.commit.author?.name || "";
    } catch (e) {
      return "";
    }
  }

  async getFailedJobs(runId: number): Promise<string> {
    try {
      const { data } = await this.octokit.rest.actions.listJobsForWorkflowRun({
        owner: this.owner,
        repo: this.repo,
        run_id: runId,
        filter: "latest",
      });

      const failed = data.jobs.filter((j) => j.conclusion === "failure");
      return failed
        .map((j) => {
          const failedSteps = j.steps
            ?.filter((s) => s.conclusion === "failure")
            .map((s) => s.name)
            .join(", ");
          return `- **${j.name}**: ${failedSteps || "Unknown step"}`;
        })
        .join("\n");
    } catch (e) {
      log(`Error getting failed jobs: ${e}`);
      return "";
    }
  }

  async getFailureLogs(runId: number): Promise<string> {
    try {
      const { data: jobsData } = await this.octokit.rest.actions.listJobsForWorkflowRun({
        owner: this.owner,
        repo: this.repo,
        run_id: runId,
      });

      const failedJobs = jobsData.jobs.filter((j) => j.conclusion === "failure");
      let fullLog = "";

      for (const job of failedJobs) {
        try {
          // Download logs for the job
          // Note: This endpoint redirects to the raw log URL. Octokit should follow it.
          const response = await this.octokit.rest.actions.downloadJobLogsForWorkflowRun({
            owner: this.owner,
            repo: this.repo,
            job_id: job.id,
          });

          // response.data should be the log string if successful
          const content = String(response.data);
          fullLog += `\n--- Job: ${job.name} ---\n${content}\n`;
        } catch (err) {
          log(`Failed to download log for job ${job.id}: ${err}`);
        }
      }

      return this.extractRelevantLogs(fullLog);
    } catch (e) {
      log(`Error getting failure logs: ${e}`);
      return "";
    }
  }

  private extractRelevantLogs(fullLogs: string): string {
    const lines = fullLogs.split("\n");
    const errorKeywords = [
      "error:",
      "fail",
      "exception",
      "type mismatch",
      "syntax error",
      "fatal",
    ];
    const relevantLines: Set<string> = new Set();

    for (let i = 0; i < lines.length; i++) {
      const lowerLine = lines[i].toLowerCase();
      if (errorKeywords.some((kw) => lowerLine.includes(kw))) {
        for (let j = Math.max(0, i - 2); j < i; j++) relevantLines.add(lines[j]);
        relevantLines.add(lines[i]);
        for (let j = i + 1; j < Math.min(lines.length, i + 6); j++)
          relevantLines.add(lines[j]);
      }
    }

    const result = Array.from(relevantLines).join("\n");
    if (result.length < 500 && fullLogs.length > 0) {
      return (
        fullLogs.slice(0, CONFIG.MAX_LOG_LENGTH) + "\n... (fallback to tail)"
      );
    }
    return result;
  }
}
