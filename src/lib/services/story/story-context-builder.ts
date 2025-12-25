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
		? `[IMMEDIATELY PREVIOUS SCENE - ${lastScene.title}]\n${lastScene.content.slice(-2000)}`
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
