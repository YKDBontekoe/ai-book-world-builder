/**
 * Generation Orchestrator - Coordinates the multi-agent book generation workflow
 */

import { getFullProjectDataForGeneration } from "@/lib/book-generation";
import { db } from "@/lib/db/queries";
import {
	type BookGenerationStep,
	bookGeneration,
	bookGenerationStep,
	type GenerationSettings,
	generationNote,
} from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { updateStepStatus } from "./utils";

import { BackCoverHandler } from "./steps/back-cover";
import { ChapterReviewingHandler } from "./steps/chapter-reviewing";
import { ChapterWritingHandler } from "./steps/chapter-writing";
import { ConsistencyCheckHandler } from "./steps/consistency-check";
import { EpilogueHandler } from "./steps/epilogue";
import { PrologueHandler } from "./steps/prologue";
import type { ProcessStepContext, StepHandler } from "./steps/types";

export interface GenerationCallbacks {
	onStepStart?: (step: BookGenerationStep) => void;
	onStepComplete?: (step: BookGenerationStep) => void;
	onLog?: (
		message: string,
		type: "writer" | "reviewer" | "orchestrator",
	) => void;
	onProgress?: (completed: number, total: number) => void;
	onError?: (error: Error, step?: BookGenerationStep) => void;
}

interface RunGenerationOptions {
	generationId: string;
	projectId: string;
	userId: string;
	settings: GenerationSettings;
	callbacks?: GenerationCallbacks;
}

const stepHandlers: Record<string, StepHandler> = {
	prologue: new PrologueHandler(),
	chapter_writing: new ChapterWritingHandler(),
	chapter_reviewing: new ChapterReviewingHandler(),
	epilogue: new EpilogueHandler(),
	back_cover: new BackCoverHandler(),
	consistency_check: new ConsistencyCheckHandler(),
};

/**
 * Main orchestration function - runs the entire book generation pipeline
 */
export async function runGeneration({
	generationId,
	projectId,
	userId,
	settings,
	callbacks,
}: RunGenerationOptions): Promise<void> {
	const log = (
		msg: string,
		type: "writer" | "reviewer" | "orchestrator" = "orchestrator",
	) => {
		callbacks?.onLog?.(msg, type);
		console.log(`[${type.toUpperCase()}] ${msg}`);
	};

	try {
		log("Starting book generation...");

		// Fetch project data
		const projectData = await getFullProjectDataForGeneration({
			projectId,
			userId,
		});

		if (!projectData) {
			throw new Error("Project data not found");
		}

		// Get steps in order
		const steps = await db
			.select()
			.from(bookGenerationStep)
			.where(eq(bookGenerationStep.generationId, generationId))
			.orderBy(asc(bookGenerationStep.sequence));

		log(`Found ${steps.length} steps to process`);

		let completedSteps = 0;
		// Initialize context variables
		const context: ProcessStepContext = {
			projectData,
			settings,
			globalNotes: [],
			previousChapterSummary: "",
			chapterContents: new Map(),
			log,
		};

		// Get user notes
		const notes = await db
			.select()
			.from(generationNote)
			.where(eq(generationNote.generationId, generationId));

		context.globalNotes = notes.filter((n) => n.isGlobal).map((n) => n.content);

		for (const step of steps) {
			// Check if generation is paused or cancelled
			const [currentGen] = await db
				.select()
				.from(bookGeneration)
				.where(eq(bookGeneration.id, generationId));

			if (currentGen.status === "paused") {
				log("Generation paused, waiting...");
				// In a real implementation, we'd use a pub/sub or polling mechanism
				await new Promise((r) => setTimeout(r, 5000));
				continue;
			}

			if (currentGen.status === "failed") {
				log("Generation was cancelled");
				return;
			}

			// Update step to running
			await updateStepStatus(step.id, "running");
			callbacks?.onStepStart?.(step);
			log(`Starting step ${step.sequence}: ${step.stepType}`);

			try {
				const handler = stepHandlers[step.stepType];
				if (handler) {
					await handler.process(step, context);
				} else {
					log(`Unknown step type: ${step.stepType}`);
				}

				// Update step to completed
				await updateStepStatus(step.id, "completed");
				completedSteps++;
				callbacks?.onStepComplete?.(step);
				callbacks?.onProgress?.(completedSteps, steps.length);

				// Update generation progress
				await db
					.update(bookGeneration)
					.set({
						completedSteps,
						currentStepId: step.id,
						updatedAt: new Date(),
					})
					.where(eq(bookGeneration.id, generationId));
			} catch (stepError) {
				log(`Step ${step.sequence} failed: ${stepError}`);
				await updateStepStatus(step.id, "failed");
				callbacks?.onError?.(stepError as Error, step);

				// Mark generation as failed
				await db
					.update(bookGeneration)
					.set({
						status: "failed",
						error: (stepError as Error).message,
						updatedAt: new Date(),
					})
					.where(eq(bookGeneration.id, generationId));

				return;
			}
		}

		// Generation complete
		await db
			.update(bookGeneration)
			.set({
				status: "completed",
				completedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(bookGeneration.id, generationId));

		log("Book generation completed successfully!");
	} catch (error) {
		log(`Generation failed: ${error}`);
		await db
			.update(bookGeneration)
			.set({
				status: "failed",
				error: (error as Error).message,
				updatedAt: new Date(),
			})
			.where(eq(bookGeneration.id, generationId));

		callbacks?.onError?.(error as Error);
		throw error;
	}
}
