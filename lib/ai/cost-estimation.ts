/**
 * Cost estimation utilities for book generation
 * Uses pricing data from the AI SDK models
 */

import { type ChatModel, getChatModelById } from "./models";

// Image generation model pricing (per image)
export const imageModels = [
	{
		id: "dall-e-3",
		name: "DALL-E 3",
		provider: "OpenAI",
		description: "High quality, artistic",
		pricing: { perImage: 0.04 },
	},
	{
		id: "dall-e-3-hd",
		name: "DALL-E 3 HD",
		provider: "OpenAI",
		description: "Highest quality, detailed",
		pricing: { perImage: 0.08 },
	},
	{
		id: "stable-diffusion-xl",
		name: "Stable Diffusion XL",
		provider: "Stability",
		description: "Fast, customizable",
		pricing: { perImage: 0.002 },
	},
] as const;

export type ImageModelId = (typeof imageModels)[number]["id"];

export const getImageModelById = (id?: string) =>
	imageModels.find((m) => m.id === id) || imageModels[0];

// Token estimation constants
const TOKENS_PER_WORD = 1.3; // Average tokens per word for English text
const WORDS_PER_PAGE = 250; // Standard page word count

export interface GenerationCostEstimate {
	// Main content costs
	writerCost: number;
	reviewerCost: number;

	// Additional feature costs
	prologueCost: number;
	epilogueCost: number;
	coverArtCost: number;
	blurbCost: number;
	characterSheetsCost: number;
	chapterSummariesCost: number;
	consistencyCheckCost: number;

	// Totals
	contentCost: number;
	featuresCost: number;
	totalCost: number;

	// Metadata
	estimatedWords: number;
	estimatedTokens: number;
}

export interface CostEstimateInput {
	totalChapters: number;
	pagesPerChapter: number;
	revisionRounds: number;
	writerModelId: string;
	reviewerModelId: string;
	imageModelId?: string;

	// Optional features
	includePrologue?: boolean;
	includeEpilogue?: boolean;
	generateFrontCover?: boolean;
	generateBackCoverBlurb?: boolean;
	generateCharacterSheets?: boolean;
	generateChapterSummaries?: boolean;
	runConsistencyCheck?: boolean;
}

/**
 * Calculate the cost for generating text with a given model
 * @param tokens - Number of output tokens
 * @param model - Chat model object
 * @returns Cost in USD
 */
function calculateTokenCost(tokens: number, model?: ChatModel): number {
	if (!model?.pricing?.output) return 0;
	const pricePerMillion = parseFloat(model.pricing.output);
	return (tokens / 1_000_000) * pricePerMillion;
}

/**
 * Estimate tokens for a piece of text based on word count
 */
function estimateTokens(words: number): number {
	return Math.ceil(words * TOKENS_PER_WORD);
}

/**
 * Calculate comprehensive cost estimate for book generation
 */
export async function estimateGenerationCost(
	input: CostEstimateInput,
): Promise<GenerationCostEstimate> {
	const writerModel = await getChatModelById(input.writerModelId);
	const reviewerModel = await getChatModelById(input.reviewerModelId);
	const imageModel = getImageModelById(input.imageModelId);

	// Main content estimation
	const wordsPerChapter = input.pagesPerChapter * WORDS_PER_PAGE;
	const totalWords = input.totalChapters * wordsPerChapter;
	const totalTokens = estimateTokens(totalWords);

	// Writer cost: tokens for initial draft
	const writerTokens = totalTokens;
	const writerCost = calculateTokenCost(writerTokens, writerModel);

	// Reviewer cost: reading + feedback (roughly 50% of content tokens per round)
	const reviewTokensPerRound = Math.ceil(totalTokens * 0.5);
	const reviewerCost =
		calculateTokenCost(reviewTokensPerRound, reviewerModel) *
		input.revisionRounds;

	// Additional feature costs using model pricing
	const prologueTokens = estimateTokens(wordsPerChapter); // ~1 chapter worth
	const prologueCost = input.includePrologue
		? calculateTokenCost(prologueTokens, writerModel)
		: 0;

	const epilogueTokens = estimateTokens(wordsPerChapter); // ~1 chapter worth
	const epilogueCost = input.includeEpilogue
		? calculateTokenCost(epilogueTokens, writerModel)
		: 0;

	// Cover art uses image model pricing
	const coverArtCost = input.generateFrontCover
		? imageModel.pricing.perImage
		: 0;

	// Blurb: ~200 words
	const blurbTokens = estimateTokens(200);
	const blurbCost = input.generateBackCoverBlurb
		? calculateTokenCost(blurbTokens, writerModel)
		: 0;

	// Character sheets: ~100 words per character, estimate 5 main characters
	const characterSheetsTokens = estimateTokens(500);
	const characterSheetsCost = input.generateCharacterSheets
		? calculateTokenCost(characterSheetsTokens, writerModel)
		: 0;

	// Chapter summaries: ~50 words per chapter
	const summaryTokens = estimateTokens(50 * input.totalChapters);
	const chapterSummariesCost = input.generateChapterSummaries
		? calculateTokenCost(summaryTokens, writerModel)
		: 0;

	// Consistency check: reviewer reads full content once
	const consistencyCheckCost = input.runConsistencyCheck
		? calculateTokenCost(totalTokens * 0.3, reviewerModel)
		: 0;

	// Calculate totals
	const contentCost = writerCost + reviewerCost;
	const featuresCost =
		prologueCost +
		epilogueCost +
		coverArtCost +
		blurbCost +
		characterSheetsCost +
		chapterSummariesCost +
		consistencyCheckCost;
	const totalCost = contentCost + featuresCost;

	return {
		writerCost,
		reviewerCost,
		prologueCost,
		epilogueCost,
		coverArtCost,
		blurbCost,
		characterSheetsCost,
		chapterSummariesCost,
		consistencyCheckCost,
		contentCost,
		featuresCost,
		totalCost,
		estimatedWords: totalWords,
		estimatedTokens: totalTokens,
	};
}

/**
 * Format cost as USD string
 */
export function formatCost(cost: number): string {
	return `$${cost.toFixed(2)}`;
}

/**
 * Get a breakdown of costs for display
 */
export function getCostBreakdown(
	estimate: GenerationCostEstimate,
	writerModelName?: string,
	reviewerModelName?: string,
): Array<{ label: string; cost: number; color: string }> {
	const breakdown = [
		{
			label: `Writer (${writerModelName || "AI"})`,
			cost: estimate.writerCost,
			color: "bg-violet-500",
		},
		{
			label: `Reviewer (${reviewerModelName || "AI"})`,
			cost: estimate.reviewerCost,
			color: "bg-blue-500",
		},
	];

	if (estimate.featuresCost > 0) {
		breakdown.push({
			label: "Additional Features",
			cost: estimate.featuresCost,
			color: "bg-pink-500",
		});
	}

	return breakdown;
}
