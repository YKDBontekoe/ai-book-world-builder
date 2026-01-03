/**
 * AI Services Types
 *
 * Shared types for all AI generation services.
 */

import type { LanguageModelUsage } from "ai";
import type { z } from "zod";

// =============================================================================
// Model Tier System
// =============================================================================

/**
 * Model Tier - Defines the capability level of the AI model to use.
 *
 * The tier system abstracts away specific model names, allowing user preferences
 * to control which actual model is used for each tier.
 *
 * @example
 * ```ts
 * // Use a fast, cheap model for simple tasks
 * await generateText(prompt, { modelTier: "light" });
 *
 * // Use a balanced model for most tasks
 * await generateText(prompt, { modelTier: "middle" });
 *
 * // Use the most capable model for complex reasoning
 * await generateText(prompt, { modelTier: "large" });
 * ```
 */
export type ModelTier = "light" | "middle" | "large";

/**
 * Model tiers with their intended use cases:
 *
 * | Tier     | Speed    | Cost   | Best For                                    |
 * |----------|----------|--------|---------------------------------------------|
 * | `light`  | Fastest  | Lowest | Simple tasks, summarization, quick lookups |
 * | `middle` | Balanced | Medium | Most tasks, balanced quality and speed      |
 * | `large`  | Slowest  | Highest| Complex reasoning, planning, creative writing|
 */
export const MODEL_TIER_DESCRIPTIONS: Record<ModelTier, string> = {
	light: "Fast & cheap - simple tasks, summaries, quick responses",
	middle: "Balanced - most tasks, good quality at reasonable speed",
	large: "Most capable - complex reasoning, planning, creative writing",
};

/**
 * Model Role - Semantic roles for different pipeline stages.
 *
 * Each role maps to a model tier to ensure the right capability level.
 *
 * | Role          | Maps To  | Purpose                                    |
 * |---------------|----------|--------------------------------------------|
 * | `orchestrator`| large    | Planning, outlining, complex logic         |
 * | `writer`      | large    | Prose generation, creative writing         |
 * | `checker`     | large    | Reviewing, consistency checking, reasoning |
 * | `context`     | middle   | Large context processing, analysis         |
 */
export type ModelRole = "orchestrator" | "writer" | "checker" | "context";

/**
 * Maps semantic roles to model tiers.
 *
 * This allows us to use meaningful role names in code (e.g., "writer") while
 * allowing the user's tier preferences to control which actual model is used.
 */
export const ROLE_TO_TIER: Record<ModelRole, ModelTier> = {
	orchestrator: "large", // Complex planning requires highest capability
	writer: "large", // Creative writing benefits from best models
	checker: "large", // Reasoning and consistency needs smart models
	context: "middle", // Large context but speed matters
};

// =============================================================================
// Generation Options
// =============================================================================

/**
 * Options for AI generation calls.
 *
 * Model selection priority (first match wins):
 * 1. `modelId` - Explicit model ID (e.g., "anthropic/claude-3.5-sonnet")
 * 2. `modelRole` - Semantic role (e.g., "writer" → large tier)
 * 3. `modelTier` - Direct tier selection (e.g., "middle")
 * 4. Default: "large" tier for best quality
 */
export interface AIGenerationOptions {
	/**
	 * Explicit model ID to use.
	 * Overrides all other model selection options.
	 * @example "anthropic/claude-3.5-sonnet"
	 */
	modelId?: string;

	/**
	 * Semantic role for pipeline-based model selection.
	 * Maps to a tier via ROLE_TO_TIER mapping.
	 * @example "writer" → uses "large" tier
	 */
	modelRole?: ModelRole;

	/**
	 * Direct tier selection for model capability.
	 * Use when you don't have a specific role but know the complexity.
	 * @example "middle" for balanced speed/quality
	 */
	modelTier?: ModelTier;

	/**
	 * Temperature for generation (0-2).
	 * Lower = more deterministic, Higher = more creative.
	 * @default Varies by task (typically 0.7 for creative, 0.3 for factual)
	 */
	temperature?: number;

	/**
	 * Maximum tokens to generate.
	 * @default Model's default limit
	 */
	maxTokens?: number;

	/**
	 * System prompt to set the AI's behavior.
	 * @example "You are an expert creative writing assistant."
	 */
	system?: string;
}

/**
 * Options for text generation.
 */
export interface AITextOptions extends AIGenerationOptions {
	prompt: string;
}

/**
 * Options for structured object generation.
 */
export interface AIObjectOptions<T extends z.ZodType>
	extends AIGenerationOptions {
	prompt: string;
	schema: T;
}

// =============================================================================
// Generation Results
// =============================================================================

/**
 * Success result from AI generation.
 */
export interface AISuccess<T> {
	success: true;
	data: T;
	usage?: LanguageModelUsage;
	modelId?: string;
}

/**
 * Error result from AI generation.
 */
export interface AIError {
	success: false;
	error: string;
}

/**
 * Result type for AI operations.
 * Use type guards or check `success` property to narrow the type.
 *
 * @example
 * ```ts
 * const result = await aiClient.generateText({ prompt: "..." });
 * if (result.success) {
 *   console.log(result.data.text);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export type AIResult<T> = AISuccess<T> | AIError;

// =============================================================================
// Helper Functions
// =============================================================================

export function aiSuccess<T>(
	data: T,
	usage?: LanguageModelUsage,
	modelId?: string,
): AISuccess<T> {
	return { success: true, data, usage, modelId };
}

export function aiError(error: string): AIError {
	return { success: false, error };
}

// =============================================================================
// Common Generation Result Types
// =============================================================================

export interface TextGenerationResult {
	text: string;
}

export interface ObjectGenerationResult<T> {
	object: T;
}

export interface AIGenerationResult {
	usage?: LanguageModelUsage;
	modelId?: string;
}
