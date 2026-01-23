import { semanticCache } from "@/lib/ai/semantic-cache";
import type { Chapter, Scene } from "@/lib/db/schema";

/**
 * Builds the generation context by combining deterministic narrative flow with semantic search.
 *
 * Strategy:
 * 1. **Continuity**: Injects the full text of the immediately preceding scene.
 * 2. **Narrative Arc**: Includes summaries of all previous scenes in the current chapter.
 * 3. **Semantic Flooding**: Queries the `SemanticCache` (RAG) to find relevant Entities,
 *    Plot Points, and Past Scenes that are semantically similar to the current context.
 *
 * @param chapter The target chapter.
 * @param scenes All scenes in the chapter (used to find predecessors).
 * @param prevSceneId The ID of the scene immediately before the new one (optional).
 */
export async function buildSceneGenerationContext(
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

	// Semantic Context Injection
	try {
		// Ensure cache is up to date and fetch it
		const cache = await semanticCache.updateCache(chapter.projectId);

		// Build a query based on the current chapter and immediate previous content
		const query = `Chapter: ${chapter.title}. Notes: ${chapter.notes || ""}. Context: ${prevContent.substring(0, 500)}`;

		const relevantItems = await semanticCache.findRelevant(query, cache);

		if (relevantItems.length > 0) {
			context += "\n\n=== RELEVANT STORY ELEMENTS (Semantic Search) ===\n";

			// Group by type for better organization
			const characters = relevantItems.filter((i) => i.type === "character");
			const plotPoints = relevantItems.filter((i) => i.type === "plot_point");
			const relevantScenes = relevantItems.filter((i) => i.type === "scene");

			if (characters.length) {
				context +=
					"CHARACTERS:\n" +
					characters.map((c) => `- ${c.content}`).join("\n") +
					"\n";
			}
			if (plotPoints.length) {
				context +=
					"PLOT POINTS:\n" +
					plotPoints.map((p) => `- ${p.content}`).join("\n") +
					"\n";
			}
			if (relevantScenes.length) {
				context +=
					"RELATED SCENES:\n" +
					relevantScenes
						.map((s) => `- ${s.content.substring(0, 300)}...`)
						.join("\n") +
					"\n";
			}
		}
	} catch (error) {
		console.warn("Failed to inject semantic context:", error);
		// Proceed without it
	}

	return { context, prevContent, newSequence };
}
