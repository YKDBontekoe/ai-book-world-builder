"use server";

import { asc, eq } from "drizzle-orm";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { db } from "@/lib/db";
import { chapter, scene } from "@/lib/db/schema";

export interface ExportResult {
	success: boolean;
	content?: string;
	error?: string;
}

export async function exportProject(
	projectId: string,
): Promise<ExportResult> {
	try {
		await ensureProjectAccess(projectId);

		// Fetch chapters
		const chapters = await db
			.select()
			.from(chapter)
			.where(eq(chapter.projectId, projectId))
			.orderBy(asc(chapter.sequence));

		// Fetch scenes
		const scenes = await db
			.select()
			.from(scene)
			.where(eq(scene.projectId, projectId))
			.orderBy(asc(scene.sequence));

		// Group scenes by chapter
		const scenesByChapter = new Map<string, typeof scenes>();
		for (const s of scenes) {
			const chId = s.chapterId;
			if (!scenesByChapter.has(chId)) {
				scenesByChapter.set(chId, []);
			}
			scenesByChapter.get(chId)!.push(s);
		}

		let content = "";

		for (const ch of chapters) {
			content += `# ${ch.title}\n\n`;
			const chScenes = scenesByChapter.get(ch.id) || [];

			for (const sc of chScenes) {
				content += `## ${sc.title}\n\n`;
				if (sc.content) {
					content += `${sc.content}\n\n`;
				}
				content += `***\n\n`;
			}
			content += `---\n\n`;
		}

		return { success: true, content };
	} catch (error) {
		console.error("Failed to export project", error);
		return { success: false, error: "Failed to export project" };
	}
}
