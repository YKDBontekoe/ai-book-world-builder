/**
 * Voice Profile Service
 *
 * Manages character voice profiles and ensures dialogue consistency.
 * Extracts voice patterns from existing dialogue and validates new content.
 */

import "server-only";

import { z } from "zod";
import { BaseAIService } from "@/lib/ai/services/base-ai-service";

// =============================================================================
// Types
// =============================================================================

/**
 * Complete voice profile for a character.
 */
export interface VoiceProfile {
	/** Entity ID this profile belongs to */
	entityId: string;

	/** Character name */
	name: string;

	/** Vocabulary complexity level */
	vocabularyLevel: "simple" | "moderate" | "complex" | "archaic";

	/** Typical sentence structure */
	sentenceStyle:
		| "short_punchy"
		| "flowing"
		| "formal"
		| "colloquial"
		| "fragmented"
		| "verbose";

	/** Average sentence length in words */
	averageSentenceLength: number;

	/** Unique phrases or expressions */
	catchphrases: string[];

	/** Speech mannerisms (e.g., "clears throat before speaking") */
	speechMannerisms: string[];

	/** Words/phrases this character avoids */
	avoidedWords: string[];

	/** Default emotional tone */
	defaultTone: string;

	/** Emotional expression patterns */
	emotionalRange: {
		positive: string[];
		negative: string[];
	};

	/** Example dialogue lines that exemplify this voice */
	sampleDialogue: string[];

	/** Dialect or accent markers */
	dialect?: string;

	/** Confidence score for this profile (0-1) */
	confidence: number;
}

/**
 * Result of voice consistency check.
 */
export interface VoiceConsistencyResult {
	/** Whether the dialogue matches the character's voice */
	isConsistent: boolean;

	/** Consistency score (0-100) */
	score: number;

	/** Specific issues found */
	issues: VoiceIssue[];

	/** Suggested rewrites */
	suggestions: VoiceRewriteSuggestion[];
}

/**
 * Individual voice consistency issue.
 */
export interface VoiceIssue {
	type:
		| "vocabulary_mismatch"
		| "tone_shift"
		| "sentence_style"
		| "catchphrase_missing"
		| "mannerism_absent"
		| "out_of_character";
	severity: "minor" | "moderate" | "major";
	dialogueLine: string;
	explanation: string;
}

/**
 * Suggested rewrite for voice consistency.
 */
export interface VoiceRewriteSuggestion {
	original: string;
	rewritten: string;
	reason: string;
}

// =============================================================================
// Schemas
// =============================================================================

const voiceProfileSchema = z.object({
	vocabularyLevel: z.enum(["simple", "moderate", "complex", "archaic"]),
	sentenceStyle: z.enum([
		"short_punchy",
		"flowing",
		"formal",
		"colloquial",
		"fragmented",
		"verbose",
	]),
	averageSentenceLength: z.number(),
	catchphrases: z.array(z.string()),
	speechMannerisms: z.array(z.string()),
	avoidedWords: z.array(z.string()),
	defaultTone: z.string(),
	emotionalRange: z.object({
		positive: z.array(z.string()),
		negative: z.array(z.string()),
	}),
	sampleDialogue: z.array(z.string()),
	dialect: z.string().optional(),
	confidence: z.number().min(0).max(1),
});

const consistencyCheckSchema = z.object({
	isConsistent: z.boolean(),
	score: z.number().min(0).max(100),
	issues: z.array(
		z.object({
			type: z.enum([
				"vocabulary_mismatch",
				"tone_shift",
				"sentence_style",
				"catchphrase_missing",
				"mannerism_absent",
				"out_of_character",
			]),
			severity: z.enum(["minor", "moderate", "major"]),
			dialogueLine: z.string(),
			explanation: z.string(),
		}),
	),
	suggestions: z.array(
		z.object({
			original: z.string(),
			rewritten: z.string(),
			reason: z.string(),
		}),
	),
});

// =============================================================================
// Service
// =============================================================================

export class VoiceProfileService extends BaseAIService {
	/**
	 * Generate a voice profile from existing dialogue.
	 */
	async generateVoiceProfile(
		entityId: string,
		characterName: string,
		existingDialogue: string[],
		characterDescription?: string,
	): Promise<VoiceProfile> {
		if (existingDialogue.length === 0) {
			// Return a default profile if no dialogue exists
			return this.createDefaultProfile(entityId, characterName);
		}

		const dialogueSample = existingDialogue.slice(0, 30).join("\n");

		const systemPrompt = `You are an expert at analyzing character voice in fiction. Examine the dialogue samples and extract the character's unique voice profile.

Consider:
- Vocabulary level and word choices
- Sentence structure and length
- Unique phrases or expressions
- Speech patterns and mannerisms
- Emotional expression style
- Any dialect or accent markers

Be specific and provide concrete examples from the dialogue.`;

		const prompt = `Analyze the voice of "${characterName}":

${characterDescription ? `Character Description: ${characterDescription}\n\n` : ""}Dialogue Samples:
${dialogueSample}

Extract a detailed voice profile.`;

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			prompt,
			voiceProfileSchema,
			{ modelRole: "checker" },
		);

		if (!result.success) {
			return this.createDefaultProfile(entityId, characterName);
		}

