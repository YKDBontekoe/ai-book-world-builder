/**
 * Writing Coach Service
 *
 * AI-powered writing improvement and analysis service.
 * Provides feedback on style, pacing, show vs tell, and dialogue quality.
 */

import "server-only";

import { z } from "zod";
import { BaseAIService } from "@/lib/ai/services/base-ai-service";

// =============================================================================
// Types
// =============================================================================

/**
 * Style profile for target writing style.
 */
export interface StyleProfile {
	presetId: string;
	name: string;
	description: string;
	characteristics: string[];
	avoidances: string[];
}

/**
 * Full writing analysis result.
 */
export interface WritingAnalysis {
	/** Overall quality score (1-100) */
	overallScore: number;

	/** Readability grade level (e.g., 8.5 = 8th grade) */
	readabilityGrade: number;

	/** Average words per sentence */
	averageSentenceLength: number;

	/** Variety in paragraph length */
	paragraphVariety: "low" | "medium" | "high";

	/** Ratio of showing to telling (higher = more showing) */
	showVsTellRatio: number;

	/** Percentage of content that is dialogue */
	dialoguePercentage: number;

	/** Density of descriptive passages */
	descriptionDensity: "sparse" | "balanced" | "rich" | "dense";

	/** Detected issues */
	issues: WritingIssue[];

	/** Improvement suggestions */
	suggestions: WritingSuggestion[];
}

/**
 * Individual writing issue.
 */
export interface WritingIssue {
	type:
		| "show_vs_tell"
		| "passive_voice"
		| "adverb_overuse"
		| "repetition"
		| "pacing"
		| "weak_dialogue"
		| "info_dump"
		| "purple_prose";
	severity: "minor" | "moderate" | "major";
	text: string;
	location: { start: number; end: number };
	explanation: string;
	suggestion: string;
}

/**
 * Writing improvement suggestion.
 */
export interface WritingSuggestion {
	category: "style" | "structure" | "dialogue" | "pacing" | "description";
	priority: "low" | "medium" | "high";
	title: string;
	description: string;
	example?: {
		before: string;
		after: string;
	};
}

/**
 * Show vs Tell detection instance.
 */
export interface ShowTellInstance {
	text: string;
	location: { start: number; end: number };
	isTelling: boolean;
	suggestion: string;
	rewriteExample: string;
}

/**
 * Pacing analysis for scenes.
 */
export interface PacingAnalysis {
	overallPacing: "too_slow" | "slow" | "balanced" | "fast" | "too_fast";
	scenes: ScenePacingInfo[];
	tensionCurve: TensionPoint[];
	recommendations: string[];
}

/**
 * Individual scene pacing info.
 */
export interface ScenePacingInfo {
	sceneId: string;
	title: string;
	pacing: "slow" | "medium" | "fast";
	wordCount: number;
	dialogueRatio: number;
	actionRatio: number;
	reflectionRatio: number;
	recommendation?: string;
}

/**
 * Point on the tension curve.
 */
export interface TensionPoint {
	position: number; // 0-100 percentage through content
	tension: number; // 1-10 tension level
	label?: string;
}

/**
 * Dialogue analysis result.
 */
export interface DialogueAnalysis {
	overallScore: number;
	naturalnessScore: number;
	distinctivenessScore: number;
	issues: DialogueIssue[];
}

/**
 * Dialogue issue.
 */
export interface DialogueIssue {
	type: "unnatural" | "talking_heads" | "on_the_nose" | "info_dump" | "samey_voices";
	text: string;
	suggestion: string;
}

// =============================================================================
// Schemas
// =============================================================================

