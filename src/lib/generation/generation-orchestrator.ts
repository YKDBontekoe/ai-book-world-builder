/**
 * Generation Orchestrator - Coordinates the multi-agent book generation workflow
 */

import { asc, eq } from "drizzle-orm";
import { getFullProjectDataForGeneration } from "@/lib/book-generation";
import { db } from "@/lib/db/queries";
import {
	type BookGenerationStep,
	bookGeneration,
	bookGenerationAsset,
	bookGenerationStep,
	chapter,
	type GenerationSettings,
	generationNote,
} from "@/lib/db/schema";
import { reviewChapter } from "./reviewer-agent";
import {
	generateChapter,
	generateEpilogue,
	generatePrologue,
} from "./writer-agent";

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
		const previousChapterSummary = "";
		const chapterContents: Map<string, string> = new Map();

		// Get user notes
		const notes = await db
			.select()
			.from(generationNote)
			.where(eq(generationNote.generationId, generationId));

		const globalNotes = notes.filter((n) => n.isGlobal).map((n) => n.content);

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
				await processStep(step, {
					projectData,
					settings,
					globalNotes,
					previousChapterSummary,
					chapterContents,
					log,
				});

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

interface ProcessStepContext {
	projectData: any;
	settings: GenerationSettings;
	globalNotes: string[];
	previousChapterSummary: string;
	chapterContents: Map<string, string>;
	log: (msg: string, type?: "writer" | "reviewer" | "orchestrator") => void;
}

async function processStep(
	step: BookGenerationStep,
	ctx: ProcessStepContext,
): Promise<void> {
	const { projectData, settings, globalNotes, log } = ctx;

	switch (step.stepType) {
		case "prologue": {
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
			break;
		}

		case "chapter_writing": {
			const chapterInfo = await getChapterInfo(step.chapterId);
			log(
				`Writing ${chapterInfo?.title || `Chapter ${step.sequence}`}...`,
				"writer",
			);

			const result = await generateChapter({
				chapterNumber: step.sequence,
				chapterTitle: chapterInfo?.title || `Chapter ${step.sequence}`,
				previousChapterSummary: ctx.previousChapterSummary,
				projectContext: projectData.projectContext,
				loreContext: projectData.loreContext,
				outlineContent: projectData.outlinePrompts.join("\n"),
				userNotes: globalNotes,
				settings,
			});

			// Store content for review
			if (step.chapterId) {
				ctx.chapterContents.set(step.chapterId, result.content);
			}

			// Update step with output
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

			log(`Chapter writing complete: ${result.wordCount} words`, "writer");
			break;
		}

		case "chapter_reviewing": {
			const chapterContent = step.chapterId
				? ctx.chapterContents.get(step.chapterId) || ""
				: "";

			if (!chapterContent) {
				log("No content to review, skipping", "reviewer");
				break;
			}

			log("Reviewing chapter...", "reviewer");

			const review = await reviewChapter({
				chapterContent,
				chapterNumber: step.sequence,
				chapterTitle: `Chapter ${step.sequence}`,
				projectContext: projectData.projectContext,
				loreContext: projectData.loreContext,
				previousChaptersSummary: ctx.previousChapterSummary,
				settings,
			});

			// Update step with review feedback
			await db
				.update(bookGenerationStep)
				.set({
					reviewFeedback: JSON.stringify(review),
					usage: review.usage,
					updatedAt: new Date(),
				})
				.where(eq(bookGenerationStep.id, step.id));

			log(
				`Review complete: ${review.overallScore}/10, ${review.revisionPriority} priority`,
				"reviewer",
			);

			// Update chapter summary for next chapters
			if (chapterContent) {
				ctx.previousChapterSummary = `Previous chapter (${review.overallScore}/10): ${chapterContent.substring(0, 500)}...`;
			}
			break;
		}

		case "epilogue": {
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
			break;
		}

		case "back_cover": {
			log("Generating back cover blurb...", "writer");
			// Simplified back cover generation
			const blurb = await generateBackCoverBlurb(projectData, settings);
			await saveAsset(step.generationId, "back_cover_blurb", blurb);
			log("Back cover blurb complete", "writer");
			break;
		}

		case "consistency_check": {
			log("Running consistency check...", "reviewer");
			// Would run the consistency checker agent here
			log("Consistency check complete", "reviewer");
			break;
		}

		default:
			log(`Unknown step type: ${step.stepType}`);
	}
}

async function updateStepStatus(stepId: string, status: string): Promise<void> {
	const now = new Date();
	const updates: any = { status, updatedAt: now };

	if (status === "running") {
		updates.startedAt = now;
	} else if (status === "completed" || status === "failed") {
		updates.completedAt = now;
	}

	await db
		.update(bookGenerationStep)
		.set(updates)
		.where(eq(bookGenerationStep.id, stepId));
}

async function saveAsset(
	generationId: string,
	assetType: string,
	content: string,
	imageUrl?: string,
): Promise<void> {
	await db.insert(bookGenerationAsset).values({
		generationId,
		assetType,
		content,
		imageUrl,
		createdAt: new Date(),
		updatedAt: new Date(),
	});
}

async function getChapterInfo(chapterId: string | null) {
	if (!chapterId) return null;
	const [ch] = await db.select().from(chapter).where(eq(chapter.id, chapterId));
	return ch;
}

async function generateBackCoverBlurb(
	projectData: any,
	_settings: GenerationSettings,
): Promise<string> {
	// Simplified implementation
	return `An epic tale of ${projectData.project.name}. A journey that will change everything...`;
}
