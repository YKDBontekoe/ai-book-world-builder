"use server";

import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import {
	type Chapter,
	chapter,
	type Scene,
	type SceneCard,
	scene,
	sceneCard,
} from "@/lib/db/schema";
import { auth } from "@/app/(auth)/auth";
import { getProjectByIdWithAccess } from "@/lib/db/queries";

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
		const session = await auth();
		const userId = session?.user?.id;

		const project = await getProjectByIdWithAccess({
			id: projectId,
			userId,
		});

		if (!project) {
			console.error("Access denied to project:", projectId);
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

		// 2. Fetch all scenes for the project
		// Note: We could filter by chapterIds if needed, but project scope is fine for now
		const scenes = await db
			.select()
			.from(scene)
			.where(eq(scene.projectId, projectId))
			.orderBy(asc(scene.sequence));

		// 3. Fetch all scene cards
		const cards = await db
			.select()
			.from(sceneCard)
			.where(eq(sceneCard.projectId, projectId));

		// 4. Map data together
		// Create a map of sceneId -> SceneCard
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
