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
	chapter,
	scene,
} from "@/lib/db/schema";
import { runGeneration } from "@/lib/generation";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

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

/**
 * Get the full project structure (chapters and scenes) for the writer mode
 */
export async function getProjectStructure(projectId: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		// Verify access
		const project = await getProjectByIdWithAccess({
			id: projectId,
			userId: session.user.id,
		});

		if (!project) {
			return { error: "Project not found" };
		}

		// Get all chapters sorted by sequence
		// We join with the first outline/volume for now, assuming a linear structure
		const chapters = await db.query.chapter.findMany({
			where: (chapter, { eq }) => eq(chapter.projectId, projectId),
			orderBy: (chapter, { asc }) => [asc(chapter.sequence)],
			with: {
				// Get scenes for each chapter
				// Note: We need to define this relation in the schema relations if not present
				// If relations aren't defined in Drizzle, we might need a separate query
			},
		});

		// Since relations might not be fully set up in Drizzle schema for direct `with` querying across files,
		// let's fetch scenes separately and map them.
		const scenes = await db.query.scene.findMany({
			where: (scene, { eq }) => eq(scene.projectId, projectId),
			orderBy: (scene, { asc }) => [asc(scene.sequence)],
		});

		// Group scenes by chapter
		const structure = chapters.map((ch) => ({
			...ch,
			scenes: scenes.filter((s) => s.chapterId === ch.id),
		}));

		// Generate text representation for the editor
		const structureText = structure
			.map(
				(ch) =>
					`Chapter ${ch.sequence}: ${ch.title}\n${ch.scenes
						.map((s) => `- Scene: ${s.title}`)
						.join("\n")}`,
			)
			.join("\n\n");

		return { structure, structureText };
	} catch (error) {
		console.error("Failed to fetch project structure:", error);
		return { error: "Failed to fetch project structure" };
	}
}

/**
 * Update the project structure based on text input
 */
