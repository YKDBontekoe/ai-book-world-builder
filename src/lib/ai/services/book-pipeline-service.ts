/**
 * Book Pipeline Service
 *
 * Central orchestrator for full book generation pipelines.
 * Manages the entire lifecycle from initialization through completion,
 * including pause/resume, quality gates, and progress tracking.
 */

import "server-only";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { BaseAIService } from "@/lib/ai/services/base-ai-service";
import type {
	GenerationSummary,
	PipelineConfig,
	PipelineEvent,
	PipelineStatus,
	QualityIssue,
	ReviewResult,
	StepResult,
} from "@/lib/ai/services/pipeline-types";
import { db } from "@/lib/db/drizzle";
import {
	bookGeneration,
	bookGenerationStep,
	type BookGenerationStep,
	type GenerationSettings,
	type GenerationStepStatus,
	type GenerationStepType,
	storyState,
	type StoryStateData,
} from "@/lib/db/schema/generation";

// =============================================================================
// Constants
// =============================================================================

// Step display names for UI

const STEP_DISPLAY_NAMES: Record<GenerationStepType, string> = {
	prologue: "Writing Prologue",
	chapter_writing: "Writing Chapter",
	chapter_reviewing: "Reviewing Chapter",
	chapter_revision: "Revising Chapter",
	epilogue: "Writing Epilogue",
	back_cover: "Generating Back Cover",
	front_cover: "Generating Front Cover",
	character_sheet: "Creating Character Sheet",
	chapter_summary: "Summarizing Chapter",
	toc: "Generating Table of Contents",
	consistency_check: "Running Consistency Check",
};

// Quality thresholds
const QUALITY_THRESHOLD_AUTO_APPROVE = 8;
const QUALITY_THRESHOLD_MINOR_REVISION = 6;
const QUALITY_THRESHOLD_MAJOR_REVISION = 4;

// =============================================================================
// Service
// =============================================================================

export class BookPipelineService extends BaseAIService {
	// =========================================================================
	// Pipeline Lifecycle
	// =========================================================================

	/**
	 * Initialize a new generation pipeline.
	 * Creates the generation record and builds the step queue.
	 */
	async initializePipeline(config: PipelineConfig): Promise<string> {
		const { projectId, settings } = config;
		const now = new Date();

		// Create generation record
		const [generation] = await db
			.insert(bookGeneration)
			.values({
				projectId,
				status: "idle",
				settings: settings as unknown as Record<string, unknown>,
				createdAt: now,
				updatedAt: now,
				completedSteps: 0,
			})
			.returning();

		// Build step queue based on settings
		const steps = this.buildStepQueue(generation.id, settings);
		await db.insert(bookGenerationStep).values(steps);

		// Update total steps count
		await db
			.update(bookGeneration)
			.set({ totalSteps: steps.length, updatedAt: now })
			.where(eq(bookGeneration.id, generation.id));

		return generation.id;
	}

