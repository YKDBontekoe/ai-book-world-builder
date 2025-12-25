/**
 * AI Client
 *
 * Centralized facade for all Vercel AI SDK interactions.
 * All AI services should use this client instead of calling the SDK directly.
 *
 * ## Model Selection
 *
 * The client supports three ways to select a model (in priority order):
 *
 * 1. **Explicit model ID** - Use a specific model
 *    ```ts
 *    { modelId: "anthropic/claude-3.5-sonnet" }
 *    ```
 *
 * 2. **Role-based** - Use semantic roles that map to tiers
 *    ```ts
 *    { modelRole: "writer" }  // → uses "large" tier
 *    { modelRole: "context" } // → uses "middle" tier
 *    ```
 *
 * 3. **Tier-based** - Directly specify capability tier
 *    ```ts
 *    { modelTier: "light" }  // Fast & cheap
 *    { modelTier: "middle" } // Balanced
 *    { modelTier: "large" }  // Most capable
 *    ```
 */

import { generateObject, generateText, streamText } from "ai";
import type { z } from "zod";
import { getSelectedModelId } from "@/lib/ai/models";
import { myProvider } from "@/lib/ai/providers";
import {
	type AIGenerationOptions,
	type AIResult,
	aiError,
	aiSuccess,
	ROLE_TO_TIER,
} from "@/lib/ai/services/types";

// =============================================================================
// Types
// =============================================================================

interface TextGenerationParams {
	prompt: string;
	options?: AIGenerationOptions;
}

interface ObjectGenerationParams<T extends z.ZodType> {
	prompt: string;
	schema: T;
	options?: AIGenerationOptions;
}

interface StreamTextParams {
	prompt: string;
	options?: AIGenerationOptions;
	onChunk?: (chunk: string) => void;
}

// =============================================================================
// Model Resolution
// =============================================================================

/**
 * Resolves the model ID to use based on options.
 *
 * Priority order:
 * 1. Explicit `modelId` (e.g., "anthropic/claude-3.5-sonnet")
 * 2. `modelRole` → mapped to tier via ROLE_TO_TIER
 * 3. `modelTier` → direct tier selection
 * 4. Default: "large" tier for best quality
 *
 * @example
 * ```ts
 * // Explicit model
 * resolveModelId({ modelId: "openai/gpt-4o" }) // → "openai/gpt-4o"
 *
 * // Role-based (writer → large)
 * resolveModelId({ modelRole: "writer" }) // → user's configured "large" model
 *
 * // Tier-based
 * resolveModelId({ modelTier: "middle" }) // → user's configured "middle" model
 * ```
 */
async function resolveModelId(options?: AIGenerationOptions): Promise<string> {
	// 1. Explicit model ID takes priority
	if (options?.modelId) {
		return options.modelId;
	}

	// 2. Role-based selection (maps role → tier → model)
	if (options?.modelRole) {
		const tier = ROLE_TO_TIER[options.modelRole];
		return getSelectedModelId(tier);
	}

	// 3. Direct tier selection
	if (options?.modelTier) {
		return getSelectedModelId(options.modelTier);
	}

	// 4. Default to "large" for best quality
	return getSelectedModelId("large");
}

// =============================================================================
// AI Client
// =============================================================================

export const aiClient = {
	/**
	 * Generate text using the AI model.
	 *
	 * @example
	 * ```ts
	 * // Simple usage with defaults (large tier)
	 * const result = await aiClient.generateText({
	 *   prompt: "Write a story opening"
	 * });
	 *
	 * // With specific tier
	 * const result = await aiClient.generateText({
	 *   prompt: "Summarize this text",
	 *   options: { modelTier: "light" } // Fast & cheap
	 * });
	 *
	 * // With role-based selection
	 * const result = await aiClient.generateText({
	 *   prompt: "Continue the story",
	 *   options: { modelRole: "writer" } // Uses "large" tier
	 * });
	 * ```
	 */
	async generateText(
		params: TextGenerationParams,
	): Promise<AIResult<{ text: string }>> {
		try {
			const modelId = await resolveModelId(params.options);

			const result = await generateText({
				model: myProvider.languageModel(modelId),
				system: params.options?.system,
				prompt: params.prompt,
				temperature: params.options?.temperature,
				maxOutputTokens: params.options?.maxTokens,
			});

			return aiSuccess({ text: result.text });
		} catch (error) {
			console.error("[AIClient] Text generation failed:", error);
			return aiError(
				error instanceof Error ? error.message : "Text generation failed",
			);
		}
	},

	/**
	 * Generate a structured object using the AI model.
	 *
	 * @example
	 * ```ts
	 * const schema = z.object({ title: z.string(), chapters: z.array(...) });
	 *
	 * const result = await aiClient.generateObject({
	 *   prompt: "Create a book outline",
	 *   schema,
	 *   options: { modelRole: "orchestrator" } // Complex planning
	 * });
	 * ```
	 */
	async generateObject<T extends z.ZodType>(
		params: ObjectGenerationParams<T>,
	): Promise<AIResult<{ object: z.infer<T> }>> {
		try {
			const modelId = await resolveModelId(params.options);

			const result = await generateObject({
				model: myProvider.languageModel(modelId),
				system: params.options?.system,
				schema: params.schema,
				prompt: params.prompt,
				temperature: params.options?.temperature,
				maxOutputTokens: params.options?.maxTokens,
			});

			return aiSuccess({ object: result.object });
		} catch (error) {
			console.error("[AIClient] Object generation failed:", error);
			return aiError(
				error instanceof Error ? error.message : "Object generation failed",
			);
		}
	},

	/**
	 * Stream text generation (returns the full text after completion).
	 * For real streaming, use the raw SDK with the response stream.
	 *
	 * @example
	 * ```ts
	 * const result = await aiClient.streamText({
	 *   prompt: "Write a long story",
	 *   options: { modelTier: "large" },
	 *   onChunk: (chunk) => process.stdout.write(chunk)
	 * });
	 * ```
	 */
	async streamText(
		params: StreamTextParams,
	): Promise<AIResult<{ text: string }>> {
		try {
			const modelId = await resolveModelId(params.options);

			const result = streamText({
				model: myProvider.languageModel(modelId),
				system: params.options?.system,
				prompt: params.prompt,
				temperature: params.options?.temperature,
				maxOutputTokens: params.options?.maxTokens,
			});

			// Collect chunks if callback provided
			let fullText = "";
			for await (const chunk of result.textStream) {
				fullText += chunk;
				params.onChunk?.(chunk);
			}

			return aiSuccess({ text: fullText });
		} catch (error) {
			console.error("[AIClient] Stream generation failed:", error);
			return aiError(
				error instanceof Error ? error.message : "Stream generation failed",
			);
		}
	},
};

export type AIClient = typeof aiClient;
