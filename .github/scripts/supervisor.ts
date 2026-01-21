import { execSync } from "child_process";
import { readFileSync, appendFileSync, existsSync } from "fs";

/**
 * Simplified Agent Supervisor (v5.1)
 *
 * Flow:
 * 1. Jules PR: CI fails → @jules mention, CI passes → trigger CodeRabbit
 * 2. Bot PR (Renovate, etc): CI fails → Jules API, CI passes → CodeRabbit → Jules API
 * 3. Human PR: Same as bot PR (use Jules API for full context)
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  // Bot identifiers
  JULES_BOTS: ["google-labs-jules", "jules"],
  OTHER_BOTS: ["renovate[bot]", "dependabot[bot]"],
  CODERABBIT_BOT: "coderabbitai[bot]",
  CODECOV_BOT: "codecov[bot]",

  // Mentions and triggers
  JULES_MENTION: "@jules",
  CODERABBIT_TRIGGER: "@coderabbitai review",

  // Limits
  MAX_LOG_LENGTH: 4000,
};

// =============================================================================
// UTILITIES
// =============================================================================

function log(msg: string): void {
  console.log(`[Supervisor] ${msg}`);
}

function exec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return "";
  }
}

function setOutput(key: string, value: string): void {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    console.log(`::set-output name=${key}::${value}`);
    return;
  }
  if (value.includes("\n")) {
    const delim = `EOF_${Date.now()}`;
    appendFileSync(outputPath, `${key}<<${delim}\n${value}\n${delim}\n`);
  } else {
    appendFileSync(outputPath, `${key}=${value}\n`);
  }
}

// =============================================================================
// AUTHOR DETECTION
// =============================================================================

type AuthorType = "jules" | "bot" | "human";

function getAuthorType(login: string): AuthorType {
  const normalized = login.toLowerCase();

  // Check if it's Jules
  if (CONFIG.JULES_BOTS.some((bot) => normalized.includes(bot))) {
    return "jules";
  }

  // Check if it's another bot
  if (CONFIG.OTHER_BOTS.some((bot) => normalized === bot) || normalized.includes("[bot]")) {
    return "bot";
  }

  return "human";
}

// =============================================================================
// GITHUB HELPERS
// =============================================================================

function postComment(prNumber: number, body: string): void {
  const escaped = body.replace(/'/g, "'\\''");
  exec(`gh pr comment ${prNumber} --body '${escaped}'`);
}

function getFailedJobs(runId: number): string {
  const repo = process.env.GITHUB_REPOSITORY;
  const jobsJson = exec(`gh api "/repos/${repo}/actions/runs/${runId}/jobs"`);
  if (!jobsJson) return "";

  const jobs = JSON.parse(jobsJson);
  const failed = jobs.jobs
    ?.filter((j: { conclusion: string }) => j.conclusion === "failure")
    .map((j: { name: string; steps?: Array<{ name: string; conclusion: string }> }) => {
      const failedSteps = j.steps
        ?.filter((s) => s.conclusion === "failure")
        .map((s) => s.name)
        .join(", ");
      return `- **${j.name}**: ${failedSteps || "Unknown step"}`;
    })
    .join("\n");

  return failed || "";
}

function extractRelevantLogs(fullLogs: string): string {
  const lines = fullLogs.split("\n");
  const errorKeywords = ["error:", "fail", "exception", "type mismatch", "syntax error", "fatal"];
  const relevantLines: Set<string> = new Set();
  
  // Find lines with keywords and add context
  for (let i = 0; i < lines.length; i++) {
    const lowerLine = lines[i].toLowerCase();
    if (errorKeywords.some(kw => lowerLine.includes(kw))) {
      // Add 2 lines before
      for (let j = Math.max(0, i - 2); j < i; j++) relevantLines.add(lines[j]);
      // Add the line itself
      relevantLines.add(lines[i]);
      // Add 5 lines after
      for (let j = i + 1; j < Math.min(lines.length, i + 6); j++) relevantLines.add(lines[j]);
    }
  }

  const result = Array.from(relevantLines).join("\n");
  
  // Fallback if filtering yielded too little
  if (result.length < 500 && fullLogs.length > 0) {
     return fullLogs.slice(0, CONFIG.MAX_LOG_LENGTH) + "\n... (fallback to tail)";
  }

  return result;
  return result;
}

// =============================================================================
// HEURISTICS & CATEGORIZATION
// =============================================================================

type ErrorCategory = "TYPESCRIPT" | "TEST" | "LINT" | "DEPENDENCY" | "UNKNOWN";

function categorizeError(logs: string): ErrorCategory {
  const lower = logs.toLowerCase();
  
  if (lower.includes("ts") || lower.includes("type mismatch") || /TS\d+/.test(logs)) return "TYPESCRIPT";
  if (lower.includes("failing test") || lower.includes("expected") && lower.includes("received") || lower.includes("snapshot failed")) return "TEST";
  if (lower.includes("eslint") || lower.includes("prettier") || lower.includes("lint error")) return "LINT";
  if (lower.includes("lockfile") || lower.includes("enoent") || lower.includes("node_modules")) return "DEPENDENCY";
  
  return "UNKNOWN";
}

function getHeuristics(category: ErrorCategory): string {
  switch (category) {
    case "TYPESCRIPT":
      return "Check type definitions carefully. Do not use `any` or `ts-ignore` unless absolutely necessary. Ensure interfaces match API responses.";
    case "TEST":
      return "Analyze why the test failed. Do NOT simply delete or skip the test. Fix the implementation code to satisfy the test requirements.";
    case "LINT":
      return "Apply automatic fix rules where possible. Ensure code style matches project conventions.";
    case "DEPENDENCY":
      return "Run `pnpm install` if needed. Check package.json versions.";
    default:
      return "";
  }
}

function getFailureLogs(runId: number): string {
  const repo = process.env.GITHUB_REPOSITORY;
  let logs = exec(`gh run view ${runId} --repo ${repo} --log-failed`);
  
  logs = extractRelevantLogs(logs);

  if (logs.length > CONFIG.MAX_LOG_LENGTH) {
    logs = logs.slice(0, CONFIG.MAX_LOG_LENGTH) + "\n... (truncated)";
  }
  return logs;
}

// =============================================================================
// CODERABBIT PARSER
// =============================================================================

function extractFixInstructions(reviewBody: string): string | null {
  const regex = /<summary>🤖 Fix all issues with AI agents<\/summary>\s*```([\s\S]*?)```/;
  const match = reviewBody.match(regex);
  return match ? match[1].trim() : null;
}

// =============================================================================
// PROMPT BUILDER
// =============================================================================

function getProjectStandards(): string {
  try {
    if (existsSync("AGENTS.md")) {
      return readFileSync("AGENTS.md", "utf8");
    }
  } catch (e) {
    log(`Warning: Failed to read AGENTS.md: ${e}`);
  }
  return "";
}

function getCommitAuthor(sha: string): string {
  const repo = process.env.GITHUB_REPOSITORY;
  // Format: "AuthorName"
  return exec(`gh api "/repos/${repo}/commits/${sha}" --jq ".commit.author.name"`);
}

function buildPrompt(type: "ci_failure" | "coderabbit" | "codecov", details: string, prNumber: number, extraInstructions = ""): string {
  const repo = process.env.GITHUB_REPOSITORY;
  const standards = getProjectStandards();

  const standardsSection = standards 
    ? `\n\n## Project Standards (AGENTS.md)\n${standards}`
    : "";

  if (type === "ci_failure") {
    const category = categorizeError(details);
    const heuristics = getHeuristics(category);
    const heuristicsSection = heuristics ? `\n\n### Expert Advice (${category})\n${heuristics}` : "";

    return `Fix CI failures for PR #${prNumber} in ${repo}.

## Failure Details
${details}${standardsSection}

## Instructions
${extraInstructions}
1. Analyze the failure details above.
2. Adhere strictly to the Project Standards.
${heuristicsSection}
3. Run \`pnpm lint && pnpm type-check && pnpm test:unit\` to verify fixes.
4. Commit with: \`fix: resolve CI failures\``;
  }

  if (type === "codecov") {
     return `Improve test coverage for PR #${prNumber} in ${repo}.

## Coverage Report
${details}${standardsSection}

## Instructions
${extraInstructions}
1. Analyze the coverage gaps.
2. Add unit tests to cover the missing lines/branches.
3. Adhere strictly to the Project Standards.
4. Run \`pnpm test:unit\` to verify.
5. Commit with: \`test: add missing coverage\``;
  }

  return `Address CodeRabbit feedback for PR #${prNumber} in ${repo}.

## Feedback
${details}${standardsSection}

## Instructions
${extraInstructions}
1. Fix each issue listed above.
2. Adhere strictly to the Project Standards.
3. Run \`pnpm lint && pnpm type-check && pnpm test:unit\` to verify fixes.
4. Commit with: \`fix: address coderabbit feedback\``;
}

// =============================================================================
// RESULT TYPE
// =============================================================================

type ActionType =
  | "mention_jules"
  | "invoke_jules_api"
  | "trigger_coderabbit"
  | "none";

interface SupervisorResult {
  action: ActionType;
  prNumber?: number;
  branch?: string;
  message?: string;   // For @mentions
  prompt?: string;    // For Jules API
  authorType?: AuthorType;
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

interface GitHubEvent {
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

function handleWorkflowRun(event: GitHubEvent): SupervisorResult {
  const run = event.workflow_run;
  if (!run) return { action: "none" };

  const repo = process.env.GITHUB_REPOSITORY;
  const sha = run.head_sha;

  // Find associated PR
  const prsJson = exec(`gh api "/repos/${repo}/commits/${sha}/pulls"`);
  if (!prsJson) return { action: "none" };

  const prs = JSON.parse(prsJson);
  if (prs.length === 0) return { action: "none" };

  const pr = prs[0];
  const prNumber = pr.number;
  const branch = pr.head.ref;
  const authorType = getAuthorType(pr.user.login);

  // Skip draft PRs
  if (pr.draft) {
    log(`Skipping draft PR #${prNumber}`);
    return { action: "none" };
  }

  log(`PR #${prNumber} author: ${pr.user.login} (${authorType})`);

  if (run.conclusion === "failure") {
    const failedJobs = getFailedJobs(run.id);
    const logs = getFailureLogs(run.id);
    const runUrl = `https://github.com/${repo}/actions/runs/${run.id}`;

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
      // Jules PR → use @jules mention (free)
      const message = `${CONFIG.JULES_MENTION} CI failed. Please fix:

${details}

**Instructions:**
1. Run \`pnpm lint && pnpm type-check && pnpm test:unit\`
2. Fix all issues
3. Commit with: \`fix: resolve CI failures\``;

      return { action: "mention_jules", prNumber, branch, message, authorType };
    } else {
      // Bot/Human PR → use Jules API
      
      // Loop Prevention: Check if the last commit was by a bot
      const commitAuthor = getCommitAuthor(sha);
      const isBotCommit = CONFIG.JULES_BOTS.some(bot => commitAuthor.toLowerCase().includes(bot)) || 
                          commitAuthor.toLowerCase().includes("[bot]");
      
      let extraInstructions = "";
      if (isBotCommit) {
        log(`Detected bot commit failure (author: ${commitAuthor}). Adding loop prevention warning.`);
        extraInstructions = "⚠️ PREVIOUS FIX FAILED: The last commit was an automated fix that did not resolve the issue. Analyze strictly why it failed and attempt a DIFFERENT approach. Do not repeat the same fix.\n";
      }

      const prompt = buildPrompt("ci_failure", details, prNumber, extraInstructions);
      return { action: "invoke_jules_api", prNumber, branch, prompt, authorType };
    }
  }

  if (run.conclusion === "success") {
    return { action: "trigger_coderabbit", prNumber, branch, authorType };
  }

  return { action: "none" };
}

function handleReview(event: GitHubEvent): SupervisorResult {
  const review = event.review;
  const pr = event.pull_request;
  if (!review || !pr) return { action: "none" };

  // Only process CodeRabbit reviews
  const reviewAuthor = review.user.login.toLowerCase();
  if (reviewAuthor !== CONFIG.CODERABBIT_BOT.toLowerCase()) {
    log(`Ignoring review from ${reviewAuthor}`);
    return { action: "none" };
  }

  // Extract "Fix all issues" section
  const fixInstructions = extractFixInstructions(review.body || "");
  if (!fixInstructions) {
    log("No 'Fix all issues' section found in review");
    return { action: "none" };
  }

  const prNumber = pr.number;
  const branch = pr.head.ref;
  const authorType = getAuthorType(pr.user.login);

  log(`PR #${prNumber} author: ${pr.user.login} (${authorType})`);

  if (authorType === "jules") {
    // Jules PR → use @jules mention (free)
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
    // Bot/Human PR → use Jules API
    const prompt = buildPrompt("coderabbit", fixInstructions, prNumber);
    return { action: "invoke_jules_api", prNumber, branch, prompt, authorType };
  }
}

function handleIssueComment(event: GitHubEvent): SupervisorResult {
  const comment = event.issue_comment;
  const issue = event.issue_comment?.issue;
  
  // Ensure it's a PR comment
  if (!comment || !issue?.pull_request) return { action: "none" };

  // Only process Codecov comments
  if (comment.user.login.toLowerCase() !== CONFIG.CODECOV_BOT) {
    return { action: "none" };
  }

  // Check if coverage decreased or warns about missing tests
  if (!comment.body.includes("Coverage") && !comment.body.includes("missing")) {
    return { action: "none" };
  }

  const prNumber = issue.number;
  // We need to fetch the PR to get the branch name since issue_comment payload doesn't have it
  const repo = process.env.GITHUB_REPOSITORY;
  const prJson = exec(`gh pr view ${prNumber} --json headRefName,author --repo ${repo}`);
  if (!prJson) return { action: "none" };
  
  const prData = JSON.parse(prJson);
  const branch = prData.headRefName;
  const authorType = getAuthorType(prData.author.login);

  log(`Codecov comment on PR #${prNumber} (branch: ${branch})`);

  if (authorType === "jules") {
     const message = `${CONFIG.JULES_MENTION} Codecov reports missing coverage. Please add tests.`;
     return { action: "mention_jules", prNumber, branch, message, authorType };
  } else {
     const prompt = buildPrompt("codecov", comment.body, prNumber);
     return { action: "invoke_jules_api", prNumber, branch, prompt, authorType };
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !existsSync(eventPath)) {
    throw new Error("GITHUB_EVENT_PATH not found");
  }

  const event: GitHubEvent = JSON.parse(readFileSync(eventPath, "utf8"));
  const eventName = process.env.GITHUB_EVENT_NAME;

  log(`Event: ${eventName} (${event.action || "n/a"})`);

  let result: SupervisorResult;

  if (eventName === "workflow_run") {
    result = handleWorkflowRun(event);
  } else if (eventName === "pull_request_review") {
    result = handleReview(event);
  } else if (eventName === "issue_comment") {
    result = handleIssueComment(event);
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
        postComment(result.prNumber, result.message);
      }
      break;

    case "invoke_jules_api":
      // Don't post comment - workflow will invoke Jules API
      log(`Prepared Jules API invocation for PR #${result.prNumber}`);
      break;

    case "trigger_coderabbit":
      if (result.prNumber) {
        log(`Triggering CodeRabbit review on PR #${result.prNumber}`);
        postComment(result.prNumber, CONFIG.CODERABBIT_TRIGGER);
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
