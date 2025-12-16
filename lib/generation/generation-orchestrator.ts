/**
 * Generation Orchestrator - Coordinates the multi-agent book generation workflow
 */

import { asc, eq } from "drizzle-orm";
import { getFullProjectDataForGeneration } from "@/lib/book-generation";
import { db } from "@/lib/db/queries";
import {
	type BookGenerationStep,
	bookGeneration,
	bookGenerationStep,
	type GenerationSettings,
	generationNote,
} from "@/lib/db/schema";
import { updateStepStatus } from "./processors/utils";
import { PrologueProcessor } from "./processors/prologue";
import { ChapterWriterProcessor } from "./processors/chapter-writer";
import { ChapterReviewerProcessor } from "./processors/chapter-reviewer";
import { EpilogueProcessor } from "./processors/epilogue";
import { BackCoverProcessor, ConsistencyCheckProcessor } from "./processors/misc";
import type { StepProcessor, ProcessStepContext } from "./processors/types";

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

const processors: Record<string, StepProcessor> = {
	prologue: new PrologueProcessor(),
	chapter_writing: new ChapterWriterProcessor(),
	chapter_reviewing: new ChapterReviewerProcessor(),
	epilogue: new EpilogueProcessor(),
	back_cover: new BackCoverProcessor(),
	consistency_check: new ConsistencyCheckProcessor(),
	// Fallback for front_cover or others
	front_cover: {
		process: async (s, c) => c.log("Front cover generation not implemented yet", "writer")
	}
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
		const chapterContents: Map<string, string> = new Map();

		// Get user notes
		const notes = await db
			.select()
			.from(generationNote)
			.where(eq(generationNote.generationId, generationId));

		const globalNotes = notes.filter((n) => n.isGlobal).map((n) => n.content);

		const context: ProcessStepContext = {
			projectData,
			settings,
			globalNotes,
			previousChapterSummary: "",
			chapterContents,
			log,
		};

		for (const step of steps) {
			// Check if generation is paused or cancelled
			const [currentGen] = await db
				.select()
				.from(bookGeneration)
				.where(eq(bookGeneration.id, generationId));

			if (currentGen.status === "paused") {
				log("Generation paused, waiting...");
				// In a real implementation, we'd use a pub/sub or polling mechanism
				// For now we just stop processing; the resume action will restart the loop (needs logic adjustment)
				// Actually, runGeneration is "fire and forget" background job.
				// If we break here, the loop exits. Resume needs to call runGeneration again?
				// The Resume action in actions.ts just updates DB. It doesn't call runGeneration again.
				// This implies the background process must be persistent or re-triggered.
				// The original code had `await new Promise((r) => setTimeout(r, 5000)); continue;` which implies busy waiting?
				// But that was a bad pattern.
				// For now, I'll keep the loop behavior to mimic original but with a comment.
				// Original:
				/*
				if (currentGen.status === "paused") {
					log("Generation paused, waiting...");
					await new Promise((r) => setTimeout(r, 5000));
					continue;
				}
				*/
				// I'll keep it for behavior parity.
				await new Promise((r) => setTimeout(r, 5000));
				continue;
			}

			if (currentGen.status === "failed") {
				log("Generation was cancelled");
				return;
			}

			if (step.status === "completed") {
				completedSteps++;
				continue;
			}

			// Update step to running
			await updateStepStatus(step.id, "running");
			callbacks?.onStepStart?.(step);
			log(`Starting step ${step.sequence}: ${step.stepType}`);

			try {
				await processStep(step, context);

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

async function processStep(
	step: BookGenerationStep,
	ctx: ProcessStepContext,
): Promise<void> {
	const processor = processors[step.stepType];
	if (processor) {
		await processor.process(step, ctx);
	} else {
		ctx.log(`Unknown step type: ${step.stepType} - Skipping`);
	}
}
