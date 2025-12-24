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

import { BaseAIService } from "@/lib/ai/services/base-ai-service";

// =============================================================================
// Types
// =============================================================================

export interface GenerationOptions {
	/** Specific model ID to use */
	modelId?: string;
	/** Writing style guidance */
	style?: string;
	/** Temperature for generation (0-2) */
	temperature?: number;
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
	): Promise<{ text?: string; error?: string }> {
		const systemPrompt = `You are an expert creative writing assistant. Your task is to continue the story seamlessly based on the provided text. Maintain the tone, style, and character voices. ${
			options.style ? `Use a ${options.style} writing style.` : ""
		}`;

		const prompt = `Context (Chapter/Scene info):\n${context}\n\nPrevious Text:\n${previousContent}\n\nContinue the story:`;

		const result = await this.generateTextWithSystem(systemPrompt, prompt, {
			modelId: options.modelId,
			modelRole: "writer",
			temperature: options.temperature ?? 0.7,
		});

		if (!result.success) {
			return { error: result.error };
		}

		return { text: result.data.text };
	}

	/**
	 * Drafts a scene from scratch using scene card details.
	 */
	async draftScene(
		sceneTitle: string,
		cardData: SceneCardData,
		instructions?: string,
		options: GenerationOptions = {},
	): Promise<{ text?: string; error?: string }> {
		const systemPrompt = `You are The Writer. Your goal is to write compelling, high-quality prose.

Write the scene based on the scene card and instructions.
Output ONLY the story prose.`;

		const emotionalBeats = Array.isArray(cardData.emotionalBeats)
			? cardData.emotionalBeats.join(", ")
			: cardData.emotionalBeats || "None";

		const prompt = `
Scene Title: ${sceneTitle}
Purpose: ${cardData.purpose}
Setting: ${cardData.setting || "Not specified"}
Emotional Beats: ${emotionalBeats}

Instructions: ${instructions || "Draft the scene."}
`;

		const result = await this.generateTextWithSystem(systemPrompt, prompt, {
			modelId: options.modelId,
			modelRole: "writer",
			temperature: options.temperature ?? 0.7,
		});

		if (!result.success) {
			return { error: result.error };
		}

		return { text: result.data.text };
	}

	/**
	 * Generate plot development ideas.
	 */
	async generateIdeas(
		context: string,
		currentText: string,
		options: GenerationOptions = {},
	): Promise<{ ideas?: string; error?: string }> {
		const systemPrompt =
			"You are a creative writing coach. Provide 3 distinct and interesting options for what could happen next in the story.";

		const prompt = `Context:\n${context}\n\nCurrent Text:\n${currentText}\n\nSuggest 3 plot developments:`;

		const result = await this.generateTextWithSystem(systemPrompt, prompt, {
			modelId: options.modelId,
			modelRole: "writer",
		});

		if (!result.success) {
			return { error: result.error };
		}

		return { ideas: result.data.text };
	}

	/**
	 * Rewrite selected text according to instructions.
	 */
	async rewriteSelection(
		selection: string,
		instruction: string,
		options: GenerationOptions = {},
	): Promise<{ text?: string; error?: string }> {
		const systemPrompt =
			"You are an expert editor. Rewrite the selected text according to the user's instruction. Output ONLY the rewritten text, no explanations.";

		const prompt = `Original Text:\n"${selection}"\n\nInstruction: ${instruction}\n\nRewritten Text:`;

		const result = await this.generateTextWithSystem(systemPrompt, prompt, {
			modelId: options.modelId,
			modelRole: "writer",
		});

		if (!result.success) {
			return { error: result.error };
		}

		return { text: result.data.text };
	}
}

export const generationService = new GenerationService();
