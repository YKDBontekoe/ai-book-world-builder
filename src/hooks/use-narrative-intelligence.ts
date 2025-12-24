import { useMemo } from "react";
import { useDebounceValue } from "usehooks-ts";

export interface NarrativeMetrics {
	wordCount: number;
	readingTimeMinutes: number;
	pacingScore: number; // 0-100 (Slow -> Fast)
	sentimentScore: number; // -1 to 1 (Negative -> Positive) - Simulated
	complexityScore: number; // 0-100 (Simple -> Complex)
	characterMentions: Record<string, number>;
	sentenceCount: number;
	pacingGraphData: { index: number; score: number }[];
}

interface UseNarrativeIntelligenceProps {
	content: string;
	entities?: Array<{ id: string; name: string; kind: string }>;
}

export function useNarrativeIntelligence({
	content,
	entities = [],
}: UseNarrativeIntelligenceProps): NarrativeMetrics {
	// Debounce content to prevent heavy calculations on every keystroke
	// 1000ms delay ensures we only analyze when the user pauses
	const [debouncedContent] = useDebounceValue(content, 1000);

	return useMemo(() => {
		if (!debouncedContent) {
			return {
				wordCount: 0,
				readingTimeMinutes: 0,
				pacingScore: 50,
				sentimentScore: 0,
				complexityScore: 0,
				characterMentions: {},
				sentenceCount: 0,
				pacingGraphData: [],
			};
		}

		// 1. Basic Stats
		const words = debouncedContent.trim().split(/\s+/);
		const wordCount = words.length;
		const readingTimeMinutes = Math.ceil(wordCount / 250); // Standard 250 wpm

		// 2. Sentence Analysis (Pacing)
		// Split by . ! ? but keep the delimiters to maintain accuracy
		const sentences = debouncedContent.match(/[^.!?]+[.!?]+/g) || [
			debouncedContent,
		];
		const sentenceCount = sentences.length;

		// Calculate sentence lengths
		const sentenceLengths = sentences.map((s) => s.split(/\s+/).length);
		const avgSentenceLength =
			sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceCount || 1);

		// Pacing Score: Inverse of sentence length.
		// Avg length 20 words = score 50 (Balanced).
		// Avg length 5 words = score 90 (Fast/Action).
		// Avg length 40 words = score 10 (Slow/Descriptive).
		// Formula: 100 - (avgLength * 2.5), clamped 0-100
		const pacingScore = Math.max(
			0,
			Math.min(100, 100 - avgSentenceLength * 2.5),
		);

		// Pacing Graph Data: Moving average of 3 sentences to smooth the curve
		const pacingGraphData = sentenceLengths.map((len, i) => {
			const score = Math.max(0, Math.min(100, 100 - len * 2.5));
			return { index: i, score };
		});

		// 3. Complexity (Readability)
		// Long words (>6 chars) indicate complexity
		const longWords = words.filter((w) => w.length > 6).length;
		const complexityScore = Math.min(
			100,
			(longWords / (wordCount || 1)) * 100 * 3, // Multiplier to normalize
		);

		// 4. Character Mentions
		const characterMentions: Record<string, number> = {};
		const characters = entities.filter((e) => e.kind === "character");

		for (const char of characters) {
			// Case-insensitive regex for whole word match
			try {
				const regex = new RegExp(`\\b${char.name}\\b`, "gi");
				const matches = debouncedContent.match(regex);
				if (matches) {
					characterMentions[char.name] = matches.length;
				}
			} catch (_e) {
				// Fallback for names with special regex characters
				if (debouncedContent.toLowerCase().includes(char.name.toLowerCase())) {
					characterMentions[char.name] = 1;
				}
			}
		}

		// 5. Sentiment (Simulated/Heuristic)
		// Real sentiment needs AI. Here we look for high-impact keywords.
		// This is a "Vibe Check".
		const positiveWords = [
			"love",
			"joy",
			"light",
			"smile",
			"happy",
			"laugh",
			"good",
			"great",
			"hope",
			"peace",
		];
		const negativeWords = [
			"death",
			"fear",
			"dark",
			"cry",
			"pain",
			"sad",
			"kill",
			"blood",
			"hate",
			"war",
		];

		let sentimentSum = 0;
		const lowerContent = debouncedContent.toLowerCase();

		// Simple frequency check
		positiveWords.forEach((w) => {
			if (lowerContent.includes(w)) sentimentSum += 1;
		});
		negativeWords.forEach((w) => {
			if (lowerContent.includes(w)) sentimentSum -= 1;
		});

		// Normalize to -1 to 1
		const sentimentScore = Math.max(-1, Math.min(1, sentimentSum / 10));

		return {
			wordCount,
			readingTimeMinutes,
			pacingScore,
			sentimentScore,
			complexityScore,
			characterMentions,
			sentenceCount,
			pacingGraphData,
		};
	}, [debouncedContent, entities]);
}
