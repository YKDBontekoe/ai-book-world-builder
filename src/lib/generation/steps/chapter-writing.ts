import { db } from "@/lib/db/queries";
import {
	type BookGenerationStep,
	bookGenerationStep,
	chapter,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateChapter } from "../writer-agent";
import type { ProcessStepContext, StepHandler } from "./types";

async function getChapterInfo(chapterId: string | null) {
	if (!chapterId) return null;
	const [ch] = await db.select().from(chapter).where(eq(chapter.id, chapterId));
	return ch;
}

export class ChapterWritingHandler implements StepHandler {
	async process(
		step: BookGenerationStep,
		ctx: ProcessStepContext,
	): Promise<void> {
		const { projectData, settings, globalNotes, log } = ctx;
		const chapterInfo = await getChapterInfo(step.chapterId);
		log(
			`Writing ${chapterInfo?.title || `Chapter ${step.sequence}`}...`,
			"writer",
		);

		const result = await generateChapter({
			chapterNumber: step.sequence,
			chapterTitle: chapterInfo?.title || `Chapter ${step.sequence}`,
			previousChapterSummary: ctx.previousChapterSummary,
			projectContext: projectData.projectContext,
			loreContext: projectData.loreContext,
			outlineContent: projectData.outlinePrompts.join("\n"),
			userNotes: globalNotes,
			settings,
		});

		// Store content for review
		if (step.chapterId) {
			ctx.chapterContents.set(step.chapterId, result.content);
		}

		// Update step with output
		await db
			.update(bookGenerationStep)
			.set({
				agentOutput: result.content,
				wordCount: result.wordCount,
				tokenCount: result.tokenCount,
				usage: result.usage,
				updatedAt: new Date(),
			})
			.where(eq(bookGenerationStep.id, step.id));

		log(`Chapter writing complete: ${result.wordCount} words`, "writer");
	}
}
