/**
 * Base AI Service
 *
 * Abstract base class for all AI-powered services.
 * Extends BaseService for auth/project access and adds AI-specific utilities.
 *
 * ## Model Selection
 *
 * Services can select models in three ways:
 *
 * 1. **By Role** - Use semantic roles (recommended for pipeline tasks):
 *    ```ts
 *    await this.generateText(prompt, { modelRole: "writer" });
 *    ```
 *
 * 2. **By Tier** - Use capability tiers directly:
 *    ```ts
 *    await this.generateText(prompt, { modelTier: "light" }); // Fast & cheap
 *    await this.generateText(prompt, { modelTier: "middle" }); // Balanced
 *    await this.generateText(prompt, { modelTier: "large" }); // Most capable
 *    ```
 *
 * 3. **By ID** - Use a specific model ID:
 *    ```ts
 *    await this.generateText(prompt, { modelId: "anthropic/claude-3.5-sonnet" });
 *    ```
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

import "server-only";

import type { z } from "zod";
import {
	getModelIdForRole,
	getModelIdForTier,
	type ModelRole,
	type ModelTier,
} from "@/lib/ai/model-routing";
import { aiClient } from "@/lib/ai/services/ai-client";
import {
	type AIGenerationOptions,
	type AIResult,
	aiError,
} from "@/lib/ai/services/types";
import { BaseService } from "@/lib/services/base-service";

/**
 * Abstract base class for AI-powered services.
 *
 * Provides:
 * - All BaseService auth/project access patterns
 * - AI generation utilities with proper error handling
 * - Model resolution based on tiers (light/middle/large) or roles
 */
export abstract class BaseAIService extends BaseService {
	// =========================================================================
	// Model Resolution
	// =========================================================================

	/**
	 * Get the model ID for a specific task role.
	 *
	 * @example
	 * ```ts
	 * const modelId = await this.getModelForRole("writer");
	 * // Returns user's configured "large" tier model
	 * ```
	 */
	protected async getModelForRole(role: ModelRole): Promise<string> {
		return getModelIdForRole(role);
	}

	/**
	 * Get the model ID for a capability tier.
	 *
	 * @param tier - "light" (fast/cheap), "middle" (balanced), "large" (capable)
	 *
	 * @example
	 * ```ts
	 * // Fast model for simple tasks
	 * const lightModel = await this.getModelForTier("light");
	 *
	 * // Balanced model for most tasks
	 * const middleModel = await this.getModelForTier("middle");
	 *
	 * // Most capable model for complex reasoning
	 * const largeModel = await this.getModelForTier("large");
	 * ```
	 */
	protected async getModelForTier(tier: ModelTier): Promise<string> {
		return getModelIdForTier(tier);
	}

	// =========================================================================
	// Text Generation
	// =========================================================================

	/**
	 * Generate text using AI.
	 *
	 * @example
	 * ```ts
	 * // With role-based selection
	 * const result = await this.generateText(prompt, { modelRole: "writer" });
	 *
	 * // With tier-based selection
	 * const result = await this.generateText(prompt, { modelTier: "middle" });
	 * ```
	 */
	protected async generateText(
		prompt: string,
		options?: AIGenerationOptions,
	): Promise<AIResult<{ text: string }>> {
		return aiClient.generateText({ prompt, options });
	}

	/**
	 * Generate text with a specific system prompt.
	 */
	protected async generateTextWithSystem(
		system: string,
		prompt: string,
		options?: Omit<AIGenerationOptions, "system">,
	): Promise<AIResult<{ text: string }>> {
		return aiClient.generateText({ prompt, options: { ...options, system } });
	}

	// =========================================================================
	// Object Generation
	// =========================================================================

	/**
	 * Generate a structured object using AI.
	 *
	 * @example
	 * ```ts
	 * const schema = z.object({ title: z.string() });
	 * const result = await this.generateObject(prompt, schema, { modelRole: "orchestrator" });
	 * ```
	 */
	protected async generateObject<T extends z.ZodType>(
		prompt: string,
		schema: T,
		options?: AIGenerationOptions,
	): Promise<AIResult<{ object: z.infer<T> }>> {
		return aiClient.generateObject({ prompt, schema, options });
	}

	/**
	 * Generate a structured object with a specific system prompt.
	 */
	protected async generateObjectWithSystem<T extends z.ZodType>(
		system: string,
		prompt: string,
		schema: T,
		options?: Omit<AIGenerationOptions, "system">,
	): Promise<AIResult<{ object: z.infer<T> }>> {
		return aiClient.generateObject({
			prompt,
			schema,
			options: { ...options, system },
		});
	}

	// =========================================================================
	// Safe AI Execution
	// =========================================================================

	/**
	 * Execute an AI generation operation safely, catching any errors.
	 */
	protected async safeAIExecute<T>(
		operation: () => Promise<AIResult<T>>,
		fallbackError = "AI operation failed",
	): Promise<AIResult<T>> {
		try {
			return await operation();
		} catch (error) {
			console.error("[BaseAIService] AI operation failed:", error);
			return aiError(error instanceof Error ? error.message : fallbackError);
		}
	}
}
