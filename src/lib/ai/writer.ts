"use server";

import { generationService } from "@/lib/ai/services";
import type { GenerationOptions } from "@/lib/ai/services/generation-service";

/**
 * Continues writing a story based on context and previous content.
 * (Server Action)
 */
export async function continueWriting(
	context: string,
	previousContent: string,
	options: GenerationOptions = {},
) {
	return generationService.continueWriting(context, previousContent, options);
}

/**
 * Drafts a scene from scratch using scene card details.
 * (Server Action)
 */
export async function draftScene(
	sceneTitle: string,
	cardData: {
		purpose: string;
		setting?: string;
		emotionalBeats?: string[] | string;
	},
	instructions?: string,
	options: GenerationOptions = {},
) {
	return generationService.draftScene(
		sceneTitle,
		cardData,
		instructions,
		options,
	);
}

/**
 * Suggests plot developments.
 * (Server Action)
 */
export async function generateIdeas(
	context: string,
	currentText: string,
	options: GenerationOptions = {},
) {
	return generationService.generateIdeas(context, currentText, options);
}

/**
 * Rewrites a selected text.
 * (Server Action)
 */
export async function rewriteSelection(
	selection: string,
	instruction: string,
	options: GenerationOptions = {},
) {
	return generationService.rewriteSelection(selection, instruction, options);
}

// Re-export generationService for server-side usage if needed
// Actually, we should probably NOT export it from a "use server" file if it's a class instance.
// But Next.js allows exporting it if it's imported by another server-side file?
// No, "use server" files should ONLY export async functions if they are to be consumed by Client Components.
// If it's only consumed by other server modules, it doesn't need "use server".
// But since Client Components DO import this file, we must strictly adhere to the async function rule.
// Non-function exports will cause the "Only async functions are allowed" error.

// We'll keep generationService in writer-service.ts for other server modules to use directly.
