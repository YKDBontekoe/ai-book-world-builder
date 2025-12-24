import { asc, eq } from "drizzle-orm";
import { getFullProjectDataForGeneration } from "@/lib/book-generation";
import { db } from "@/lib/db/queries";
import {
	bookGeneration,
	bookGenerationStep,
	type GenerationSettings,
	generationNote,
} from "@/lib/db/schema";
import {
	type GenerationCallbacks,
	StepExecutionLogger,
} from "@/lib/generation/step-logger";
import { BackCoverHandler } from "@/lib/generation/steps/back-cover";
import { ChapterReviewingHandler } from "@/lib/generation/steps/chapter-reviewing";
import { ChapterWritingHandler } from "@/lib/generation/steps/chapter-writing";
import { ConsistencyCheckHandler } from "@/lib/generation/steps/consistency-check";
import { EpilogueHandler } from "@/lib/generation/steps/epilogue";
import { PrologueHandler } from "@/lib/generation/steps/prologue";
import type {
	ProcessStepContext,
	StepHandler,
} from "@/lib/generation/steps/types";

const stepHandlers: Record<string, StepHandler> = {
	prologue: new PrologueHandler(),
	chapter_writing: new ChapterWritingHandler(),
	chapter_reviewing: new ChapterReviewingHandler(),
	epilogue: new EpilogueHandler(),
	back_cover: new BackCoverHandler(),
	consistency_check: new ConsistencyCheckHandler(),
};

interface RunGenerationOptions {
	generationId: string;
	projectId: string;
	userId: string;
	settings: GenerationSettings;
	callbacks?: GenerationCallbacks;
}

export class GenerationPipeline {
	private logger: StepExecutionLogger;

	constructor(private options: RunGenerationOptions) {
		this.logger = new StepExecutionLogger(
			options.generationId,
			options.callbacks,
		);
	}

	async execute() {
		const { generationId, projectId, userId, settings } = this.options;
		const log = this.logger.log.bind(this.logger);

		try {
			log("Starting book generation...");

			// 1. Fetch Data
			const projectData = await getFullProjectDataForGeneration({
				projectId,
				userId,
			});
			if (!projectData) throw new Error("Project data not found");

			const steps = await db
				.select()
				.from(bookGenerationStep)
				.where(eq(bookGenerationStep.generationId, generationId))
				.orderBy(asc(bookGenerationStep.sequence));

			log(`Found ${steps.length} steps to process`);

			// 2. Prepare Context
			const notes = await db
				.select()
				.from(generationNote)
				.where(eq(generationNote.generationId, generationId));

			const context: ProcessStepContext = {
				projectData,
				settings,
				globalNotes: notes.filter((n) => n.isGlobal).map((n) => n.content),
				previousChapterSummary: "",
				chapterContents: new Map(),
				log,
			};

			// 3. Run Loop
			let completedSteps = 0;
			for (const step of steps) {
				if (await this.shouldPauseOrStop(generationId, log)) return;

				await this.logger.onStepStart(step);

				try {
					const handler = stepHandlers[step.stepType];
					if (handler) {
						await handler.process(step, context);
					} else {
						log(`Unknown step type: ${step.stepType}`);
					}

					completedSteps++;
					await this.logger.onStepComplete(step, completedSteps, steps.length);
				} catch (stepError) {
					await this.logger.onStepFailed(step, stepError as Error);
					return;
				}
			}

			await this.logger.onGenerationComplete();
		} catch (error) {
			await this.logger.onGenerationFailed(error as Error);
			throw error;
		}
	}

	private async shouldPauseOrStop(
		generationId: string,
		log: (msg: string) => void,
	): Promise<boolean> {
		const [currentGen] = await db
			.select()
			.from(bookGeneration)
			.where(eq(bookGeneration.id, generationId));

		if (currentGen.status === "paused") {
			log("Generation paused, waiting...");
			// In a real implementation, we'd use a pub/sub or polling mechanism
			// For now, we just stop the loop, assuming it will be restarted by a cron/job later
			// But the original code just waited 5s.
			// To respect original behavior roughly (without infinite loop risk in serverless):
			return true;
		}

		if (currentGen.status === "failed") {
			log("Generation was cancelled");
			return true;
		}
		return false;
	}
}
