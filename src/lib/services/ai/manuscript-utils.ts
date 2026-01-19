export interface ManuscriptSceneMatch {
	id: string;
	title: string;
	content: string | null;
	updatedAt?: Date;
}

export interface RankedSceneMatch extends ManuscriptSceneMatch {
	score: number;
}

const WORD_BOUNDARY = "\\b";
const STOP_WORDS = new Set([
	"a",
	"an",
	"and",
	"for",
	"in",
	"of",
	"on",
	"or",
	"the",
	"to",
	"with",
]);

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeQueryTokens(query: string): string[] {
	return query
		.toLowerCase()
		.split(/[^a-z0-9]+/g)
		.map((token) => token.trim())
		.filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

export function scoreTextForTokens(text: string, tokens: string[]): number {
	if (!text) return 0;
	const normalized = text.toLowerCase();

	return tokens.reduce((total, token) => {
		const pattern = new RegExp(
			`${WORD_BOUNDARY}${escapeRegExp(token)}${WORD_BOUNDARY}`,
			"g",
		);
		const matches = normalized.match(pattern);
		return total + (matches ? matches.length : 0);
	}, 0);
}

export function rankScenesByQuery(
	scenes: ManuscriptSceneMatch[],
	query: string,
): RankedSceneMatch[] {
	const tokens = normalizeQueryTokens(query);

	const scored = scenes.map((scene) => {
		const titleScore = scoreTextForTokens(scene.title, tokens);
		const contentScore = scoreTextForTokens(scene.content ?? "", tokens);
		return {
			...scene,
			score: titleScore * 2 + contentScore,
		};
	});

	return scored.sort((a, b) => {
		if (b.score !== a.score) return b.score - a.score;
		const aTime = a.updatedAt ? a.updatedAt.getTime() : 0;
		const bTime = b.updatedAt ? b.updatedAt.getTime() : 0;
		return bTime - aTime;
	});
}

export function buildExcerpt(content: string, maxLength: number): string {
	if (content.length <= maxLength) return content;
	return `${content.slice(0, maxLength).trim()}…`;
}
