import { appendFileSync } from "node:fs";

export const CONFIG = {
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

export function log(msg: string): void {
  console.log(`[Supervisor] ${msg}`);
}

export function setOutput(key: string, value: string): void {
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

export function getAuthorType(login: string): "jules" | "bot" | "human" {
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
