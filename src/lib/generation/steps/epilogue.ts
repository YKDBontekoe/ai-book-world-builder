import { eq } from "drizzle-orm";
import { db } from "@/lib/db/queries";
import { type BookGenerationStep, bookGenerationStep } from "@/lib/db/schema";
import type {
	ProcessStepContext,
	StepHandler,
} from "@/lib/generation/steps/types";
import { saveAsset } from "@/lib/generation/utils";
import { generateEpilogue } from "@/lib/generation/writer-agent";

export class EpilogueHandler implements StepHandler {
	async process(
		step: BookGenerationStep,
		ctx: ProcessStepContext,
	): Promise<void> {
		const { projectData, settings, log } = ctx;
		log("Generating epilogue...", "writer");
		const result = await generateEpilogue(
			projectData.projectContext,
			projectData.loreContext,
			ctx.previousChapterSummary,
			settings,
		);
		await saveAsset(step.generationId, "epilogue", result.content);
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
		log(`Epilogue complete: ${result.wordCount} words`, "writer");
	}
}
