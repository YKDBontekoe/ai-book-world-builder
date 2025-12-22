import { db } from "@/lib/db/queries";
import { bookGenerationStep, type BookGenerationStep } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { saveAsset } from "@/lib/generation/utils";
import { generatePrologue } from "@/lib/generation/writer-agent";
import type { ProcessStepContext, StepHandler } from "@/lib/generation/steps/types";

export class PrologueHandler implements StepHandler {
	async process(
		step: BookGenerationStep,
		ctx: ProcessStepContext,
	): Promise<void> {
		const { projectData, settings, log } = ctx;
		log("Generating prologue...", "writer");
		const result = await generatePrologue(
			projectData.projectContext,
			projectData.loreContext,
			settings,
		);
		await saveAsset(step.generationId, "prologue", result.content);
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
		log(`Prologue complete: ${result.wordCount} words`, "writer");
	}
}
