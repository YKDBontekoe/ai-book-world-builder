export interface StyleMetrics {
	tone: "formal" | "casual" | "neutral";
	voice: "active" | "passive" | "mixed";
	sentenceVariety: "high" | "medium" | "low";
	descriptiveLevel: "high" | "medium" | "low";
}

export function analyzeWritingStyle(content: string): StyleMetrics {
	if (!content || content.length < 50) {
		return {
			tone: "neutral",
			voice: "mixed",
			sentenceVariety: "medium",
			descriptiveLevel: "medium",
		};
	}

	const contentLower = content.toLowerCase();
	const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
	const words = content.split(/\s+/);

	// Tone analysis
	const formalWords = [
		"therefore",
		"furthermore",
		"moreover",
		"consequently",
		"thus",
		"hence",
	];
	const casualWords = ["gonna", "wanna", "yeah", "okay", "hey", "well"];
	const formalCount = formalWords.filter((w) =>
		contentLower.includes(w),
	).length;
	const casualCount = casualWords.filter((w) =>
		contentLower.includes(w),
	).length;

	let tone: "formal" | "casual" | "neutral" = "neutral";
	if (formalCount > casualCount && formalCount > 0) tone = "formal";
	else if (casualCount > formalCount && casualCount > 0) tone = "casual";

	// Voice analysis (active vs passive)
	const passiveIndicators = /\b(was|were|been|being|is|are|am)\s+\w+ed\b/gi;
	const passiveMatches = content.match(passiveIndicators) || [];
	const passiveRatio =
		sentences.length > 0 ? passiveMatches.length / sentences.length : 0;
	const voice: "active" | "passive" | "mixed" =
		passiveRatio > 0.3 ? "passive" : passiveRatio < 0.1 ? "active" : "mixed";

	// Sentence variety (based on length variance)
	const sentenceLengths = sentences.map((s) => s.split(/\s+/).length);
	const avgLength =
		sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
	const variance =
		sentenceLengths.reduce((sum, len) => sum + (len - avgLength) ** 2, 0) /
		sentenceLengths.length;
	const sentenceVariety: "high" | "medium" | "low" =
		variance > 100 ? "high" : variance < 25 ? "low" : "medium";

	// Descriptive level (adjectives, adverbs, sensory words)
	const descriptiveWords =
		/\b(beautiful|dark|bright|soft|loud|quiet|smooth|rough|warm|cold|sweet|bitter)\b/gi;
	const descriptiveMatches = content.match(descriptiveWords) || [];
	const descriptiveRatio = descriptiveMatches.length / words.length;
	const descriptiveLevel: "high" | "medium" | "low" =
		descriptiveRatio > 0.05
			? "high"
			: descriptiveRatio < 0.01
				? "low"
				: "medium";

	return {
		tone,
		voice,
		sentenceVariety,
		descriptiveLevel,
	};
}
