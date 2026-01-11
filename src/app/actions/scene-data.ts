"use server";

import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { db } from "@/lib/db";
import { projectRepository, sceneRepository } from "@/lib/db/repositories";
import {
	type Chapter,
	chapter,
	type Scene,
	type SceneCard,
	sceneCard,
} from "@/lib/db/schema";

// ============================================================================
// Types
// ============================================================================

export type SerializedScene = Scene & {
	card: SceneCard | null;
};

export type SerializedChapterWithScenes = Chapter & {
	scenes: SerializedScene[];
};

// ============================================================================
// Validation Schemas
// ============================================================================

const projectIdSchema = z.object({
	projectId: z.string().uuid("Invalid project ID"),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get all scenes with their cards grouped by chapter
 */
export const getScenesData = createUserAction({
	input: projectIdSchema,
	handler: async ({ user, input }) => {
		const project = await projectRepository.findByIdWithAccess(
			input.projectId,
			user.id,
		);

		if (!project) {
			// Return empty array for non-existent/inaccessible projects
			return [];
		}

		// 1. Fetch all chapters for the project
		const chapters = await db
			.select()
			.from(chapter)
			.where(eq(chapter.projectId, input.projectId))
			.orderBy(asc(chapter.sequence));

		if (chapters.length === 0) {
			return [];
		}

		// 2. Fetch all scenes for the project using repository
		const scenes = await sceneRepository.findByProject(input.projectId);

		// 3. Fetch all scene cards
		const cards = await db
			.select()
			.from(sceneCard)
			.where(eq(sceneCard.projectId, input.projectId));

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
		const result: SerializedChapterWithScenes[] = chapters.map(
			(c: Chapter) => ({
				...c,
				scenes: scenesByChapter.get(c.id) || [],
			}),
		);

		return result;
	},
});
