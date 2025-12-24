import { eq } from "drizzle-orm";
import { db } from "@/lib/db/queries";
import {
	type BookGenerationStep,
	bookGeneration,
	bookGenerationStep,
} from "@/lib/db/schema";
import { updateStepStatus } from "@/lib/generation/utils";

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

export class StepExecutionLogger {
	constructor(
		private generationId: string,
		private callbacks?: GenerationCallbacks,
	) {}

	log(
		msg: string,
		type: "writer" | "reviewer" | "orchestrator" = "orchestrator",
	) {
		this.callbacks?.onLog?.(msg, type);
		console.log(`[${type.toUpperCase()}] ${msg}`);
	}

	async onStepStart(step: BookGenerationStep) {
		await updateStepStatus(step.id, "running");
		this.callbacks?.onStepStart?.(step);
		this.log(`Starting step ${step.sequence}: ${step.stepType}`);
	}

	async onStepComplete(
		step: BookGenerationStep,
		completedSteps: number,
		totalSteps: number,
	) {
		await updateStepStatus(step.id, "completed");
		this.callbacks?.onStepComplete?.(step);
		this.callbacks?.onProgress?.(completedSteps, totalSteps);

		// Update generation progress
		await db
			.update(bookGeneration)
			.set({
				completedSteps,
				currentStepId: step.id,
				updatedAt: new Date(),
			})
			.where(eq(bookGeneration.id, this.generationId));
	}

	async onStepFailed(step: BookGenerationStep, error: Error) {
		this.log(`Step ${step.sequence} failed: ${error}`);
		await updateStepStatus(step.id, "failed");
		this.callbacks?.onError?.(error, step);

		// Mark generation as failed
		await db
			.update(bookGeneration)
			.set({
				status: "failed",
				error: error.message,
				updatedAt: new Date(),
			})
			.where(eq(bookGeneration.id, this.generationId));
	}

	async onGenerationComplete() {
		await db
			.update(bookGeneration)
			.set({
				status: "completed",
				completedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(bookGeneration.id, this.generationId));

		this.log("Book generation completed successfully!");
	}

	async onGenerationFailed(error: Error) {
		this.log(`Generation failed: ${error}`);
		await db
			.update(bookGeneration)
			.set({
				status: "failed",
				error: error.message,
				updatedAt: new Date(),
			})
			.where(eq(bookGeneration.id, this.generationId));

		this.callbacks?.onError?.(error);
	}
}
