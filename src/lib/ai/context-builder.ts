import type { Chapter, Scene } from "@/lib/db/schema";

export function buildSceneGenerationContext(
	chapter: Chapter,
	scenes: Scene[],
	prevSceneId?: string | null,
) {
	let context = `Chapter: ${chapter.title}\nNotes: ${chapter.notes || ""}\n`;
	let prevContent = "";
	let newSequence = 1;

	if (prevSceneId) {
		const prevScene = scenes.find((s) => s.id === prevSceneId);
		if (prevScene) {
			prevContent = prevScene.content || "";
			newSequence = prevScene.sequence + 1;
			// Add context from earlier scenes
			context += scenes
				.filter((s) => s.sequence <= prevScene.sequence)
				.map((s) => `Scene ${s.title}: ${s.content?.substring(0, 200)}...`)
				.join("\n");
		}
	} else if (scenes.length > 0) {
		// Append to end
		const lastScene = scenes[scenes.length - 1];
		prevContent = lastScene.content || "";
		newSequence = lastScene.sequence + 1;
	}

	return { context, prevContent, newSequence };
}