const writingAnalysisSchema = z.object({
	overallScore: z.number().min(1).max(100),
	readabilityGrade: z.number().min(1).max(20),
	averageSentenceLength: z.number(),
	paragraphVariety: z.enum(["low", "medium", "high"]),
	showVsTellRatio: z.number(),
	dialoguePercentage: z.number(),
	descriptionDensity: z.enum(["sparse", "balanced", "rich", "dense"]),
	issues: z.array(
		z.object({
			type: z.enum([
				"show_vs_tell",
				"passive_voice",
				"adverb_overuse",
				"repetition",
				"pacing",
				"weak_dialogue",
				"info_dump",
				"purple_prose",
			]),
			severity: z.enum(["minor", "moderate", "major"]),
			text: z.string(),
			location: z.object({ start: z.number(), end: z.number() }),
			explanation: z.string(),
			suggestion: z.string(),
		}),
	),
	suggestions: z.array(
		z.object({
			category: z.enum(["style", "structure", "dialogue", "pacing", "description"]),
			priority: z.enum(["low", "medium", "high"]),
			title: z.string(),
			description: z.string(),
			example: z
				.object({
					before: z.string(),
					after: z.string(),
				})
				.optional(),
		}),
	),
});

const showTellSchema = z.object({
	instances: z.array(
		z.object({
			text: z.string(),
			location: z.object({ start: z.number(), end: z.number() }),
			isTelling: z.boolean(),
			suggestion: z.string(),
			rewriteExample: z.string(),
		}),
	),
});

const pacingAnalysisSchema = z.object({
	overallPacing: z.enum(["too_slow", "slow", "balanced", "fast", "too_fast"]),
	tensionCurve: z.array(
		z.object({
			position: z.number(),
			tension: z.number(),
			label: z.string().optional(),
		}),
	),
	recommendations: z.array(z.string()),
});

const dialogueAnalysisSchema = z.object({
	overallScore: z.number().min(1).max(100),
	naturalnessScore: z.number().min(1).max(100),
	distinctivenessScore: z.number().min(1).max(100),
	issues: z.array(
		z.object({
			type: z.enum([
				"unnatural",
				"talking_heads",
				"on_the_nose",
				"info_dump",
				"samey_voices",
			]),
			text: z.string(),
			suggestion: z.string(),
		}),
	),
});

// =============================================================================
// Service
// =============================================================================

export class WritingCoachService extends BaseAIService {
	/**
	 * Perform a comprehensive analysis of the writing.
	 */
	async analyzeText(
		content: string,
		targetStyle?: StyleProfile,
	): Promise<WritingAnalysis> {
		const styleContext = targetStyle
			? `\n\nTarget Style: ${targetStyle.name}\nCharacteristics: ${targetStyle.characteristics.join(", ")}\nAvoid: ${targetStyle.avoidances.join(", ")}`
			: "";

		const systemPrompt = `You are an expert writing coach and editor. Analyze the provided text for quality, style, and areas of improvement.

Be thorough but constructive. Focus on actionable feedback.${styleContext}

Consider:
- Readability and sentence structure
- Show vs Tell balance
- Dialogue quality and naturalness
- Pacing and flow
- Description density
- Common writing pitfalls (passive voice, adverb overuse, etc.)`;

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			`Analyze this text:\n\n${content.substring(0, 8000)}`,
			writingAnalysisSchema,
			{ modelRole: "checker" },
		);

		if (!result.success) {
			throw new Error(result.error);
		}

