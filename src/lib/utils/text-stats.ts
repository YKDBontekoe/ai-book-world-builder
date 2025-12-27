/**
 * Count words in text content
 * Handles markdown, HTML, and plain text
 */
export function countWords(text: string): number {
	if (!text || text.trim().length === 0) return 0;

	// Remove markdown syntax
	const cleaned = text
		// Remove code blocks
		.replace(/```[\s\S]*?```/g, "")
		// Remove inline code
		.replace(/`[^`]*`/g, "")
		// Remove links but keep text
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		// Remove images
		.replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
		// Remove headings markers
		.replace(/^#{1,6}\s+/gm, "")
		// Remove bold/italic markers
		.replace(/[*_]{1,3}/g, "")
		// Remove HTML tags
		.replace(/<[^>]*>/g, " ");

	// Split by whitespace and filter empty strings
	const words = cleaned
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0);

	return words.length;
}

/**
 * Count characters in text (excluding whitespace)
 */
export function countCharacters(text: string, includeSpaces = false): number {
	if (!text) return 0;

	if (includeSpaces) {
		return text.length;
	}

	return text.replace(/\s/g, "").length;
}

/**
 * Estimate reading time in minutes
 * Average reading speed: 200-250 words per minute
 * We use 225 as a middle ground
 */
export function estimateReadingTime(
	text: string,
	wordsPerMinute = 225,
): number {
	const wordCount = countWords(text);
	const minutes = wordCount / wordsPerMinute;

	// Round to nearest minute, minimum 1 minute
	return Math.max(1, Math.round(minutes));
}

/**
 * Format reading time as human-readable string
 */
export function formatReadingTime(minutes: number): string {
	if (minutes < 1) return "< 1 min";
	if (minutes === 1) return "1 min";
	if (minutes < 60) return `${minutes} min`;

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (remainingMinutes === 0) {
		return hours === 1 ? "1 hour" : `${hours} hours`;
	}

	return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format word count with thousand separators
 */
export function formatWordCount(count: number): string {
	return count.toLocaleString();
}

/**
 * Get text statistics
 */
export interface TextStats {
	words: number;
	characters: number;
	charactersWithSpaces: number;
	readingTimeMinutes: number;
	readingTimeFormatted: string;
	paragraphs: number;
	sentences: number;
}

export function getTextStats(text: string): TextStats {
	const words = countWords(text);
	const characters = countCharacters(text, false);
	const charactersWithSpaces = countCharacters(text, true);
	const readingTimeMinutes = estimateReadingTime(text);
	const readingTimeFormatted = formatReadingTime(readingTimeMinutes);

	// Count paragraphs (non-empty lines)
	const paragraphs = text
		.split(/\n\n+/)
		.filter((p) => p.trim().length > 0).length;

	// Count sentences (rough estimate)
	const sentences = text
		.split(/[.!?]+/)
		.filter((s) => s.trim().length > 0).length;

	return {
		words,
		characters,
		charactersWithSpaces,
		readingTimeMinutes,
		readingTimeFormatted,
		paragraphs,
		sentences,
	};
}