		return {
			entityId,
			name: characterName,
			...result.data.object,
		};
	}

	/**
	 * Check if dialogue matches a character's voice profile.
	 */
	async checkVoiceConsistency(
		profile: VoiceProfile,
		newDialogue: string[],
	): Promise<VoiceConsistencyResult> {
		if (newDialogue.length === 0) {
			return {
				isConsistent: true,
				score: 100,
				issues: [],
				suggestions: [],
			};
		}

		const profileSummary = `
Character: ${profile.name}
Vocabulary: ${profile.vocabularyLevel}
Sentence Style: ${profile.sentenceStyle}
Catchphrases: ${profile.catchphrases.join(", ")}
Mannerisms: ${profile.speechMannerisms.join(", ")}
Default Tone: ${profile.defaultTone}
Sample Dialogue: ${profile.sampleDialogue.join(" | ")}
Avoided Words: ${profile.avoidedWords.join(", ")}`;

		const systemPrompt = `You are an expert at maintaining character voice consistency in fiction.

Compare the new dialogue against the established voice profile. Identify:
1. Lines that don't match the character's vocabulary level
2. Shifts in tone or speaking style
3. Missing characteristic expressions
4. Out-of-character moments

For each issue, suggest a rewrite that maintains the character's voice.`;

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			`Voice Profile:
${profileSummary}

New Dialogue to Check:
${newDialogue.join("\n")}

Analyze for voice consistency.`,
			consistencyCheckSchema,
			{ modelRole: "checker" },
		);

		if (!result.success) {
			return {
				isConsistent: true,
				score: 75,
				issues: [],
				suggestions: [],
			};
		}

		return result.data.object;
	}

	/**
	 * Transform dialogue to match a character's voice.
	 */
	async transformDialogue(
		dialogue: string,
		targetProfile: VoiceProfile,
	): Promise<string> {
		const profileSummary = `
Character: ${targetProfile.name}
Vocabulary: ${targetProfile.vocabularyLevel}
Sentence Style: ${targetProfile.sentenceStyle}
Catchphrases: ${targetProfile.catchphrases.join(", ")}
Mannerisms: ${targetProfile.speechMannerisms.join(", ")}
Default Tone: ${targetProfile.defaultTone}
Sample Dialogue: ${targetProfile.sampleDialogue.slice(0, 5).join(" | ")}`;

		const systemPrompt = `You are an expert at writing dialogue in specific character voices.

Rewrite the provided dialogue to match the target character's voice. Maintain:
- The same meaning and intent
- The established vocabulary level
- Characteristic expressions and patterns
- The emotional tone appropriate for the character

Output ONLY the rewritten dialogue, no explanations.`;

		const result = await this.generateTextWithSystem(
			systemPrompt,
			`Target Voice Profile:
${profileSummary}

Dialogue to Transform:
"${dialogue}"

Rewritten Dialogue:`,
			{ modelRole: "writer", temperature: 0.6 },
		);

		if (!result.success) {
			throw new Error(result.error);
		}

		// Clean up the result (remove quotes if added)
		return result.data.text.replace(/^["']|["']$/g, "").trim();
	}

	/**
	 * Compare two characters' voices for distinctiveness.
	 */
	async compareVoices(
		profile1: VoiceProfile,
		profile2: VoiceProfile,
	): Promise<{
		distinctivenessScore: number;
		similarities: string[];
		differences: string[];
		recommendations: string[];
	}> {
		const comparisonSchema = z.object({
			distinctivenessScore: z.number().min(0).max(100),
			similarities: z.array(z.string()),
			differences: z.array(z.string()),
			recommendations: z.array(z.string()),
		});

		const systemPrompt = `You are an expert at analyzing character voice distinctiveness in fiction.

Compare these two character voices and assess how distinct they are from each other.
A score of 100 means completely distinct voices; a score of 0 means identical voices.

Identify:
- Similarities that might cause confusion
- Clear differences that distinguish them
- Recommendations for making them more distinct`;

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			`Character 1: ${profile1.name}
Vocabulary: ${profile1.vocabularyLevel}
Style: ${profile1.sentenceStyle}
Catchphrases: ${profile1.catchphrases.join(", ")}
Sample: ${profile1.sampleDialogue[0] || "N/A"}

Character 2: ${profile2.name}
Vocabulary: ${profile2.vocabularyLevel}
Style: ${profile2.sentenceStyle}
Catchphrases: ${profile2.catchphrases.join(", ")}
Sample: ${profile2.sampleDialogue[0] || "N/A"}`,
			comparisonSchema,
			{ modelRole: "checker" },
		);

		if (!result.success) {
			return {
				distinctivenessScore: 50,
				similarities: [],
				differences: [],
				recommendations: [],
			};
		}

		return result.data.object;
	}

	/**
	 * Merge dialogue from multiple sources into a consistent voice.
	 */
	async mergeVoiceFromMultipleSources(
		entityId: string,
		characterName: string,
		sources: { source: string; dialogue: string[] }[],
	): Promise<VoiceProfile> {
		// Combine all dialogue
		const allDialogue = sources.flatMap((s) => s.dialogue);

		// Generate profile from combined dialogue
		return this.generateVoiceProfile(entityId, characterName, allDialogue);
	}

	/**
	 * Create a default voice profile for a character.
	 */
	private createDefaultProfile(entityId: string, name: string): VoiceProfile {
		return {
			entityId,
			name,
			vocabularyLevel: "moderate",
			sentenceStyle: "flowing",
			averageSentenceLength: 15,
			catchphrases: [],
			speechMannerisms: [],
			avoidedWords: [],
			defaultTone: "neutral",
			emotionalRange: {
				positive: ["smile", "laugh", "grin"],
				negative: ["frown", "sigh", "grimace"],
			},
			sampleDialogue: [],
			confidence: 0.3,
		};
	}
}

// Export singleton instance
export const voiceProfileService = new VoiceProfileService();
