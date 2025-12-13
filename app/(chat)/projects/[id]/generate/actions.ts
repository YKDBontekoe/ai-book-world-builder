"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/(auth)/auth";
import { db, getProjectByIdWithAccess } from "@/lib/db/queries";
import {
	bookGeneration,
	bookGenerationAsset,
	bookGenerationStep,
	chapterVersion,
	type GenerationSettings,
	generationNote,
	generationTemplate,
} from "@/lib/db/schema";
import { runGeneration } from "@/lib/generation";

/**
 * Start a new book generation with the given settings
 */
export async function startGeneration(
	projectId: string,
	settings: Partial<GenerationSettings>,
	suggestions?: string,
) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	const project = await getProjectByIdWithAccess({
		id: projectId,
		userId: session.user.id,
	});

	if (!project) {
		return { error: "Project not found" };
	}

	if (project.userId !== session.user.id) {
		return {
			error:
				"Unauthorized: You can only generate content for your own projects. Please fork this project to make changes.",
		};
	}

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
		// Delete any existing generation for this project (due to unique constraint)
		const [existingGeneration] = await db
			.select({ id: bookGeneration.id })
			.from(bookGeneration)
			.where(eq(bookGeneration.projectId, projectId));

		if (existingGeneration) {
			// Delete related data first (cascade not automatic for all tables)
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

		// Add user suggestions as a global note if provided
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

		// Trigger the actual generation in the background (non-blocking)
		// This allows the response to return immediately while generation continues
		runGeneration({
			generationId: generation.id,
			projectId,
			userId: session.user.id,
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
}

/**
 * Pause an active generation
 */
export async function pauseGeneration(generationId: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		const [gen] = await db
			.select()
			.from(bookGeneration)
			.where(eq(bookGeneration.id, generationId));

		if (!gen) return { error: "Generation not found" };

		const project = await getProjectByIdWithAccess({
			id: gen.projectId,
			userId: session.user.id,
		});

		if (!project || project.userId !== session.user.id) {
			return { error: "Unauthorized" };
		}

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
}

/**
 * Resume a paused generation
 */
export async function resumeGeneration(generationId: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		const [gen] = await db
			.select()
			.from(bookGeneration)
			.where(eq(bookGeneration.id, generationId));

		if (!gen) return { error: "Generation not found" };

		const project = await getProjectByIdWithAccess({
			id: gen.projectId,
			userId: session.user.id,
		});

		if (!project || project.userId !== session.user.id) {
			return { error: "Unauthorized" };
		}

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
}

/**
 * Cancel an active generation
 */
export async function cancelGeneration(generationId: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		const [gen] = await db
			.select()
			.from(bookGeneration)
			.where(eq(bookGeneration.id, generationId));

		if (!gen) return { error: "Generation not found" };

		const project = await getProjectByIdWithAccess({
			id: gen.projectId,
			userId: session.user.id,
		});

		if (!project || project.userId !== session.user.id) {
			return { error: "Unauthorized" };
		}

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
}

/**
 * Add a note to the generation (global or chapter-specific)
 */
export async function addGenerationNote(
	generationId: string,
	content: string,
	chapterId?: string,
) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		const [gen] = await db
			.select()
			.from(bookGeneration)
			.where(eq(bookGeneration.id, generationId));

		if (!gen) return { error: "Generation not found" };

		const project = await getProjectByIdWithAccess({
			id: gen.projectId,
			userId: session.user.id,
		});

		if (!project || project.userId !== session.user.id) {
			return { error: "Unauthorized" };
		}

		const [note] = await db
			.insert(generationNote)
			.values({
				generationId,
				chapterId: chapterId || null,
				content,
				isGlobal: !chapterId,
				createdAt: new Date(),
			})
			.returning();

		return { success: true, noteId: note.id };
	} catch (error) {
		return { error: "Failed to add note" };
	}
}

/**
 * Get generation status and progress
 */
export async function getGenerationStatus(generationId: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		const [generation] = await db
			.select()
			.from(bookGeneration)
			.where(eq(bookGeneration.id, generationId));

		if (!generation) {
			return { error: "Generation not found" };
		}

		const steps = await db
			.select()
			.from(bookGenerationStep)
			.where(eq(bookGenerationStep.generationId, generationId))
			.orderBy(bookGenerationStep.sequence);

		const assets = await db
			.select()
			.from(bookGenerationAsset)
			.where(eq(bookGenerationAsset.generationId, generationId));

		const notes = await db
			.select()
			.from(generationNote)
			.where(eq(generationNote.generationId, generationId))
			.orderBy(desc(generationNote.createdAt));

		return {
			generation,
			steps,
			assets,
			notes,
		};
	} catch (error) {
		return { error: "Failed to fetch generation status" };
	}
}

/**
 * Save current settings as a template
 */
export async function saveTemplate(
	name: string,
	description: string,
	settings: Partial<GenerationSettings>,
) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		const [template] = await db
			.insert(generationTemplate)
			.values({
				name,
				description,
				settings: settings as any,
				userId: session.user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return { success: true, templateId: template.id };
	} catch (error) {
		return { error: "Failed to save template" };
	}
}

/**
 * Get all templates (built-in + user's custom)
 */
export async function getTemplates() {
	const session = await auth();

	try {
		const templates = await db
			.select()
			.from(generationTemplate)
			.where(
				session?.user?.id ? undefined : eq(generationTemplate.isBuiltIn, true),
			);

		return { templates };
	} catch (error) {
		return { error: "Failed to fetch templates", templates: [] };
	}
}

/**
 * Get chapter version history
 */
export async function getChapterVersions(chapterId: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		const versions = await db
			.select()
			.from(chapterVersion)
			.where(eq(chapterVersion.chapterId, chapterId))
			.orderBy(desc(chapterVersion.version));

		return { versions };
	} catch (error) {
		return { error: "Failed to fetch versions", versions: [] };
	}
}

/**
 * Restore a specific chapter version
 */
export async function restoreChapterVersion(versionId: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		const [version] = await db
			.select()
			.from(chapterVersion)
			.where(eq(chapterVersion.id, versionId));

		if (!version) {
			return { error: "Version not found" };
		}

		// Create a new version with the restored content
		const [latestVersion] = await db
			.select()
			.from(chapterVersion)
			.where(eq(chapterVersion.chapterId, version.chapterId))
			.orderBy(desc(chapterVersion.version))
			.limit(1);

		const newVersion = (latestVersion?.version || 0) + 1;

		await db.insert(chapterVersion).values({
			chapterId: version.chapterId,
			content: version.content,
			wordCount: version.wordCount,
			version: newVersion,
			createdBy: "user",
			createdAt: new Date(),
		});

		return { success: true };
	} catch (error) {
		return { error: "Failed to restore version" };
	}
}

// Helper functions

function calculateTotalSteps(settings: GenerationSettings): number {
	let steps = 0;

	// Prologue
	if (settings.includePrologue) steps++;

	// Chapters (write + review per revision round)
	steps += settings.totalChapters * settings.revisionRounds * 2;

	// Epilogue
	if (settings.includeEpilogue) steps++;

	// Additional assets
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
	const steps: Array<{
		generationId: string;
		sequence: number;
		stepType: string;
		status: string;
		createdAt: Date;
		updatedAt: Date;
	}> = [];
	let sequence = 1;
	const now = new Date();

	// Prologue
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

	// Chapters with revision rounds
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

	// Epilogue
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

	// Additional steps
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
