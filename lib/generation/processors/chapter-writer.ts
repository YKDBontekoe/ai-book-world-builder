import { generateChapter } from "@/lib/generation/writer-agent";
import type { StepProcessor, ProcessStepContext } from "./types";
import { updateStepOutput, getChapterInfo } from "./utils";
import type { BookGenerationStep } from "@/lib/db/schema";

export class ChapterWriterProcessor implements StepProcessor {
	async process(step: BookGenerationStep, context: ProcessStepContext): Promise<void> {
		const { projectData, settings, globalNotes, log, previousChapterSummary, chapterContents } = context;

		const chapterInfo = await getChapterInfo(step.chapterId);
		log(
			`Writing ${chapterInfo?.title || `Chapter ${step.sequence}`}...`,
			"writer",
		);

		const result = await generateChapter({
			chapterNumber: step.sequence,
			chapterTitle: chapterInfo?.title || `Chapter ${step.sequence}`,
			previousChapterSummary: previousChapterSummary,
			projectContext: projectData.projectContext,
			loreContext: projectData.loreContext,
			outlineContent: projectData.outlinePrompts.join("\n"),
			userNotes: globalNotes,
			settings,
		});

		// Store content for review
		if (step.chapterId) {
			chapterContents.set(step.chapterId, result.content);
		}

		await updateStepOutput(step.id, {
			agentOutput: result.content,
			wordCount: result.wordCount,
			tokenCount: result.tokenCount,
			usage: result.usage,
		});

		log(`Chapter writing complete: ${result.wordCount} words`, "writer");
	}
}
