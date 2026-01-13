/**
 * Generation Service
 *
 * Handles AI-powered content generation for creative writing.
 * This includes:
 * - Story continuation
 * - Scene drafting
 * - Idea generation
 * - Text rewriting
 */

import "server-only";

import { writerPrompts } from "@/lib/ai/prompts/writer-prompts";
import { aiClient } from "@/lib/ai/services/ai-client";
import type {
	AIGenerationOptions,
	AIGenerationResult,
} from "@/lib/ai/services/types";
import { BaseService } from "@/lib/services/base-service";

// =============================================================================
// Types
// =============================================================================

export interface GenerationOptions extends AIGenerationOptions {
	/** Writing style guidance */
	style?: string;
}

export interface SceneCardData {
	purpose: string;
	setting?: string;
	emotionalBeats?: string[] | string;
}

// =============================================================================
// Service
// =============================================================================

export class GenerationService extends BaseService {
	/**
	 * Continues writing a story based on context and previous content.
	 */
	async continueWriting(
		context: string,
		previousContent: string,
		options: GenerationOptions = {},
	): Promise<{ text?: string; error?: string } & AIGenerationResult> {
		const systemPrompt = writerPrompts.continueWriting.system(options.style);
		const prompt = writerPrompts.continueWriting.user({
			context,
			previousContent,
		});

		const result = await aiClient.generateText({
			prompt,
			options: {
				...options,
				system: systemPrompt,
				modelRole: "writer",
				temperature: options.temperature ?? 0.7,
			},
		});

		if (!result.success) {
			return { error: result.error };
		}

		return {
			text: result.data.text,
			usage: result.usage,
			modelId: result.modelId,
		};
	}

	/**
	 * Drafts a scene from scratch using scene card details.
	 */
	async draftScene(
		sceneTitle: string,
		cardData: SceneCardData,
		instructions?: string,
		options: GenerationOptions = {},
	): Promise<{ text?: string; error?: string } & AIGenerationResult> {
		const systemPrompt = writerPrompts.draftScene.system();
		const prompt = writerPrompts.draftScene.user({
			sceneTitle,
			purpose: cardData.purpose,
			setting: cardData.setting,
			emotionalBeats: Array.isArray(cardData.emotionalBeats)
				? cardData.emotionalBeats.join(", ")
				: cardData.emotionalBeats,
			instructions,
		});

		const result = await aiClient.generateText({
			prompt,
			options: {
				...options,
				system: systemPrompt,
				modelRole: "writer",
				temperature: options.temperature ?? 0.7,
			},
		});

		if (!result.success) {
			return { error: result.error };
		}

		return {
			text: result.data.text,
			usage: result.usage,
			modelId: result.modelId,
		};
	}

	/**
	 * Generate plot development ideas.
	 */
	async generateIdeas(
		context: string,
		currentText: string,
		options: GenerationOptions = {},
	): Promise<{ ideas?: string; error?: string } & AIGenerationResult> {
		const systemPrompt = writerPrompts.generateIdeas.system();
		const prompt = writerPrompts.generateIdeas.user({ context, currentText });

		const result = await aiClient.generateText({
			prompt,
			options: {
				...options,
				system: systemPrompt,
				modelRole: "writer",
				temperature: options.temperature ?? 0.7,
			},
		});

		if (!result.success) {
			return { error: result.error };
		}

		return {
			ideas: result.data.text,
			usage: result.usage,
			modelId: result.modelId,
		};
	}

	/**
	 * Rewrite selected text according to instructions.
	 */
	async rewriteSelection(
		selection: string,
		instruction: string,
		options: GenerationOptions = {},
	): Promise<{ text?: string; error?: string } & AIGenerationResult> {
		const systemPrompt = writerPrompts.rewriteSelection.system();
		const prompt = writerPrompts.rewriteSelection.user({
			selection,
			instruction,
		});

		const result = await aiClient.generateText({
			prompt,
			options: {
				...options,
				system: systemPrompt,
				modelRole: "writer",
				temperature: options.temperature ?? 0.5,
			},
		});

		if (!result.success) {
			return { error: result.error };
		}

		return {
			text: result.data.text,
			usage: result.usage,
			modelId: result.modelId,
		};
	}
}

export const generationService = new GenerationService();
