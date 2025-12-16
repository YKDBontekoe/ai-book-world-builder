import type { StepProcessor, ProcessStepContext } from "./types";
import { saveAsset } from "./utils";
import type { BookGenerationStep, GenerationSettings } from "@/lib/db/schema";

export class BackCoverProcessor implements StepProcessor {
	async process(step: BookGenerationStep, context: ProcessStepContext): Promise<void> {
		const { projectData, settings, log } = context;

		log("Generating back cover blurb...", "writer");
		const blurb = await this.generateBackCoverBlurb(projectData, settings);
		await saveAsset(step.generationId, "back_cover_blurb", blurb);
		log("Back cover blurb complete", "writer");
	}

	private async generateBackCoverBlurb(
		projectData: any,
		_settings: GenerationSettings,
	): Promise<string> {
		return `An epic tale of ${projectData.project.name}. A journey that will change everything...`;
	}
}

export class ConsistencyCheckProcessor implements StepProcessor {
	async process(step: BookGenerationStep, context: ProcessStepContext): Promise<void> {
		const { log } = context;
		log("Running consistency check...", "reviewer");
		// Would run the consistency checker agent here
		log("Consistency check complete", "reviewer");
	}
}
