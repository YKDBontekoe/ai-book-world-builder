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
import { BaseAIService } from "@/lib/ai/services/base-ai-service";
import type {
	AIGenerationOptions,
	AIGenerationResult,
} from "@/lib/ai/services/types";

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

export class GenerationService extends BaseAIService {
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

		const result = await this.generateTextWithSystem(systemPrompt, prompt, {
			modelId: options.modelId,
			modelRole: "writer",
			temperature: options.temperature ?? 0.7,
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

		const result = await this.generateTextWithSystem(systemPrompt, prompt, {
			modelId: options.modelId,
			modelRole: "writer",
			temperature: options.temperature ?? 0.7,
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

		const result = await this.generateTextWithSystem(systemPrompt, prompt, {
			modelId: options.modelId,
			modelRole: "writer",
			temperature: options.temperature ?? 0.7,
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

		const result = await this.generateTextWithSystem(systemPrompt, prompt, {
			modelId: options.modelId,
			modelRole: "writer",
			temperature: options.temperature ?? 0.5,
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
	 * Expands a skeletal scene or notes into full prose.
	 */
	async expandScene(
		sceneTitle: string,
		notes: string,
		options: GenerationOptions = {},
	): Promise<{ text?: string; error?: string } & AIGenerationResult> {
		const systemPrompt = writerPrompts.expandScene.system();
		const prompt = writerPrompts.expandScene.user({
			sceneTitle,
			notes,
		});

		const result = await this.generateTextWithSystem(systemPrompt, prompt, {
			modelId: options.modelId,
			modelRole: "writer",
			temperature: options.temperature ?? 0.7,
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
	 * Rewrites an entire scene based on instructions.
	 */
	async rewriteScene(
		sceneTitle: string,
		originalContent: string,
		instructions: string,
		options: GenerationOptions = {},
	): Promise<{ text?: string; error?: string } & AIGenerationResult> {
		const systemPrompt = writerPrompts.rewriteScene.system();
		const prompt = writerPrompts.rewriteScene.user({
			sceneTitle,
			originalContent,
			instructions,
		});

		const result = await this.generateTextWithSystem(systemPrompt, prompt, {
			modelId: options.modelId,
			modelRole: "writer",
			temperature: options.temperature ?? 0.7,
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
