import { chatModels, getChatModelById } from "./models";

export type ModelRole = "orchestrator" | "writer" | "checker" | "context";

const ROLE_MODEL_MAP: Record<ModelRole, string> = {
  orchestrator: "anthropic-claude-opus-4-5", // Claude Opus 4.5
  writer: "anthropic-claude-sonnet-4-5", // Claude Sonnet 4.5
  checker: "deepseek-reasoner", // DeepSeek V3 (Reasoner)
  context: "google-gemini-3-pro", // Gemini 3 Pro
};

/**
 * Gets the configured model ID for a specific role in the pipeline.
 * Falls back to a default if the preferred model is not configured.
 */
export function getModelIdForRole(role: ModelRole): string {
  const preferredId = ROLE_MODEL_MAP[role];
  const model = getChatModelById(preferredId);

  if (model) return preferredId;

  // Fallbacks if specific models aren't available (e.g. key missing)
  // This logic could be expanded to check for availability
  return "gpt-4o-mini";
}

/**
 * Returns the Vercel SDK model ID string (gateway ID) for a given role.
 */
export function getGatewayIdForRole(role: ModelRole): string {
  const modelId = getModelIdForRole(role);
  const model = getChatModelById(modelId);
  return model?.gatewayId || "openai/gpt-4o-mini";
}
