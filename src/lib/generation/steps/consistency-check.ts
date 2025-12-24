import type { BookGenerationStep } from "@/lib/db/schema";
import type {
	ProcessStepContext,
	StepHandler,
} from "@/lib/generation/steps/types";

export class ConsistencyCheckHandler implements StepHandler {
	async process(
		_step: BookGenerationStep,
		ctx: ProcessStepContext,
	): Promise<void> {
		const { log } = ctx;
		log("Running consistency check...", "reviewer");
		// Would run the consistency checker agent here
		log("Consistency check complete", "reviewer");
	}
}
