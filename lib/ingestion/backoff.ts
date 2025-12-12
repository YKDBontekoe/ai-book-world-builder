import type { SourceMaterial } from "@/lib/db/schema";

export const DEFAULT_BASE_BACKOFF_MS = 1000;
export const DEFAULT_MAX_ATTEMPTS = 3;

export type BackoffConfig = {
  baseDelayMs?: number;
  maxAttempts?: number;
};

export type BackoffResult = {
  nextAttempts: number;
  nextAttemptAt: Date;
  status: SourceMaterial["status"];
};

export function calculateBackoff({
  attempts,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  baseDelayMs = DEFAULT_BASE_BACKOFF_MS,
}: {
  attempts: number;
  maxAttempts?: number;
  baseDelayMs?: number;
}): BackoffResult {
  const nextAttempts = attempts + 1;
  const shouldFail = nextAttempts >= maxAttempts;
  const delayMs = baseDelayMs * 2 ** attempts;
  const nextAttemptAt = shouldFail
    ? new Date()
    : new Date(Date.now() + delayMs);

  return {
    nextAttempts,
    nextAttemptAt,
    status: shouldFail ? "failed" : "uploaded",
  };
}
