import { readFileSync, existsSync } from "node:fs";
import { GitHubEvent, SupervisorResult, AuthorType } from "./types";
import { log, setOutput, getAuthorType, CONFIG } from "./utils";
import { GitHubClient } from "./github";
import { parseCodecovComment } from "./codecov";
import { buildPrompt } from "./prompts";

async function main(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !existsSync(eventPath)) {
    throw new Error("GITHUB_EVENT_PATH not found");
  }

  const event: GitHubEvent = JSON.parse(readFileSync(eventPath, "utf8"));
  const eventName = process.env.GITHUB_EVENT_NAME;
  const token = process.env.GH_TOKEN || "";

  if (!token) log("Warning: GH_TOKEN is missing. API calls may fail.");

  const github = new GitHubClient(token);

  log(`Event: ${eventName} (${event.action || "n/a"})`);

  let result: SupervisorResult;

  if (eventName === "workflow_run") {
    result = await handleWorkflowRun(event, github);
  } else if (eventName === "pull_request_review") {
    result = await handleReview(event, github);
  } else if (eventName === "issue_comment") {
    result = await handleIssueComment(event, github);
  } else if (eventName === "pull_request") {
    result = handlePullRequest(event);
  } else {
    log(`Unhandled event: ${eventName}`);
    result = { action: "none" };
  }

  log(`Decision: ${result.action} (author: ${result.authorType || "unknown"})`);

  // Execute action
  switch (result.action) {
    case "mention_jules":
      if (result.prNumber && result.message) {
        log(`Posting @jules mention to PR #${result.prNumber}`);
        await github.postComment(result.prNumber, result.message);
      }
      break;

    case "invoke_jules_api":
      log(`Prepared Jules API invocation for PR #${result.prNumber}`);
      break;

    case "trigger_coderabbit":
      if (result.prNumber) {
        log(`Triggering CodeRabbit review on PR #${result.prNumber}`);
        await github.postComment(result.prNumber, CONFIG.CODERABBIT_TRIGGER);
      }
      break;

    default:
      log("No action taken");
  }

  // Set outputs for workflow
  setOutput("action", result.action);
  setOutput("pr_number", result.prNumber?.toString() || "");
  setOutput("branch", result.branch || "");
  setOutput("prompt", result.prompt || "");
  setOutput("author_type", result.authorType || "");
}

function handlePullRequest(event: GitHubEvent): SupervisorResult {
  const pr = event.pull_request;
  if (!pr) return { action: "none" };

  if (pr.draft) {
    log(`Skipping draft PR #${pr.number}`);
    return { action: "none" };
  }

  const authorType = getAuthorType(pr.user.login);
  if (authorType !== "jules") return { action: "none" };

  log(`PR #${pr.number} author: ${pr.user.login} (${authorType})`);

  return {
    action: "trigger_coderabbit",
    prNumber: pr.number,
    branch: pr.head.ref,
    authorType,
  };
}

async function handleWorkflowRun(
  event: GitHubEvent,
  github: GitHubClient
): Promise<SupervisorResult> {
  const run = event.workflow_run;
  if (!run) return { action: "none" };

  const sha = run.head_sha;

  // Find associated PR using Octokit
  const prs = await github.getPrsForCommit(sha);
  if (prs.length === 0) return { action: "none" };

  const pr = prs[0];
  const prNumber = pr.number;
  const branch = pr.head.ref;
  const authorType = getAuthorType(pr.user.login);

  if (pr.draft) {
    log(`Skipping draft PR #${prNumber}`);
    return { action: "none" };
  }

  log(`PR #${prNumber} author: ${pr.user.login} (${authorType})`);

  if (run.conclusion === "failure") {
    const failedJobs = await github.getFailedJobs(run.id);
    const logs = await github.getFailureLogs(run.id);
    const runUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${run.id}`;

    const details = `**Failed Jobs:**
${failedJobs || "Unable to determine failed jobs"}

<details>
<summary>📋 Logs</summary>

\`\`\`
${logs || "No logs available"}
\`\`\`

</details>

[View Full Run](${runUrl})`;

    if (authorType === "jules") {
      const message = `${CONFIG.JULES_MENTION} CI failed. Please fix:

${details}

**Instructions:**
1. Run \`pnpm lint && pnpm type-check && pnpm test:unit\`
2. Fix all issues
3. Commit with: \`fix: resolve CI failures\``;

      return { action: "mention_jules", prNumber, branch, message, authorType };
    } else {
      // Loop Prevention
      const commitAuthor = await github.getCommitAuthor(sha);
      const isBotCommit =
        CONFIG.JULES_BOTS.some((bot) =>
          commitAuthor.toLowerCase().includes(bot)
        ) || commitAuthor.toLowerCase().includes("[bot]");

      let extraInstructions = "";
      if (isBotCommit) {
        log(
          `Detected bot commit failure (author: ${commitAuthor}). Adding loop prevention warning.`
        );
        extraInstructions =
          "⚠️ PREVIOUS FIX FAILED: The last commit was an automated fix that did not resolve the issue. Analyze strictly why it failed and attempt a DIFFERENT approach. Do not repeat the same fix.\n";
      }

      const prompt = buildPrompt(
        "ci_failure",
        details,
        prNumber,
        extraInstructions
      );
      return {
        action: "invoke_jules_api",
        prNumber,
        branch,
        prompt,
        authorType,
      };
    }
  }

  if (run.conclusion === "success") {
    return { action: "trigger_coderabbit", prNumber, branch, authorType };
  }

  return { action: "none" };
}

