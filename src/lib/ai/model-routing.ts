import { DEFAULT_MODELS, getChatModelById } from "@/lib/ai/models";

export type ModelRole = "orchestrator" | "writer" | "checker" | "context";

// Mapping roles to our abstract "light", "middle", "large" types
const ROLE_TYPE_MAP: Record<ModelRole, "light" | "middle" | "large"> = {
  orchestrator: "large", // Complex planning
  writer: "large", // High quality prose
  checker: "large", // Reasoning/Consistency
  context: "middle", // Large context but faster (or maybe Large if context window is key)
};

/**
 * Gets the configured model ID for a specific role in the pipeline.
 * We resolve this by checking the user's preference for the role's mapped type.
 * Note: This function is now async because we need to fetch preferences.
 */
export async function getModelIdForRole(role: ModelRole): Promise<string> {
  const type = ROLE_TYPE_MAP[role];
  const { getSelectedModelId } = await import("@/lib/ai/models");
  return await getSelectedModelId(type);
}

/**
 * Returns the Gateway/Provider model ID string for a given role.
 */
export async function getGatewayIdForRole(role: ModelRole): Promise<string> {
  const modelId = await getModelIdForRole(role);
  // For OpenRouter, the ID is the Gateway ID usually
  return modelId;
}
