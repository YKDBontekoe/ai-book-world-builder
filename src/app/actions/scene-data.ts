"use server";

import { asc, eq } from "drizzle-orm";
import { authorizeProjectAccess } from "@/lib/auth/utils";
import { db } from "@/lib/db/drizzle";
import { sceneRepository } from "@/lib/db/repositories";
import {
	type Chapter,
	chapter,
	type Scene,
	type SceneCard,
	sceneCard,
} from "@/lib/db/schema";

export type SerializedScene = Scene & {
	card: SceneCard | null;
};

export type SerializedChapterWithScenes = Chapter & {
	scenes: SerializedScene[];
};

export async function getScenesData(
	projectId: string,
): Promise<SerializedChapterWithScenes[]> {
	try {
		const authResult = await authorizeProjectAccess(projectId);
		if ("error" in authResult) {
			console.error("Access denied to project:", projectId, authResult.error);
			return [];
		}

		// 1. Fetch all chapters for the project
		const chapters = await db
			.select()
			.from(chapter)
			.where(eq(chapter.projectId, projectId))
			.orderBy(asc(chapter.sequence));

		if (chapters.length === 0) {
			return [];
		}

		// 2. Fetch all scenes for the project using repository
		const scenes = await sceneRepository.findByProject(projectId);

		// 3. Fetch all scene cards
		const cards = await db
			.select()
			.from(sceneCard)
			.where(eq(sceneCard.projectId, projectId));

		// 4. Map data together
		const cardMap = new Map<string, SceneCard>();
		for (const card of cards) {
			cardMap.set(card.sceneId, card);
		}

		// Group scenes by chapter
		const scenesByChapter = new Map<string, SerializedScene[]>();
		for (const s of scenes) {
			const sceneWithCard: SerializedScene = {
				...s,
				card: cardMap.get(s.id) || null,
			};

			const chapterScenes = scenesByChapter.get(s.chapterId) || [];
			chapterScenes.push(sceneWithCard);
			scenesByChapter.set(s.chapterId, chapterScenes);
		}

		// 5. Construct result
		const result: SerializedChapterWithScenes[] = chapters.map((c) => ({
			...c,
			scenes: scenesByChapter.get(c.id) || [],
		}));

		return result;
	} catch (error) {
		console.error("Failed to fetch scene data:", error);
		return [];
	}
}
