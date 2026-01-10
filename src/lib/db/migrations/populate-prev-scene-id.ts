import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { scene } from "@/lib/db/schema";

async function main() {
	console.log("Starting migration: populate prevSceneId...");

	// Fetch all scenes
	const allScenes = await db.select().from(scene);

	const scenesByChapter: Record<string, typeof allScenes> = {};

	for (const s of allScenes) {
		if (!scenesByChapter[s.chapterId]) {
			scenesByChapter[s.chapterId] = [];
		}
		scenesByChapter[s.chapterId].push(s);
	}

	for (const chapterId in scenesByChapter) {
		const chapterScenes = scenesByChapter[chapterId];
		// Sort by sequence
		chapterScenes.sort((a, b) => a.sequence - b.sequence);

		for (let i = 1; i < chapterScenes.length; i++) {
			const current = chapterScenes[i];
			const prev = chapterScenes[i - 1];

			if (current.prevSceneId) continue;

			console.log(`Linking scene ${current.id} to prev ${prev.id}`);
			await db
				.update(scene)
				.set({ prevSceneId: prev.id })
				.where(eq(scene.id, current.id));
		}
	}

	console.log("Migration complete.");
	process.exit(0);
}

main().catch(console.error);
