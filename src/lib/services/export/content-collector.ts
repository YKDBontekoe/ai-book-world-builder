import { asc, eq } from "drizzle-orm";
import type { FullProjectData } from "@/lib/book-generation";
import { db } from "@/lib/db/queries";
import { bookGenerationAsset, bookGenerationStep } from "@/lib/db/schema";
import type { BookContent } from "./types";

export class BookContentCollector {
	/**
	 * Collects all chapter draft content from the project data.
	 * First tries to get content from generation steps (new system),
	 * then falls back to chapter drafts (old system).
	 */
	async collect(projectData: FullProjectData): Promise<BookContent> {
		const chapters: Array<{ title: string; content: string }> = [];
		let prologue: string | undefined;
		let epilogue: string | undefined;

		// If we have an active generation, fetch content from generation steps
		if (projectData.generation) {
			const generationId = projectData.generation.id;

			// Fetch all completed generation steps
			const steps = await db
				.select()
				.from(bookGenerationStep)
				.where(eq(bookGenerationStep.generationId, generationId))
				.orderBy(asc(bookGenerationStep.sequence));

			// Fetch all generation assets (prologue, epilogue, etc.)
			const assets = await db
				.select()
				.from(bookGenerationAsset)
				.where(eq(bookGenerationAsset.generationId, generationId));

			// Get prologue from assets
			const prologueAsset = assets.find((a) => a.assetType === "prologue");
			if (prologueAsset?.content) {
				prologue = prologueAsset.content;
			}

			// Get epilogue from assets
			const epilogueAsset = assets.find((a) => a.assetType === "epilogue");
			if (epilogueAsset?.content) {
				epilogue = epilogueAsset.content;
			}

			// Get chapter content from steps
			let chapterIndex = 1;
			for (const step of steps) {
				if (step.stepType === "chapter_writing" && step.agentOutput) {
					// Try to find the chapter title from volumes
					let chapterTitle = `Chapter ${chapterIndex}`;

					if (step.chapterId) {
						for (const vol of projectData.volumes) {
							const foundChapter = vol.chapters.find(
								(c) => c.id === step.chapterId,
							);
							if (foundChapter) {
								chapterTitle = foundChapter.title;
								break;
							}
						}
					}

					chapters.push({
						title: chapterTitle,
						content: step.agentOutput,
					});
					chapterIndex++;
				}
			}
		}

		// If no generation content, fall back to chapter drafts
		if (chapters.length === 0) {
			for (const vol of projectData.volumes) {
				for (const chap of vol.chapters) {
					const latestDraft = chap.drafts[0];
					if (latestDraft) {
						chapters.push({
							title: chap.title,
							content: latestDraft.content,
						});
					}
				}
			}
		}

		return {
			title: projectData.project.name,
			prologue,
			chapters,
			epilogue,
		};
	}
}