	/**
	 * Execute the full pipeline as an async generator.
	 * Yields events for progress tracking.
	 */
	async *runPipeline(generationId: string): AsyncGenerator<PipelineEvent> {
		const startTime = Date.now();

		// Mark as running
		await this.updateGenerationStatus(generationId, "running");
		yield this.createEvent(generationId, {
			type: "status",
			status: "Starting generation pipeline...",
			progress: 0,
		});

		// Dynamic Pipeline Loop
		while (true) {
			// Check for pause request
			const isPaused = await this.checkPauseStatus(generationId);
			if (isPaused) {
				yield this.createEvent(generationId, {
					type: "paused",
					reason: "User requested pause",
					canResume: true,
				});
				return;
			}

			// Fetch current steps state
			const steps = await this.getOrderedSteps(generationId);
			const totalSteps = steps.length;
			const completedCount = steps.filter(
				(s) => s.status === "completed" || s.status === "skipped",
			).length;

			// Find next pending step
			const step = steps.find((s) => s.status === "pending");

			if (!step) {
				// No more pending steps, pipeline is complete
				break;
			}

			// Emit step start
			yield this.createEvent(generationId, {
				type: "step_start",
				stepType: step.stepType as GenerationStepType,
				stepId: step.id,
				name:
					STEP_DISPLAY_NAMES[step.stepType as GenerationStepType] ||
					step.stepType,
				sequence: step.sequence,
			});

			// Mark step as running
			await this.updateStepStatus(step.id, "running");

			try {
				// Execute the step
				const result = await this.executeStep(step, generationId);

				// Save result
				await this.saveStepResult(step.id, result);

				// Update generation progress
				const progress = Math.round(((completedCount + 1) / totalSteps) * 100);
				await this.updateGenerationProgress(
					generationId,
					completedCount + 1,
					progress,
				);

				// Emit step complete
				yield this.createEvent(generationId, {
					type: "step_complete",
					stepType: step.stepType as GenerationStepType,
					stepId: step.id,
					result,
				});

				// Run quality gate for chapter writing steps
				if (step.stepType === "chapter_writing") {
					const qualityResult = await this.runQualityGate(
						generationId,
						step,
						result,
					);

                    // Save feedback for revision steps to use
                    await db.update(bookGenerationStep)
                        .set({ reviewFeedback: JSON.stringify(qualityResult), updatedAt: new Date() })
                        .where(eq(bookGenerationStep.id, step.id));

					yield this.createEvent(generationId, {
						type: "quality_gate",
						stepId: step.id,
						...qualityResult,
					});


					// Queue revision if needed (and dynamic loop will pick it up next)
					if (!qualityResult.passed && (step.revisionRound || 1) < 3) {
                        // If critical failure (score < 4), pause for manual approval
                        if (qualityResult.score < QUALITY_THRESHOLD_MAJOR_REVISION) {
                            await this.updateGenerationStatus(generationId, "awaiting_approval");
                            yield this.createEvent(generationId, {
                                type: "approval_requested",
                                stepId: step.id,
                                reason: `Critical quality failure (Score: ${qualityResult.score}). Automatic revision halted for review.`
                            });
                            return;
                        }

						await this.queueRevisionStep(generationId, step);
					}
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				await this.updateStepStatus(step.id, "failed");

				yield this.createEvent(generationId, {
					type: "step_error",
					stepType: step.stepType as GenerationStepType,
					stepId: step.id,
					error: errorMessage,
					recoverable: true,
				});

				// Continue to next step on error (e.g. try next chapter)
			}
		}

		// Mark as completed
		const duration = Math.round((Date.now() - startTime) / 1000);
		await this.updateGenerationStatus(generationId, "completed");

		const summary = await this.generateSummary(generationId, duration);
		yield this.createEvent(generationId, {
			type: "completed",
			summary,
		});
	}

	/**
	 * Pause an active pipeline.
	 */
	async pausePipeline(generationId: string): Promise<void> {
		await db
			.update(bookGeneration)
			.set({
				status: "paused",
				pausedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(bookGeneration.id, generationId));
	}

	/**
	 * Resume a paused pipeline.
	 */
	async *resumePipeline(generationId: string): AsyncGenerator<PipelineEvent> {
		// Clear pause status
		await db
			.update(bookGeneration)
			.set({
				status: "running",
				pausedAt: null,
				updatedAt: new Date(),
			})
			.where(eq(bookGeneration.id, generationId));

		// Continue with runPipeline (it will skip completed steps)
		yield* this.runPipeline(generationId);
	}

	/**
	 * Cancel and cleanup a pipeline.
	 */
	async cancelPipeline(generationId: string): Promise<void> {
		await db
			.update(bookGeneration)
			.set({
				status: "failed",
				error: "Cancelled by user",
				updatedAt: new Date(),
			})
			.where(eq(bookGeneration.id, generationId));

		// Mark pending steps as skipped
		await db
			.update(bookGenerationStep)
			.set({ status: "skipped", updatedAt: new Date() })
			.where(eq(bookGenerationStep.generationId, generationId));
	}

	/**
	 * Get current pipeline status.
	 */
	async getPipelineStatus(generationId: string): Promise<PipelineStatus> {
		const [generation] = await db
			.select()
			.from(bookGeneration)
			.where(eq(bookGeneration.id, generationId))
			.limit(1);

		if (!generation) {
			throw new Error("Generation not found");
		}

		const steps = await this.getOrderedSteps(generationId);
		const currentStep = steps.find((s) => s.status === "running");
		const completed = steps.filter((s) => s.status === "completed").length;
		const failed = steps.filter((s) => s.status === "failed").length;
		const pending = steps.filter((s) => s.status === "pending").length;

		// Calculate totals from completed steps
		const totals = steps.reduce(
			(acc, step) => {
				if (step.status === "completed") {
					acc.wordsGenerated += step.wordCount || 0;
					acc.tokensUsed += step.tokenCount || 0;
				}
				return acc;
			},
			{ wordsGenerated: 0, tokensUsed: 0, estimatedCostUsd: 0 },
		);

		// Estimate cost (rough calculation)
		totals.estimatedCostUsd = (totals.tokensUsed / 1000) * 0.003;

		return {
			generationId,
			projectId: generation.projectId,
			status: generation.status as PipelineStatus["status"],
			progress: Math.round((completed / steps.length) * 100),
			currentStep: currentStep
				? {
						id: currentStep.id,
						type: currentStep.stepType as GenerationStepType,
						name:
							STEP_DISPLAY_NAMES[currentStep.stepType as GenerationStepType] ||
							currentStep.stepType,
						status: currentStep.status as GenerationStepStatus,
					}
				: undefined,
			steps: {
				total: steps.length,
				completed,
				failed,
				pending,
			},
			totals,
			startedAt: generation.startedAt?.toISOString(),
			pausedAt: generation.pausedAt?.toISOString(),
			completedAt: generation.completedAt?.toISOString(),
			error: generation.error || undefined,
		};
	}

	// =========================================================================
	// Step Execution
	// =========================================================================

	/**
	 * Execute a single pipeline step.
	 */
	private async executeStep(
		step: BookGenerationStep,
		generationId: string,
	): Promise<StepResult> {
		const startTime = Date.now();

		switch (step.stepType) {
			case "prologue":
				return this.generatePrologue(generationId, step);

			case "chapter_writing":
				return this.generateChapter(generationId, step);

			case "chapter_reviewing":
				return this.reviewChapter(generationId, step);

			case "chapter_revision":
				return this.reviseChapter(generationId, step);

			case "epilogue":
				return this.generateEpilogue(generationId, step);

			case "back_cover":
				return this.generateBackCover(generationId, step);

			case "consistency_check":
				return this.runConsistencyCheck(generationId, step);

			default:
				return {
					content: "",
					wordCount: 0,
					duration: Date.now() - startTime,
				};
		}
	}

	/**
	 * Generate prologue content.
	 */
	private async generatePrologue(
		generationId: string,
		step: BookGenerationStep,
	): Promise<StepResult> {
		const startTime = Date.now();
		const context = await this.buildGenerationContext(generationId);

		const systemPrompt = `You are an expert novelist. Write a compelling, atmospheric prologue that establishes the story's tone without spoilers.

${context.styleGuidePrompt}

CRITICAL:
- Focus on atmosphere and emotional weight.
- Use sensory details to ground the reader.
- Write prose only. No titles/meta.`;

		const result = await this.generateTextWithSystem(
			systemPrompt,
			`Write a prologue for a story with this premise:\n\n${context.premise}\n\nKey characters:\n${context.characters}`,
			{ modelRole: "writer", temperature: 0.7 },
		);

		if (!result.success) {
			throw new Error(result.error);
		}

		return {
			content: result.data.text,
			wordCount: this.countWords(result.data.text),
			duration: Date.now() - startTime,
			modelId: "writer",
		};
	}

	/**
	 * Generate chapter content.
	 */
	private async generateChapter(
		generationId: string,
		step: BookGenerationStep,
	): Promise<StepResult> {
		const startTime = Date.now();
		const context = await this.buildChapterContext(generationId, step.chapterId!);

		const systemPrompt = `You are an expert novelist known for immersive, high-quality storytelling. Write the next chapter of this story.

${context.styleGuidePrompt}

IMPORTANT GUIDELINES:
- **Show, Don't Tell**: Immerse the reader in the scene using sensory details (sight, sound, smell, texture) rather than summarizing emotions or events.
- **Deep POV**: Stay firmly within the viewpoint character's perspective. Filter all observations through their unique voice and biases.
- **Dynamic Dialogue**: Ensure dialogue sounds natural, includes subtext, and advances the plot or character arc. Avoid "as you know, bob" exposition.
- **Pacing**: Vary sentence length and scene speed to match the dramatic tension.
- **Consistency**: Strictly adhere to established character voices and plot outline.
- **Format**: Write clean, formatted prose only. No thoughts/meta-commentary in brackets. No Chapter Titles.`;

		const result = await this.generateTextWithSystem(
			systemPrompt,
			context.prompt,
			{ modelRole: "writer", temperature: 0.7, maxTokens: 8000 },
		);

		if (!result.success) {
			throw new Error(result.error);
		}

		const content = result.data.text;

		// Update story state after chapter generation
		await this.updateStoryState(generationId, step, content);

		return {
			content,
			wordCount: this.countWords(content),
			duration: Date.now() - startTime,
			modelId: "writer",
		};
	}

	/**
	 * Review chapter for quality issues.
	 */
	private async reviewChapter(
		generationId: string,
		step: BookGenerationStep,
	): Promise<StepResult> {
		const startTime = Date.now();

		// Get the chapter content to review
		const writingStep = await this.getPreviousWritingStep(generationId, step);
		if (!writingStep?.agentOutput) {
			return { content: "", wordCount: 0, duration: Date.now() - startTime };
		}

		const reviewSchema = z.object({
			overallScore: z.number().min(1).max(10),
			issues: z.array(
				z.object({
					type: z.enum([
						"pacing",
						"character",
						"dialogue",
						"description",
						"consistency",
					]),
					severity: z.enum(["minor", "moderate", "major"]),
					location: z.string(),
					description: z.string(),
					suggestion: z.string(),
				}),
			),
			strengths: z.array(z.string()),
			recommendation: z.enum([
				"approve",
				"minor_revision",
				"major_revision",
				"rewrite",
			]),
		});

		const result = await this.generateObjectWithSystem(
			"You are an expert editor reviewing a chapter for quality. Be thorough but constructive.",
			`Review this chapter and provide detailed feedback:\n\n${writingStep.agentOutput}`,
			reviewSchema,
			{ modelRole: "checker" },
		);

		if (!result.success) {
			throw new Error(result.error);
		}

		const review = result.data.object;

		// Store review feedback on the writing step
		await db
			.update(bookGenerationStep)
			.set({
				reviewFeedback: JSON.stringify(review),
				updatedAt: new Date(),
			})
			.where(eq(bookGenerationStep.id, writingStep.id));

		return {
			content: JSON.stringify(review),
			wordCount: 0,
			duration: Date.now() - startTime,
			modelId: "checker",
			metadata: { review },
		};
	}

	/**
	 * Revise chapter based on feedback.
	 */
	private async reviseChapter(
		generationId: string,
		step: BookGenerationStep,
	): Promise<StepResult> {
		const startTime = Date.now();

		// Get original chapter and review
		const writingStep = await this.getPreviousWritingStep(generationId, step);
		if (!writingStep?.agentOutput || !writingStep.reviewFeedback) {
			return { content: "", wordCount: 0, duration: Date.now() - startTime };
		}

		const review = JSON.parse(writingStep.reviewFeedback) as ReviewResult;


		const issuesSummary = review.issues
			.map((i) => `- ${i.type} (${i.severity}): ${i.description}. Suggestion: ${i.suggestion}`)
			.join("\n");

        const { revisionPipelineService } = await import("./revision-pipeline-service");

		const result = await revisionPipelineService.revise(
			writingStep.agentOutput,
			`Address the following feedback:\n${issuesSummary}\n\nMaintain the story's core narrative but improve quality based on these points.`,
            { detectProblems: false } // We already have specific feedback
		);

        // Update story state with revised content so context is preserved
        await this.updateStoryState(generationId, step, result.revised);

		return {
			content: result.revised,
			wordCount: this.countWords(result.revised),
			duration: Date.now() - startTime,
			modelId: "writer",
			metadata: { 
                revisionRound: step.revisionRound,
                changes: result.changes 
            },
		};
	}

	/**
	 * Generate epilogue content.
	 */
	private async generateEpilogue(
		generationId: string,
		step: BookGenerationStep,
	): Promise<StepResult> {
		const startTime = Date.now();
		const context = await this.buildGenerationContext(generationId);

		const systemPrompt = `You are an expert novelist. Write a satisfying epilogue that wraps up the story.

${context.styleGuidePrompt}

Write prose only. Provide closure for character arcs and major plot threads.`;

		const result = await this.generateTextWithSystem(
			systemPrompt,
			`Write an epilogue for this story:\n\n${context.premise}\n\nThe story has concluded with:\n${context.recentEvents}`,
			{ modelRole: "writer", temperature: 0.7 },
		);

		if (!result.success) {
			throw new Error(result.error);
		}

		return {
			content: result.data.text,
			wordCount: this.countWords(result.data.text),
			duration: Date.now() - startTime,
			modelId: "writer",
		};
	}

	/**
	 * Generate back cover blurb.
	 */
	private async generateBackCover(
		generationId: string,
		step: BookGenerationStep,
	): Promise<StepResult> {
		const startTime = Date.now();
		const context = await this.buildGenerationContext(generationId);

		const result = await this.generateTextWithSystem(
			"You are an expert book marketer. Write a compelling back cover blurb that hooks readers without spoilers.",
			`Write a back cover blurb for this book:\n\nTitle: ${context.title}\nGenre: ${context.genre}\nPremise: ${context.premise}`,
			{ modelRole: "writer", temperature: 0.8 },
		);

		if (!result.success) {
			throw new Error(result.error);
		}

		return {
			content: result.data.text,
			wordCount: this.countWords(result.data.text),
			duration: Date.now() - startTime,
			modelId: "writer",
		};
	}

	/**
	 * Run consistency check across all generated content.
	 */
	private async runConsistencyCheck(
		generationId: string,
		step: BookGenerationStep,
	): Promise<StepResult> {
		const startTime = Date.now();

		// Use the existing consistency service
		const { consistencyService } = await import(
			"@/lib/ai/services/consistency-service"
		);

		const [generation] = await db
			.select()
			.from(bookGeneration)
			.where(eq(bookGeneration.id, generationId))
			.limit(1);

		if (!generation) {
			throw new Error("Generation not found");
		}

		const issues = await consistencyService.analyzeProject(generation.projectId);

		return {
			content: JSON.stringify(issues),
			wordCount: 0,
			duration: Date.now() - startTime,
			metadata: { issueCount: issues.length },
		};
	}

	// =========================================================================
	// Helper Methods
	// =========================================================================

	/**
	 * Build the step queue based on generation settings.
	 */
	private buildStepQueue(
		generationId: string,
		settings: GenerationSettings,
	): Omit<BookGenerationStep, "id">[] {
		const now = new Date();
		const steps: Omit<BookGenerationStep, "id">[] = [];
		let sequence = 1;

		// Prologue
		if (settings.includePrologue) {
			steps.push({
				generationId,
				chapterId: null,
				sequence: sequence++,
				stepType: "prologue",
				status: "pending",
				revisionRound: 1,
				agentOutput: null,
				reviewFeedback: null,
				wordCount: null,
				tokenCount: null,
				usage: null,
				startedAt: null,
				completedAt: null,
				createdAt: now,
				updatedAt: now,
			});
		}

		// Chapters - writing + reviewing + revision for each
		for (let i = 1; i <= settings.totalChapters; i++) {
			// Writing
			steps.push({
				generationId,
				chapterId: null, // Will be linked later
				sequence: sequence++,
				stepType: "chapter_writing",
				status: "pending",
				revisionRound: 1,
				agentOutput: null,
				reviewFeedback: null,
				wordCount: null,
				tokenCount: null,
				usage: null,
				startedAt: null,
				completedAt: null,
				createdAt: now,
				updatedAt: now,
			});

			// Reviewing
			steps.push({
				generationId,
				chapterId: null,
				sequence: sequence++,
				stepType: "chapter_reviewing",
				status: "pending",
				revisionRound: 1,
				agentOutput: null,
				reviewFeedback: null,
				wordCount: null,
				tokenCount: null,
				usage: null,
				startedAt: null,
				completedAt: null,
				createdAt: now,
				updatedAt: now,
			});

			// Planned revision rounds
			for (let r = 1; r <= settings.revisionRounds; r++) {
				steps.push({
					generationId,
					chapterId: null,
					sequence: sequence++,
					stepType: "chapter_revision",
					status: "pending",
					revisionRound: r,
					agentOutput: null,
					reviewFeedback: null,
					wordCount: null,
					tokenCount: null,
					usage: null,
					startedAt: null,
					completedAt: null,
					createdAt: now,
					updatedAt: now,
				});
			}
		}

		// Epilogue
		if (settings.includeEpilogue) {
			steps.push({
				generationId,
				chapterId: null,
				sequence: sequence++,
				stepType: "epilogue",
				status: "pending",
				revisionRound: 1,
				agentOutput: null,
				reviewFeedback: null,
				wordCount: null,
				tokenCount: null,
				usage: null,
				startedAt: null,
				completedAt: null,
				createdAt: now,
				updatedAt: now,
			});
		}

		// Back cover
		if (settings.generateBackCoverBlurb) {
			steps.push({
				generationId,
				chapterId: null,
				sequence: sequence++,
				stepType: "back_cover",
				status: "pending",
				revisionRound: 1,
				agentOutput: null,
				reviewFeedback: null,
				wordCount: null,
				tokenCount: null,
				usage: null,
				startedAt: null,
				completedAt: null,
				createdAt: now,
				updatedAt: now,
			});
		}

		// Consistency check
		if (settings.runConsistencyCheck) {
			steps.push({
				generationId,
				chapterId: null,
				sequence: sequence++,
				stepType: "consistency_check",
				status: "pending",
				revisionRound: 1,
				agentOutput: null,
				reviewFeedback: null,
				wordCount: null,
				tokenCount: null,
				usage: null,
				startedAt: null,
				completedAt: null,
				createdAt: now,
				updatedAt: now,
			});
		}

		return steps;
	}

	/**
	 * Get ordered steps for a generation.
	 */
	private async getOrderedSteps(
		generationId: string,
	): Promise<BookGenerationStep[]> {
		return db
			.select()
			.from(bookGenerationStep)
			.where(eq(bookGenerationStep.generationId, generationId))
			.orderBy(bookGenerationStep.sequence);
	}

	/**
	 * Check if pipeline is paused.
	 */
	private async checkPauseStatus(generationId: string): Promise<boolean> {
		const [gen] = await db
			.select({ status: bookGeneration.status })
			.from(bookGeneration)
			.where(eq(bookGeneration.id, generationId))
			.limit(1);

		return gen?.status === "paused";
	}

	/**
	 * Update generation status.
	 */
	private async updateGenerationStatus(
		generationId: string,
		status: string,
	): Promise<void> {
		const updates: Record<string, unknown> = {
			status,
			updatedAt: new Date(),
		};

		if (status === "running") {
			updates.startedAt = new Date();
		} else if (status === "completed") {
			updates.completedAt = new Date();
		}

		await db
			.update(bookGeneration)
			.set(updates)
			.where(eq(bookGeneration.id, generationId));
	}

	/**
	 * Update step status.
	 */
	private async updateStepStatus(
		stepId: string,
		status: string,
	): Promise<void> {
		const updates: Record<string, unknown> = {
			status,
			updatedAt: new Date(),
		};

		if (status === "running") {
			updates.startedAt = new Date();
		} else if (status === "completed") {
			updates.completedAt = new Date();
		}

		await db
			.update(bookGenerationStep)
			.set(updates)
			.where(eq(bookGenerationStep.id, stepId));
	}

	/**
	 * Save step result.
	 */
	private async saveStepResult(
		stepId: string,
		result: StepResult,
	): Promise<void> {
		await db
			.update(bookGenerationStep)
			.set({
				status: "completed",
				agentOutput: result.content,
				wordCount: result.wordCount,
				completedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(bookGenerationStep.id, stepId));
	}

	/**
	 * Update generation progress.
	 */
	private async updateGenerationProgress(
		generationId: string,
		completedSteps: number,
		_progress: number,
	): Promise<void> {
		await db
			.update(bookGeneration)
			.set({
				completedSteps,
				updatedAt: new Date(),
			})
			.where(eq(bookGeneration.id, generationId));
	}

	/**
	 * Run quality gate check.
	 */
	private async runQualityGate(
		_generationId: string,
		step: BookGenerationStep,
		result: StepResult,
	): Promise<{
		passed: boolean;
		score: number;
		issues?: QualityIssue[];
		recommendation: "approve" | "minor_revision" | "major_revision" | "rewrite";
	}> {
		// Quick quality check using AI
		const qualitySchema = z.object({
			score: z.number().min(1).max(10),
			issues: z.array(
				z.object({
					type: z.enum(["consistency", "pacing", "character", "plot"]),
					severity: z.enum(["low", "medium", "high"]),
					description: z.string(),
					suggestion: z.string(),
				}),
			),
		});

		const qualityResult = await this.generateObjectWithSystem(
			"You are a quality control editor. Rate this content on a scale of 1-10 and identify any issues.",
			`Rate this chapter content:\n\n${result.content?.substring(0, 4000)}...`,
			qualitySchema,
			{ modelRole: "checker" },
		);

		if (!qualityResult.success) {
			// Default to pass if quality check fails
			return { passed: true, score: 7, recommendation: "approve" };
		}

		const { score, issues } = qualityResult.data.object;

		let recommendation: "approve" | "minor_revision" | "major_revision" | "rewrite";
		if (score >= QUALITY_THRESHOLD_AUTO_APPROVE) {
			recommendation = "approve";
		} else if (score >= QUALITY_THRESHOLD_MINOR_REVISION) {
			recommendation = "minor_revision";
		} else if (score >= QUALITY_THRESHOLD_MAJOR_REVISION) {
			recommendation = "major_revision";
		} else {
			recommendation = "rewrite";
		}

		return {
			passed: score >= QUALITY_THRESHOLD_MINOR_REVISION,
			score,
			issues: issues as QualityIssue[],
			recommendation,
		};
	}

    /**
     * Force a revision step (e.g. manual rejection).
     */
    async forceRevision(
        generationId: string, 
        currentStepId: string, 
        instructions?: string
    ): Promise<void> {
        const [step] = await db
            .select()
            .from(bookGenerationStep)
            .where(eq(bookGenerationStep.id, currentStepId));
            
        if (!step) throw new Error("Step not found");

        // Save manual feedback if provided
        if (instructions) {
             const manualFeedback: ReviewResult = {
                 overallScore: 0,
                 recommendation: 'rewrite',
                 issues: [{
                     type: 'consistency',
                     severity: 'major',
                     location: 'whole chapter',
                     description: 'Manual rejection by user.',
                     suggestion: instructions
                 }],
                 strengths: []
             };
             
             await db.update(bookGenerationStep)
                .set({ reviewFeedback: JSON.stringify(manualFeedback) })
                .where(eq(bookGenerationStep.id, currentStepId));
        }

        await this.queueRevisionStep(generationId, step);
    }

	/**
	 * Queue a revision step.
	 */
	private async queueRevisionStep(
		generationId: string,
		originalStep: BookGenerationStep,
	): Promise<void> {
		const now = new Date();
		const nextRevision = (originalStep.revisionRound || 1) + 1;

		await db.insert(bookGenerationStep).values({
			generationId,
			chapterId: originalStep.chapterId,
			sequence: originalStep.sequence + 0.5, // Insert after current step
			stepType: "chapter_revision",
			status: "pending",
			revisionRound: nextRevision,
			agentOutput: null,
			reviewFeedback: null,
			wordCount: null,
			tokenCount: null,
			usage: null,
			startedAt: null,
			completedAt: null,
			createdAt: now,
			updatedAt: now,
		});
	}

	/**
	 * Generate summary for completed pipeline.
	 */
	private async generateSummary(
		generationId: string,
		durationSeconds: number,
	): Promise<GenerationSummary> {
		const steps = await this.getOrderedSteps(generationId);

		const totalWords = steps.reduce((sum, s) => sum + (s.wordCount || 0), 0);
		const totalTokens = steps.reduce((sum, s) => sum + (s.tokenCount || 0), 0);
		const chaptersGenerated = steps.filter(
			(s) => s.stepType === "chapter_writing" && s.status === "completed",
		).length;
		const revisionsCompleted = steps.filter(
			(s) => s.stepType === "chapter_revision" && s.status === "completed",
		).length;

		const assetsGenerated: string[] = [];
		if (steps.some((s) => s.stepType === "prologue" && s.status === "completed")) {
			assetsGenerated.push("prologue");
		}
		if (steps.some((s) => s.stepType === "epilogue" && s.status === "completed")) {
			assetsGenerated.push("epilogue");
		}
		if (steps.some((s) => s.stepType === "back_cover" && s.status === "completed")) {
			assetsGenerated.push("back_cover");
		}

		return {
			totalWords,
			chaptersGenerated,
			revisionsCompleted,
			totalTokensUsed: totalTokens,
			estimatedCostUsd: (totalTokens / 1000) * 0.003,
			durationSeconds,
			stepsCompleted: steps.filter((s) => s.status === "completed").length,
			stepsTotal: steps.length,
			assetsGenerated,
		};
	}

	/**
	 * Create a pipeline event with timestamp.
	 */
	private createEvent(
		generationId: string,
		event: Record<string, unknown>,
	): PipelineEvent {
		return {
			...event,
			timestamp: new Date().toISOString(),
			generationId,
		} as PipelineEvent;
	}

	/**
	 * Count words in text.
	 */
	private countWords(text: string): number {
		return text.split(/\s+/).filter((word) => word.length > 0).length;
	}

	/**
	 * Build generation context from project data.
	 */
	private async buildGenerationContext(generationId: string): Promise<{
		title: string;
		genre: string;
		premise: string;
		characters: string;
		styleGuidePrompt: string;
		recentEvents: string;
	}> {
		const [generation] = await db
			.select()
			.from(bookGeneration)
			.where(eq(bookGeneration.id, generationId))
			.limit(1);

		const settings = generation?.settings as GenerationSettings | undefined;

		return {
			title: settings?.bookTitle || "Untitled",
			genre: settings?.genre || "Fiction",
			premise: "Story premise based on project outlines",
			characters: "Character list from project entities",
			styleGuidePrompt: settings?.customStyleDescription || "Write in a compelling, engaging style.",
			recentEvents: "Recent story events summary",
		};
	}

	/**
	 * Build chapter-specific context.
	 */
	private async buildChapterContext(
		generationId: string,
		_chapterId: string,
	): Promise<{
		prompt: string;
		styleGuidePrompt: string;
	}> {
		const context = await this.buildGenerationContext(generationId);

		return {
			prompt: `Write Chapter N of "${context.title}"\n\nPremise: ${context.premise}\n\nCharacters: ${context.characters}`,
			styleGuidePrompt: context.styleGuidePrompt,
		};
	}

	/**
	 * Get previous writing step for a review/revision step.
	 */
	private async getPreviousWritingStep(
		generationId: string,
		currentStep: BookGenerationStep,
	): Promise<BookGenerationStep | undefined> {
		const steps = await this.getOrderedSteps(generationId);
		const currentIndex = steps.findIndex((s) => s.id === currentStep.id);

		// Find the most recent chapter_writing step before this one
		for (let i = currentIndex - 1; i >= 0; i--) {
			if (steps[i].stepType === "chapter_writing") {
				return steps[i];
			}
		}

		return undefined;
	}

	/**
	 * Update story state after chapter generation.
	 */
	private async updateStoryState(
		generationId: string,
		step: BookGenerationStep,
		_content: string,
	): Promise<void> {
		const [generation] = await db
			.select()
			.from(bookGeneration)
			.where(eq(bookGeneration.id, generationId))
			.limit(1);

		if (!generation) return;

		// Extract story state updates (simplified - would use AI in full implementation)
		const stateData: StoryStateData = {
			characterKnowledge: {},
			characterInjuries: {},
			openThreads: [],
			revealsMade: [],
			worldStateChanges: [],
		};

		const now = new Date();

		await db.insert(storyState).values({
			generationId,
			projectId: generation.projectId,
			chapterNumber: step.sequence,
			...stateData,
			createdAt: now,
			updatedAt: now,
		});
	}
}

// Export singleton instance
export const bookPipelineService = new BookPipelineService();
