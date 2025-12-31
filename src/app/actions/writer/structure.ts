"use server";

import { asc, eq } from "drizzle-orm";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { getCached, clearCacheByPrefix } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { sceneRepository } from "@/lib/db/repositories";
import { chapter } from "@/lib/db/schema";

export async function getProjectStructure(projectId: string) {
	try {
		// 1. Verify Access (Read is sufficient)
		await ensureProjectAccess(projectId);

		const cached = await getCached(`project-structure:${projectId}`);
		if (cached) return cached;

		// 2. Fetch all data in parallel
		const [chapters, allScenes] = await Promise.all([
			db
				.select()
				.from(chapter)
				.where(eq(chapter.projectId, projectId))
				.orderBy(asc(chapter.sequence)),
			sceneRepository.findByProject(projectId, true), // excludeContent for efficiency
		]);

		// 3. Map scenes to chapters in memory
		const scenesByChapter = allScenes.reduce(
			(acc, s) => {
				if (!acc[s.chapterId]) {
					acc[s.chapterId] = [];
				}
				acc[s.chapterId].push(s);
				return acc;
			},
			{} as Record<string, typeof allScenes>,
		);

		const structure = chapters.map((ch) => ({
			...ch,
			scenes: scenesByChapter[ch.id] || [],
		}));

		// 4. Generate text representation
		const structureText = formatStructure(structure);

		return { structure, structureText };
	} catch (error) {
		console.error("Failed to fetch project structure", error);
		return { structure: [], structureText: "" };
	}
}

function formatStructure(
	structure: {
		sequence: number;
		title: string;
		scenes: { sequence: number; title: string }[];
	}[],
) {
	return structure
		.map((ch) => {
			const chHeader = `Chapter ${ch.sequence}: ${ch.title}`;
			const scenesText = ch.scenes
				.map((s) => `  Scene ${s.sequence}: ${s.title}`)
				.join("\n");
			return `${chHeader}\n${scenesText}`;
		})
		.join("\n\n");
}

export async function saveProjectStructure(
	projectId: string,
	_structureText: string,
) {
	try {
		// Verify Access (Write)
		await ensureProjectAccess(projectId, true);

		// Placeholder implementation for StructureEditorDialog

		await clearCacheByPrefix(`project-structure:${projectId}`);

		return { success: true };
	} catch (error) {
		console.error("Failed to save project structure", error);
		return { success: false };
	}
}
