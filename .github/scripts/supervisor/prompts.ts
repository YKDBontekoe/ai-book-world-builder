import { existsSync, readFileSync } from "node:fs";
import { CONFIG } from "./utils";

type ErrorCategory = "TYPESCRIPT" | "TEST" | "LINT" | "DEPENDENCY" | "UNKNOWN";

function categorizeError(logs: string): ErrorCategory {
  const lower = logs.toLowerCase();

  if (lower.includes("ts") || lower.includes("type mismatch") || /TS\d+/.test(logs)) return "TYPESCRIPT";
  if (lower.includes("failing test") || (lower.includes("expected") && lower.includes("received")) || lower.includes("snapshot failed")) return "TEST";
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

function getProjectStandards(): string {
  try {
    if (existsSync("AGENTS.md")) {
      return readFileSync("AGENTS.md", "utf8");
    }
  } catch (e) {
    // ignore
  }
  return "";
}

export function buildPrompt(type: "ci_failure" | "coderabbit" | "codecov", details: string, prNumber: number, extraInstructions = ""): string {
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
