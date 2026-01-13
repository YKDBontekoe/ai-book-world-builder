import type { Chapter, Outline, Scene } from "@/lib/db/schema";

interface SceneGenerationContextParams {
	targetScene: Pick<Scene, "title" | "sequence">;
	targetChapter: Pick<Chapter, "title" | "notes">;
	targetOutline?: Pick<Outline, "pov" | "tone"> | null;
	scenesInChapter: Pick<Scene, "sequence" | "title" | "content">[];
}

interface SceneGenerationContextResult {
	fullContext: string;
	styleInstruction?: string;
}

/**
 * Truncates text to a maximum length while trying to respect sentence boundaries.
 * It takes the last `maxLength` characters, then attempts to find the start of the first
 * complete sentence within that chunk.
 */
export function smartTruncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;

	// Get the suffix of max length
	const candidate = text.slice(-maxLength);

	// Find the first sentence boundary.
	// We look for: (. | ? | !) followed by whitespace, OR a newline.
	// We want the start of the *next* sentence.
	const match = candidate.match(/([.!?]\s+)|\n+/);

	if (match && match.index !== undefined) {
		// match[0] is the delimiter (e.g. ". " or "\n")
		// We want to slice AFTER this delimiter.
		return candidate.slice(match.index + match[0].length).trim();
	}

	// Fallback: look for first space
	const firstSpace = candidate.indexOf(" ");
	if (firstSpace !== -1 && firstSpace < maxLength / 2) {
		// Only if the space is somewhat early, otherwise we lose too much text?
		// Actually, any space is better than mid-word.
		return candidate.slice(firstSpace + 1).trim();
	}

	return candidate;
}

/**
 * Builds the context string for generating scene text.
 * Includes chapter info, summaries of previous scenes, and the full text of the immediately preceding scene.
 */
export function buildSceneGenerationContext({
	targetScene,
	targetChapter,
	targetOutline,
	scenesInChapter,
}: SceneGenerationContextParams): SceneGenerationContextResult {
	// Filter for previous scenes
	const previousScenes = scenesInChapter.filter(
		(s) => s.sequence < targetScene.sequence,
	);

	// Get full text of immediate predecessor (for continuity)
	const lastScene = previousScenes[previousScenes.length - 1];
	const lastSceneText = lastScene?.content
		? `[IMMEDIATELY PREVIOUS SCENE - ${lastScene.title}]\n${smartTruncate(lastScene.content, 2000)}`
		: "";

	// Get summaries of earlier scenes (for arc memory)
	const otherScenesSummary = previousScenes
		.slice(0, -1)
		.map((s) => `[SCENE ${s.title}]: ${s.content ? "Completed" : "Planned"}`)
		.join("\n");

	const chapterContext = `Chapter Title: ${targetChapter.title}\nChapter Summary: ${targetChapter.notes || ""}`;

	const fullContext = `${chapterContext}\n\nPrevious Scenes Summary:\n${otherScenesSummary}\n\n${lastSceneText}`;

	const styleInstruction = targetOutline
		? `${targetOutline.pov}, ${targetOutline.tone}`
		: undefined;

	return {
		fullContext,
		styleInstruction,
	};
}
