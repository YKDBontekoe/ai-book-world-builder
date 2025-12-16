import { generatePrologue } from "@/lib/generation/writer-agent";
import type { StepProcessor, ProcessStepContext } from "./types";
import { saveAsset, updateStepOutput } from "./utils";
import type { BookGenerationStep } from "@/lib/db/schema";

export class PrologueProcessor implements StepProcessor {
	async process(step: BookGenerationStep, context: ProcessStepContext): Promise<void> {
		const { projectData, settings, log } = context;

		log("Generating prologue...", "writer");
		const result = await generatePrologue(
			projectData.projectContext,
			projectData.loreContext,
			settings,
		);

		await saveAsset(step.generationId, "prologue", result.content);
		await updateStepOutput(step.id, {
			agentOutput: result.content,
			wordCount: result.wordCount,
			tokenCount: result.tokenCount,
			usage: result.usage,
		});

		log(`Prologue complete: ${result.wordCount} words`, "writer");
	}
}
