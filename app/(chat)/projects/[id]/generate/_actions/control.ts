"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/queries";
import {
	bookGeneration,
	bookGenerationAsset,
	bookGenerationStep,
	generationNote,
	type GenerationSettings,
} from "@/lib/db/schema";
import { runGeneration } from "@/lib/generation";
import { withGenerationAuth, withProjectAuth } from "./utils";

export async function startGeneration(
	projectId: string,
	settings: Partial<GenerationSettings>,
	suggestions?: string,
) {
	return withProjectAuth(projectId, async (userId) => {
		// Default settings
		const fullSettings: GenerationSettings = {
			totalChapters: 10,
			pagesPerChapter: 10,
			revisionRounds: 1,
			writingStylePreset: "custom",
			writerModelId: "anthropic-claude-sonnet-4-5",
			reviewerModelId: "openai-gpt-4o-mini",
			includePrologue: false,
			includeEpilogue: false,
			generateBackCoverBlurb: true,
			generateFrontCover: false,
			generateCharacterSheets: false,
			generateChapterSummaries: true,
			generateTableOfContents: true,
			runConsistencyCheck: false,
			contextSelection: {
				entities: [],
				outlines: [],
				scenes: [],
				drafts: [],
				sourceMaterials: [],
			},
			...settings,
		};

		try {
			// Delete any existing generation for this project
			const [existingGeneration] = await db
				.select({ id: bookGeneration.id })
				.from(bookGeneration)
				.where(eq(bookGeneration.projectId, projectId));

			if (existingGeneration) {
				await db
					.delete(bookGenerationStep)
					.where(eq(bookGenerationStep.generationId, existingGeneration.id));
				await db
					.delete(bookGenerationAsset)
					.where(eq(bookGenerationAsset.generationId, existingGeneration.id));
				await db
					.delete(generationNote)
					.where(eq(generationNote.generationId, existingGeneration.id));
				await db
					.delete(bookGeneration)
					.where(eq(bookGeneration.id, existingGeneration.id));
			}

			// Create generation record
			const [generation] = await db
				.insert(bookGeneration)
				.values({
					projectId,
					status: "running",
					settings: fullSettings as any,
					totalSteps: calculateTotalSteps(fullSettings),
					completedSteps: 0,
					startedAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			// Add user suggestions
			if (suggestions && suggestions.trim()) {
				await db.insert(generationNote).values({
					generationId: generation.id,
					content: suggestions,
					isGlobal: true,
					createdAt: new Date(),
				});
			}

			// Create initial steps
			const steps = buildGenerationSteps(generation.id, fullSettings);
			if (steps.length > 0) {
				await db.insert(bookGenerationStep).values(steps);
			}

			// Trigger generation
			runGeneration({
				generationId: generation.id,
				projectId,
				userId,
				settings: fullSettings,
				callbacks: {
					onLog: (message, type) => {
						console.log(`[${type.toUpperCase()}] ${message}`);
					},
					onError: (error) => {
						console.error("Generation error:", error);
					},
				},
			}).catch((error) => {
				console.error("Generation failed:", error);
			});

			revalidatePath(`/projects/${projectId}/generate`);

			return {
				success: true,
				generationId: generation.id,
			};
		} catch (error) {
			console.error("Failed to start generation:", error);
			return {
				error: `Failed to start generation: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	});
}

export async function pauseGeneration(generationId: string) {
	return withGenerationAuth(generationId, async () => {
		try {
			await db
				.update(bookGeneration)
				.set({
					status: "paused",
					pausedAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(bookGeneration.id, generationId));

			return { success: true };
		} catch (error) {
			return { error: "Failed to pause generation" };
		}
	});
}

export async function resumeGeneration(generationId: string) {
	return withGenerationAuth(generationId, async () => {
		try {
			await db
				.update(bookGeneration)
				.set({
					status: "running",
					pausedAt: null,
					updatedAt: new Date(),
				})
				.where(eq(bookGeneration.id, generationId));

			return { success: true };
		} catch (error) {
			return { error: "Failed to resume generation" };
		}
	});
}

export async function cancelGeneration(generationId: string) {
	return withGenerationAuth(generationId, async () => {
		try {
			await db
				.update(bookGeneration)
				.set({
					status: "failed",
					error: "Cancelled by user",
					completedAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(bookGeneration.id, generationId));

			return { success: true };
		} catch (error) {
			return { error: "Failed to cancel generation" };
		}
	});
}

// Helpers

function calculateTotalSteps(settings: GenerationSettings): number {
	let steps = 0;
	if (settings.includePrologue) steps++;
	steps += settings.totalChapters * settings.revisionRounds * 2;
	if (settings.includeEpilogue) steps++;
	if (settings.generateBackCoverBlurb) steps++;
	if (settings.generateFrontCover) steps++;
	if (settings.generateCharacterSheets) steps++;
	if (settings.generateTableOfContents) steps++;
	if (settings.runConsistencyCheck) steps++;
	return steps;
}

function buildGenerationSteps(
	generationId: string,
	settings: GenerationSettings,
) {
	const steps = [];
	let sequence = 1;
	const now = new Date();

	if (settings.includePrologue) {
		steps.push({
			generationId,
			sequence: sequence++,
			stepType: "prologue",
			status: "pending",
			createdAt: now,
			updatedAt: now,
		});
	}

	for (let ch = 1; ch <= settings.totalChapters; ch++) {
		for (let round = 1; round <= settings.revisionRounds; round++) {
			steps.push({
				generationId,
				sequence: sequence++,
				stepType: "chapter_writing",
				status: "pending",
				createdAt: now,
				updatedAt: now,
			});
			steps.push({
				generationId,
				sequence: sequence++,
				stepType: "chapter_reviewing",
				status: "pending",
				createdAt: now,
				updatedAt: now,
			});
		}
	}

	if (settings.includeEpilogue) {
		steps.push({
			generationId,
			sequence: sequence++,
			stepType: "epilogue",
			status: "pending",
			createdAt: now,
			updatedAt: now,
		});
	}

	if (settings.generateBackCoverBlurb) {
		steps.push({
			generationId,
			sequence: sequence++,
			stepType: "back_cover",
			status: "pending",
			createdAt: now,
			updatedAt: now,
		});
	}

	if (settings.generateFrontCover) {
		steps.push({
			generationId,
			sequence: sequence++,
			stepType: "front_cover",
			status: "pending",
			createdAt: now,
			updatedAt: now,
		});
	}

	if (settings.runConsistencyCheck) {
		steps.push({
			generationId,
			sequence: sequence++,
			stepType: "consistency_check",
			status: "pending",
			createdAt: now,
			updatedAt: now,
		});
	}

	return steps;
}
