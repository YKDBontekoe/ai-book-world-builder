import { generateEpilogue } from "@/lib/generation/writer-agent";
import type { StepProcessor, ProcessStepContext } from "./types";
import { saveAsset, updateStepOutput } from "./utils";
import type { BookGenerationStep } from "@/lib/db/schema";

export class EpilogueProcessor implements StepProcessor {
	async process(step: BookGenerationStep, context: ProcessStepContext): Promise<void> {
		const { projectData, settings, log, previousChapterSummary } = context;

		log("Generating epilogue...", "writer");
		const result = await generateEpilogue(
			projectData.projectContext,
			projectData.loreContext,
			previousChapterSummary,
			settings,
		);

		await saveAsset(step.generationId, "epilogue", result.content);
		await updateStepOutput(step.id, {
			agentOutput: result.content,
			wordCount: result.wordCount,
			tokenCount: result.tokenCount,
			usage: result.usage,
		});

		log(`Epilogue complete: ${result.wordCount} words`, "writer");
	}
}
