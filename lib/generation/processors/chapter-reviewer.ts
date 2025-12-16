import { reviewChapter } from "@/lib/generation/reviewer-agent";
import type { StepProcessor, ProcessStepContext } from "./types";
import { updateStepOutput } from "./utils";
import type { BookGenerationStep } from "@/lib/db/schema";

export class ChapterReviewerProcessor implements StepProcessor {
	async process(step: BookGenerationStep, context: ProcessStepContext): Promise<void> {
		const { projectData, settings, log, chapterContents } = context;

		const chapterContent = step.chapterId
			? chapterContents.get(step.chapterId) || ""
			: "";

		if (!chapterContent) {
			log("No content to review, skipping", "reviewer");
			return;
		}

		log("Reviewing chapter...", "reviewer");

		const review = await reviewChapter({
			chapterContent,
			chapterNumber: step.sequence,
			chapterTitle: `Chapter ${step.sequence}`,
			projectContext: projectData.projectContext,
			loreContext: projectData.loreContext,
			previousChaptersSummary: context.previousChapterSummary,
			settings,
		});

		await updateStepOutput(step.id, {
			reviewFeedback: JSON.stringify(review),
			usage: review.usage,
		});

		log(
			`Review complete: ${review.overallScore}/10, ${review.revisionPriority} priority`,
			"reviewer",
		);

		// Update chapter summary for next chapters
		if (chapterContent) {
			// Mutating context as intended for sequential processing
			// Note: In strict functional programming this is avoided, but for this pipeline context mutation is simplest.
            // However, context in `processStep` wrapper is `ctx`.
            // In my interface `process(step, context)`, context is an object reference.
            // Assigning to `previousChapterSummary` works if I assign to the object property.

            // Wait, `previousChapterSummary` is a primitive string property in the interface.
            // If I change it here, it won't reflect in the caller unless I pass a mutable wrapper or return the new state.
            // The original code passed `ctx` and mutated `ctx.previousChapterSummary`.

            // In `types.ts`:
            // export interface ProcessStepContext { previousChapterSummary: string; ... }

            // If I do `context.previousChapterSummary = "..."`, it mutates the object. Yes.
			context.previousChapterSummary = `Previous chapter (${review.overallScore}/10): ${chapterContent.substring(0, 500)}...`;
		}
	}
}
