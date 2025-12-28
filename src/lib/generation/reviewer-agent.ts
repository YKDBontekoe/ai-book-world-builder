/**
 * Reviewer Agent - Reviews chapters for quality, consistency, and provides feedback
 */

import { generateObject, type LanguageModelUsage } from "ai";
import { z } from "zod";
import { myProvider } from "@/lib/ai/providers";
import type { GenerationSettings } from "@/lib/db/schema";

export interface ReviewerAgentInput {
	chapterContent: string;
	chapterNumber: number;
	chapterTitle: string;
	projectContext: string;
	loreContext: string;
	previousChaptersSummary?: string;
	settings: GenerationSettings;
}

export interface ReviewResult {
	overallScore: number; // 1-10
	passesReview: boolean;
	feedback: {
		strengths: string[];
		weaknesses: string[];
		suggestions: string[];
	};
	consistency: {
		characterConsistent: boolean;
		worldConsistent: boolean;
		issues: string[];
	};
	pacing: {
		score: number;
		notes: string;
	};
	engagement: {
		score: number;
		notes: string;
	};
	revisionPriority: "none" | "minor" | "major" | "rewrite";
	usage?: LanguageModelUsage & { modelId?: string };
}

const reviewSchema = z.object({
	overallScore: z
		.number()
		.min(1)
		.max(10)
		.describe("Overall quality score 1-10"),
	passesReview: z
		.boolean()
		.describe("Whether the chapter passes quality standards"),
	feedback: z.object({
		strengths: z.array(z.string()).describe("What works well in this chapter"),
		weaknesses: z.array(z.string()).describe("Areas that need improvement"),
		suggestions: z
			.array(z.string())
			.describe("Specific suggestions for revision"),
	}),
	consistency: z.object({
		characterConsistent: z.boolean().describe("Characters behave consistently"),
		worldConsistent: z.boolean().describe("World details are consistent"),
		issues: z.array(z.string()).describe("Specific consistency issues found"),
	}),
	pacing: z.object({
		score: z.number().min(1).max(10).describe("Pacing score 1-10"),
		notes: z.string().describe("Brief notes on pacing"),
	}),
	engagement: z.object({
		score: z
			.number()
			.min(1)
			.max(10)
			.describe("How engaging/compelling it is 1-10"),
		notes: z.string().describe("Brief notes on reader engagement"),
	}),
	revisionPriority: z
		.enum(["none", "minor", "major", "rewrite"])
		.describe("How urgently this needs revision"),
});

/**
 * Review a chapter and provide structured feedback
 */
export async function reviewChapter(
	input: ReviewerAgentInput,
): Promise<ReviewResult> {
	const systemPrompt = `You are a professional book editor and literary critic.
Your job is to review fiction chapters for quality, consistency, and reader engagement.

Be constructive but honest. A good review helps the writer improve.

## Review Criteria
1. **Consistency**: Do characters and world details match established lore?
2. **Pacing**: Does the chapter flow well? Are there lulls or rushes?
3. **Engagement**: Would a reader want to keep reading?
4. **Quality**: Is the prose well-crafted? Are there awkward phrases?
5. **Plot Advancement**: Does this chapter move the story forward?

## Project Lore to Check Against
${input.loreContext}

${input.previousChaptersSummary ? `## Story So Far\n${input.previousChaptersSummary}` : ""}

## Quality Standards
- Score 8-10: Excellent, ready to publish
- Score 6-7: Good, minor polish needed
- Score 4-5: Acceptable, needs revision
- Score 1-3: Significant issues, major rewrite needed`;

	const userPrompt = `Review Chapter ${input.chapterNumber}: "${input.chapterTitle}"

<chapter>
${input.chapterContent}
</chapter>

Provide a detailed review following the schema.`;

	const response = await generateObject({
		model: myProvider.languageModel(input.settings.reviewerModelId),
		system: systemPrompt,
		prompt: userPrompt,
		schema: reviewSchema,
	});

	return {
		...(response.object as ReviewResult),
		usage: { ...response.usage, modelId: input.settings.reviewerModelId },
	};
}

/**
 * Generate revision suggestions based on review
 */
export async function generateRevisionGuidance(
	_originalContent: string,
	review: ReviewResult,
	settings: GenerationSettings,
): Promise<string> {
	if (review.revisionPriority === "none") {
		return "No revisions needed.";
	}

	const { object } = await generateObject({
		model: myProvider.languageModel(settings.reviewerModelId),
		system:
			"You are a helpful writing coach. Provide clear, actionable revision guidance.",
		prompt: `Based on this review, provide specific revision guidance:

Review Summary:
- Score: ${review.overallScore}/10
- Priority: ${review.revisionPriority}
- Weaknesses: ${review.feedback.weaknesses.join("; ")}
- Suggestions: ${review.feedback.suggestions.join("; ")}
- Consistency Issues: ${review.consistency.issues.join("; ")}

Provide a concise revision guide.`,
		schema: z.object({
			guidance: z.string().describe("Revision guidance"),
		}),
	});

	return object.guidance;
}

/**
 * Quick quality check for a chapter (lighter weight than full review)
 */
export async function quickCheck(
	content: string,
	projectContext: string,
	modelId: string,
): Promise<{ passes: boolean; issues: string[] }> {
	const { object } = await generateObject({
		model: myProvider.languageModel(modelId),
		system: "You are a quick proofreader. Identify major issues only.",
		prompt: `Quick check this content for major issues:
${content.substring(0, 2000)}...

Project context: ${projectContext.substring(0, 500)}`,
		schema: z.object({
			passes: z.boolean(),
			issues: z.array(z.string()).max(3),
		}),
	});

	return object;
}