async function handleReview(
  event: GitHubEvent,
  github: GitHubClient
): Promise<SupervisorResult> {
  const review = event.review;
  const pr = event.pull_request;
  if (!review || !pr) return { action: "none" };

  // Only process CodeRabbit reviews
  const reviewAuthor = review.user.login.toLowerCase();
  if (reviewAuthor !== CONFIG.CODERABBIT_BOT.toLowerCase()) {
    return { action: "none" };
  }

  const regex =
    /<summary>🤖 Fix all issues with AI agents<\/summary>\s*```([\s\S]*?)```/;
  const match = review.body.match(regex);
  const fixInstructions = match ? match[1].trim() : null;

  if (!fixInstructions) {
    log("No 'Fix all issues' section found in review");
    return { action: "none" };
  }

  const prNumber = event.pull_request?.number || 0;
  const details = await github.getPrDetails(prNumber);
  if (!details) return { action: "none" };

  const branch = details.branch;
  const authorType = getAuthorType(details.author);

  log(`PR #${prNumber} author: ${details.author} (${authorType})`);

  if (authorType === "jules") {
    const message = `${CONFIG.JULES_MENTION} CodeRabbit found issues to fix:

\`\`\`
${fixInstructions}
\`\`\`

**Instructions:**
1. Address each issue listed above
2. Run \`pnpm lint && pnpm type-check && pnpm test:unit\`
3. Commit with: \`fix: address coderabbit feedback\``;

    return { action: "mention_jules", prNumber, branch, message, authorType };
  } else {
    const prompt = buildPrompt("coderabbit", fixInstructions, prNumber);
    return { action: "invoke_jules_api", prNumber, branch, prompt, authorType };
  }
}

async function handleIssueComment(
  event: GitHubEvent,
  github: GitHubClient
): Promise<SupervisorResult> {
  const comment = event.issue_comment;
  const issue = event.issue_comment?.issue;
  if (!comment || !issue?.pull_request) return { action: "none" };

  const prNumber = issue.number;
  const details = await github.getPrDetails(prNumber);
  if (!details) return { action: "none" };

  const branch = details.branch;
  const authorType = getAuthorType(details.author);

  const body = comment.body.toLowerCase();

  // 1. User Commands
  if (body.includes(CONFIG.JULES_MENTION.toLowerCase())) {
    let commandType = "";
    if (body.includes("/refactor")) commandType = "refactor";
    else if (body.includes("/test")) commandType = "test";

    if (commandType) {
      log(
        `User requested ${commandType} on PR #${prNumber} (branch: ${branch})`
      );
      const prompt = `User requested ${commandType} on PR #${prNumber}.\n\nComment: ${comment.body}\n\nBranch: ${branch}`;
      return {
        action: "invoke_jules_api",
        prNumber,
        branch,
        prompt,
        authorType,
      };
    }
  }

  // 2. Codecov
  if (comment.user.login.toLowerCase() === CONFIG.CODECOV_BOT) {
    if (body.includes("coverage") || body.includes("missing")) {
      log(`Codecov comment on PR #${prNumber} (branch: ${branch})`);

      if (authorType === "jules") {
        const message = `${CONFIG.JULES_MENTION} Codecov reports missing coverage. Please add tests.`;
        return {
          action: "mention_jules",
          prNumber,
          branch,
          message,
          authorType,
        };
      } else {
        const parsedDetails = parseCodecovComment(comment.body);
        const detailsToUse = parsedDetails || comment.body;

        const prompt = buildPrompt("codecov", detailsToUse, prNumber);
        return {
          action: "invoke_jules_api",
          prNumber,
          branch,
          prompt,
          authorType,
        };
      }
    }
  }

  return { action: "none" };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
