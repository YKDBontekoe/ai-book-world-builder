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

// =============================================================================
// Types
// =============================================================================

/**
 * Model Tier - Capability level of the AI model.
 *
 * - `light`  - Fast & cheap for simple tasks
 * - `middle` - Balanced for most tasks
 * - `large`  - Most capable for complex reasoning
 */
export type ModelTier = "light" | "middle" | "large";

/**
 * Model Role - Semantic role in the AI pipeline.
 *
 * - `orchestrator` - Planning, outlining, complex logic
 * - `writer`       - Prose generation, creative writing
 * - `checker`      - Reviewing, consistency checking
 * - `context`      - Large context processing, analysis
 */
export type ModelRole = "orchestrator" | "writer" | "checker" | "context";

// =============================================================================
// Mappings
// =============================================================================

/**
 * Maps semantic roles to model tiers.
 *
 * This allows us to use meaningful role names in code while
 * the user's tier preferences control which actual model is used.
 */
export const ROLE_TO_TIER: Record<ModelRole, ModelTier> = {
	orchestrator: "large", // Complex planning requires highest capability
	writer: "large", // Creative writing benefits from best models
	checker: "large", // Reasoning and consistency needs smart models
	context: "middle", // Large context but speed matters
};

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
	return await getSelectedModelId(tier);
}

/**
 * Returns the Gateway/Provider model ID string for a given role.
 * @deprecated Use getModelIdForRole instead
 */
export async function getGatewayIdForRole(role: ModelRole): Promise<string> {
	return getModelIdForRole(role);
}
