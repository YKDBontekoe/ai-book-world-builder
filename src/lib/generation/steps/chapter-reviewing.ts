import { eq } from "drizzle-orm";
import { db } from "@/lib/db/queries";
import { type BookGenerationStep, bookGenerationStep } from "@/lib/db/schema";
import { reviewChapter } from "@/lib/generation/reviewer-agent";
import type {
	ProcessStepContext,
	StepHandler,
} from "@/lib/generation/steps/types";

export class ChapterReviewingHandler implements StepHandler {
	async process(
		step: BookGenerationStep,
		ctx: ProcessStepContext,
	): Promise<void> {
		const { projectData, settings, log } = ctx;
		const chapterContent = step.chapterId
			? ctx.chapterContents.get(step.chapterId) || ""
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
			previousChaptersSummary: ctx.previousChapterSummary,
			settings,
		});

		// Update step with review feedback
		await db
			.update(bookGenerationStep)
			.set({
				reviewFeedback: JSON.stringify(review),
				usage: review.usage,
				updatedAt: new Date(),
			})
			.where(eq(bookGenerationStep.id, step.id));

		log(
			`Review complete: ${review.overallScore}/10, ${review.revisionPriority} priority`,
			"reviewer",
		);

		// Update chapter summary for next chapters
		if (chapterContent) {
			ctx.previousChapterSummary = `Previous chapter (${review.overallScore}/10): ${chapterContent.substring(0, 500)}...`;
		}
	}
}