		return result.data.object as WritingAnalysis;
	}

	/**
	 * Suggest an improvement for selected text.
	 */
	async suggestImprovement(
		selection: string,
		issueType: string,
		context: string,
	): Promise<string> {
		const systemPrompt = `You are an expert writing coach. Rewrite the selected text to address the identified issue.

Issue Type: ${issueType}

Output ONLY the rewritten text, no explanations.`;

		const result = await this.generateTextWithSystem(
			systemPrompt,
			`Context:\n${context}\n\nSelected text to improve:\n"${selection}"`,
			{ modelRole: "writer", temperature: 0.5 },
		);

		if (!result.success) {
			throw new Error(result.error);
		}

		return result.data.text;
	}

	/**
	 * Detect show vs tell instances in the content.
	 */
	async detectShowVsTell(content: string): Promise<ShowTellInstance[]> {
		const systemPrompt = `You are an expert at identifying "telling" versus "showing" in prose.

"Telling" describes emotions or states directly: "She was angry."
"Showing" demonstrates through action, dialogue, or sensory details: "Her jaw clenched as she slammed the door."

Find instances of telling that would benefit from showing. For each, provide:
1. The original text
2. Why it's telling
3. A rewritten example that shows instead`;

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			`Analyze this text for show vs tell:\n\n${content.substring(0, 6000)}`,
			showTellSchema,
			{ modelRole: "checker" },
		);

		if (!result.success) {
			throw new Error(result.error);
		}

		return result.data.object.instances;
	}

	/**
	 * Analyze pacing across scenes.
	 */
	async analyzePacing(scenes: { id: string; title: string; content: string }[]): Promise<PacingAnalysis> {
		const scenesSummary = scenes
			.map((s, i) => `Scene ${i + 1}: "${s.title}"\nWord count: ${s.content.split(/\s+/).length}\nExcerpt: ${s.content.substring(0, 500)}...`)
			.join("\n\n---\n\n");

		const systemPrompt = `You are an expert at analyzing narrative pacing. Evaluate the pacing of these scenes and the overall tension curve.

Consider:
- Balance of action, dialogue, and reflection
- Scene length variety
- Tension building and release
- Breathing room for readers`;

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			`Analyze the pacing of these scenes:\n\n${scenesSummary}`,
			pacingAnalysisSchema,
			{ modelRole: "checker" },
		);

		if (!result.success) {
			throw new Error(result.error);
		}

		const analysis = result.data.object;

		// Build scene-specific pacing info
		const scenePacingInfo: ScenePacingInfo[] = scenes.map((scene) => {
			const wordCount = scene.content.split(/\s+/).length;
			const dialogueMatches = scene.content.match(/"[^"]+"/g) || [];
			const dialogueWords = dialogueMatches.join(" ").split(/\s+/).length;

			return {
				sceneId: scene.id,
				title: scene.title,
				pacing: wordCount > 2000 ? "slow" : wordCount < 800 ? "fast" : "medium",
				wordCount,
				dialogueRatio: dialogueWords / wordCount,
				actionRatio: 0.3, // Simplified
				reflectionRatio: 0.2, // Simplified
			};
		});

		return {
			overallPacing: analysis.overallPacing,
			scenes: scenePacingInfo,
			tensionCurve: analysis.tensionCurve,
			recommendations: analysis.recommendations,
		};
	}

	/**
	 * Analyze dialogue quality.
	 */
	async analyzeDialogue(content: string): Promise<DialogueAnalysis> {
		// Extract dialogue from content
		const dialogueMatches = content.match(/"[^"]+"/g) || [];
		if (dialogueMatches.length === 0) {
			return {
				overallScore: 100,
				naturalnessScore: 100,
				distinctivenessScore: 100,
				issues: [],
			};
		}

		const dialogueSample = dialogueMatches.slice(0, 20).join("\n");

		const systemPrompt = `You are an expert at analyzing dialogue in fiction. Evaluate the dialogue for:

1. Naturalness - Does it sound like real speech?
2. Distinctiveness - Do characters have unique voices?
3. Common issues:
   - "Talking heads" (dialogue without action beats)
   - "On the nose" (saying exactly what they mean with no subtext)
   - Info dumps through dialogue
   - Characters sounding too similar`;

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			`Analyze this dialogue from the story:\n\n${dialogueSample}\n\nFull context:\n${content.substring(0, 4000)}`,
			dialogueAnalysisSchema,
			{ modelRole: "checker" },
		);

		if (!result.success) {
			throw new Error(result.error);
		}

		return result.data.object;
	}

	/**
	 * Get a quick style score for content.
	 */
	async getQuickScore(content: string): Promise<{ score: number; summary: string }> {
		const quickScoreSchema = z.object({
			score: z.number().min(1).max(100),
			summary: z.string(),
		});

		const result = await this.generateObjectWithSystem(
			"You are a writing quality evaluator. Give a quick score (1-100) and one-sentence summary.",
			`Rate this writing:\n\n${content.substring(0, 2000)}`,
			quickScoreSchema,
			{ modelRole: "checker" },
		);

		if (!result.success) {
			return { score: 70, summary: "Unable to analyze" };
		}

		return result.data.object;
	}
}

// Export singleton instance
export const writingCoachService = new WritingCoachService();
