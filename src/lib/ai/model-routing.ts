/**
 * Model Routing
 *
 * Maps semantic roles to model tiers for the AI pipeline.
 *
 * ## Model Tiers
 *
 * | Tier     | Speed    | Cost   | Best For                                    |
 * |----------|----------|--------|---------------------------------------------|
 * | `light`  | Fastest  | Lowest | Simple tasks, summarization, quick lookups |
 * | `middle` | Balanced | Medium | Most tasks, balanced quality and speed      |
 * | `large`  | Slowest  | Highest| Complex reasoning, planning, creative writing|
 *
 * ## Model Roles
 *
 * | Role          | Maps To  | Purpose                                    |
 * |---------------|----------|--------------------------------------------|
 * | `orchestrator`| large    | Planning, outlining, complex logic         |
 * | `writer`      | large    | Prose generation, creative writing         |
 * | `checker`     | large    | Reviewing, consistency checking, reasoning |
 * | `context`     | middle   | Large context processing, analysis         |
 */

import { getSelectedModelId } from "@/lib/ai/models";
import {
	type ModelRole,
	type ModelTier,
	ROLE_TO_TIER,
} from "@/lib/ai/services/types";

// Re-export for backward compatibility
export type { ModelRole, ModelTier };
export { ROLE_TO_TIER };

// =============================================================================
// Functions
// =============================================================================

/**
 * Gets the configured model ID for a specific role in the pipeline.
 *
 * @example
 * ```ts
 * const modelId = await getModelIdForRole("writer");
 * // Returns user's configured "large" model (e.g., "anthropic/claude-3.5-sonnet")
 * ```
 */
export async function getModelIdForRole(role: ModelRole): Promise<string> {
	const tier = ROLE_TO_TIER[role];
	return await getSelectedModelId(tier);
}

/**
 * Gets the configured model ID for a specific tier.
 *
 * @example
 * ```ts
 * const modelId = await getModelIdForTier("middle");
 * // Returns user's configured "middle" model
 * ```
 */
export async function getModelIdForTier(tier: ModelTier): Promise<string> {
	return getSelectedModelId(tier);
}

/**
 * Returns the Gateway/Provider model ID string for a given role.
 * @deprecated Use getModelIdForRole instead
 */
export async function getGatewayIdForRole(role: ModelRole): Promise<string> {
	return getModelIdForRole(role);
}
