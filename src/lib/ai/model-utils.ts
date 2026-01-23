import type { ChatModel } from "@/lib/ai/models";

/**
 * Checks if a model is free based on its pricing.
 * Considers a model free if both input and output pricing are strictly 0.
 */
export function isModelFree(
	model: ChatModel | { pricing?: { input: string; output: string } },
): boolean {
	if (!model.pricing) return false;
	const inputPrice = parseFloat(model.pricing.input || "0");
	const outputPrice = parseFloat(model.pricing.output || "0");
	return inputPrice === 0 && outputPrice === 0;
}