export async function saveProjectStructure(
	projectId: string,
	structureText: string,
) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		const project = await getProjectByIdWithAccess({
			id: projectId,
			userId: session.user.id,
		});

		if (!project) {
			return { error: "Project not found" };
		}

		if (project.userId !== session.user.id) {
			return { error: "Unauthorized" };
		}

		// Ensure we have a volume and outline
		// For simplicity, we get the first one or create if missing
		let [outline] = await db.query.outline.findMany({
			where: (outline, { eq }) => eq(outline.projectId, projectId),
			limit: 1,
		});

		// If no outline exists, we need to create one, but we need minimal data
		if (!outline) {
			// This is a fallback, ideally outline exists from creation
			const [newOutline] = await db
				.insert(schema.outline)
				.values({
					projectId,
					title: "Main Outline",
					pov: "Third Person", // Defaults
					tone: "Neutral",
					pacing: "Moderate",
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();
			outline = newOutline;
		}

		let [volume] = await db.query.volume.findMany({
			where: (volume, { eq }) => eq(volume.projectId, projectId),
			limit: 1,
		});

		if (!volume) {
			const [newVolume] = await db
				.insert(schema.volume)
				.values({
					projectId,
					outlineId: outline.id,
					title: "Volume 1",
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();
			volume = newVolume;
		}

		// Parse the text
		// Expected format:
		// Chapter X: Title
		// - Scene: Title
		// or just Title
		const lines = structureText.split("\n");
		const newStructure: {
			title: string;
			sequence: number;
			scenes: { title: string; sequence: number }[];
		}[] = [];

		let currentChapter: (typeof newStructure)[0] | null = null;
		let chapterSeq = 1;
		let sceneSeq = 1;

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			if (
				trimmed.toLowerCase().startsWith("chapter") ||
				(!trimmed.startsWith("-") && !trimmed.startsWith("*"))
			) {
				// New Chapter
				const title = trimmed.replace(/^chapter\s*\d*[:.]?\s*/i, "").trim();
				currentChapter = {
					title: title || `Chapter ${chapterSeq}`,
					sequence: chapterSeq++,
					scenes: [],
				};
				newStructure.push(currentChapter);
				sceneSeq = 1;
			} else if (currentChapter && (trimmed.startsWith("-") || trimmed.startsWith("*"))) {
				// Scene for current chapter
				const title = trimmed.replace(/^[-*]\s*(scene:?)?\s*/i, "").trim();
				currentChapter.scenes.push({
					title: title || `Scene ${sceneSeq}`,
					sequence: sceneSeq++,
				});
			}
		}

		// Now sync with DB
		// Strategy: Delete existing structure and recreate?
		// Risky for content preservation.
		// Better: Upsert. But matching is hard if titles change.
		// For now, to support "Bulk Edit", we will map by SEQUENCE.
		// This implies reordering in text reorders in DB.

		// 1. Get existing chapters
		const existingChapters = await db.query.chapter.findMany({
			where: (c, { eq }) => eq(c.projectId, projectId),
			with: {
				// Assuming standard Drizzle relation name, otherwise fetch separately
			},
		});

		// 2. Loop through new structure and update/create
		// Logic: Match by TITLE first to preserve ID (and content).
		const processedChapterIds = new Set<string>();

		for (const newCh of newStructure) {
			let chapterId: string;

			// Find existing chapter by title
			const existingCh = existingChapters.find(
				(c) => c.title.toLowerCase() === newCh.title.toLowerCase()
			);

			if (existingCh) {
				// Update sequence if needed
				await db
					.update(chapter)
					.set({
						sequence: newCh.sequence,
						updatedAt: new Date(),
					})
					.where(eq(chapter.id, existingCh.id));
				chapterId = existingCh.id;
				processedChapterIds.add(existingCh.id);
			} else {
				// Create new chapter
				const [created] = await db
					.insert(chapter)
					.values({
						projectId,
						outlineId: outline.id,
						volumeId: volume.id,
						title: newCh.title,
						sequence: newCh.sequence,
						status: "planned",
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();
				chapterId = created.id;
			}

			// Handle Scenes for this chapter
			const existingScenes = await db.query.scene.findMany({
				where: (s, { eq }) => eq(s.chapterId, chapterId),
			});

			const processedSceneIds = new Set<string>();

			for (const newSc of newCh.scenes) {
				const existingSc = existingScenes.find(
					(s) => s.title.toLowerCase() === newSc.title.toLowerCase()
				);

				if (existingSc) {
					// Update sequence
					await db
						.update(scene)
						.set({
							sequence: newSc.sequence,
							updatedAt: new Date(),
						})
						.where(eq(scene.id, existingSc.id));
					processedSceneIds.add(existingSc.id);
				} else {
					// Create new scene
					await db
						.insert(scene)
						.values({
							projectId,
							chapterId,
							title: newSc.title,
							sequence: newSc.sequence,
							status: "planned",
							createdAt: new Date(),
							updatedAt: new Date(),
						});
				}
			}

			// Delete scenes that are NOT in the new structure for this chapter
			// (Since this is a "Bulk Editor" that reflects the desired state)
			for (const s of existingScenes) {
				if (!processedSceneIds.has(s.id)) {
					// Ideally we might want to archive, but "Editor" implies deletion of removed text.
					await db.delete(scene).where(eq(scene.id, s.id));
				}
			}
		}

		// Delete chapters not in new structure
		for (const c of existingChapters) {
			if (!processedChapterIds.has(c.id)) {
				// Cascade delete scenes first
				await db.delete(scene).where(eq(scene.chapterId, c.id));
				await db.delete(chapter).where(eq(chapter.id, c.id));
			}
		}

		revalidatePath(`/projects/${projectId}/generate`);
		return { success: true };
	} catch (error) {
		console.error("Failed to save structure:", error);
		return { error: "Failed to save structure" };
	}
}

/**
 * Generate content for a scene using AI
 */
export async function generateSceneContent(
	sceneId: string,
	prompt: string,
) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		// 1. Get Scene & Project
		const [targetScene] = await db
			.select()
			.from(scene)
			.where(eq(scene.id, sceneId));

		if (!targetScene) return { error: "Scene not found" };

		const project = await getProjectByIdWithAccess({
			id: targetScene.projectId,
			userId: session.user.id,
		});

		if (!project) return { error: "Project not found" };

		// 2. Call AI
		// Retrieve context (basic implementation for now)
		const chapterTitle = "Unknown Chapter"; // Ideally fetch from DB relation

		const { text } = await generateText({
			model: openai("gpt-4o"), // Or use a project setting model
			system: `You are an expert fiction writer. Write a scene based on the user's prompt.
					 Context: Project '${project.name}'.
					 Adhere to the project's tone and style.`,
			prompt: `Scene ID: ${sceneId}\nPrompt: ${prompt}\n\nWrite the scene content:`,
		});

		return { success: true, content: text };

	} catch (error) {
		return { error: "Failed to generate content" };
	}
}

import * as schema from "@/lib/db/schema";

/**
 * Update the content of a scene
 */
/**
 * Create a snapshot (ChapterVersion) from the current scene contents of a chapter
 */
export async function createChapterSnapshot(chapterId: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		// Verify ownership
		const [targetChapter] = await db
			.select()
			.from(chapter)
			.where(eq(chapter.id, chapterId));

		if (!targetChapter) return { error: "Chapter not found" };

		const project = await getProjectByIdWithAccess({
			id: targetChapter.projectId,
			userId: session.user.id,
		});

		if (!project || project.userId !== session.user.id) {
			return { error: "Unauthorized" };
		}

		// Gather all scenes
		const scenes = await db
			.select()
			.from(scene)
			.where(eq(scene.chapterId, chapterId))
			.orderBy(scene.sequence);

		// Combine content
		const fullContent = scenes
			.map((s) => s.content || "")
			.join("\n\n***\n\n"); // Standard scene separator

		// Get next version number
		const [latestVersion] = await db
			.select()
			.from(chapterVersion)
			.where(eq(chapterVersion.chapterId, chapterId))
			.orderBy(desc(chapterVersion.version))
			.limit(1);

		const nextVersion = (latestVersion?.version || 0) + 1;

		await db.insert(chapterVersion).values({
			chapterId,
			content: fullContent,
			version: nextVersion,
			wordCount: fullContent.split(/\s+/).length,
			createdBy: "user",
			createdAt: new Date(),
		});

		return { success: true, version: nextVersion };
	} catch (error) {
		console.error("Failed to create snapshot:", error);
		return { error: "Failed to create snapshot" };
	}
}

export async function updateSceneContent(sceneId: string, content: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		// Verify ownership via project
		const [targetScene] = await db
			.select()
			.from(scene)
			.where(eq(scene.id, sceneId));

		if (!targetScene) {
			return { error: "Scene not found" };
		}

		const project = await getProjectByIdWithAccess({
			id: targetScene.projectId,
			userId: session.user.id,
		});

		if (!project || project.userId !== session.user.id) {
			return { error: "Unauthorized" };
		}

		// Update scene content
		await db
			.update(scene)
			.set({
				content,
				updatedAt: new Date(),
				status: "drafting", // Mark as drafting when manually edited
			})
			.where(eq(scene.id, sceneId));

		return { success: true };
	} catch (error) {
		console.error("Failed to update scene content:", error);
		return { error: "Failed to update scene content" };
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
