"use server";

import type { GenerationSettings } from "@/lib/db/schema/generation";
import { analysisService } from "@/lib/services/ai/analysis-service";
import { loreService } from "@/lib/services/ai/lore-service";
import { writingService } from "@/lib/services/ai/writing-service";

// =============================================================================
// Writing Operations (Existing)
// =============================================================================

export async function batchWriteChapterAction(
	chapterId: string,
	instructions?: string,
) {
	try {
		return await writingService.batchWriteChapter(chapterId, instructions);
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function rewriteSceneAction(
	sceneId: string,
	instructions: string,
) {
	try {
        const { db } = await import("@/lib/db/drizzle");
        const { scene } = await import("@/lib/db/schema");
        const { eq } = await import("drizzle-orm");
        const { revisionPipelineService } = await import("@/lib/ai/services/revision-pipeline-service");

        const [current] = await db.select().from(scene).where(eq(scene.id, sceneId));
        if (!current || !current.content) throw new Error("Scene not found or empty");

        const res = await revisionPipelineService.revise(current.content, instructions);
        
        await db.update(scene)
            .set({ content: res.revised, updatedAt: new Date() })
            .where(eq(scene.id, sceneId));

		return { text: res.revised };
	} catch (error) {
		return { error: (error as Error).message };
	}
}

export async function expandSceneAction(sceneId: string, notes: string) {
	try {
		return await writingService.expandScene(sceneId, notes);
	} catch (error) {
		return { error: (error as Error).message };
	}
}

export async function critiqueChapterAction(chapterId: string) {
	try {
		const result = await analysisService.critiqueChapter(chapterId);
		return { success: true, data: result };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function analyzeConsistencyAction(chapterId: string) {
	try {
		const result = await analysisService.analyzeConsistency(chapterId);
		return { success: true, data: result };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function generateLoreAction(
	projectId: string,
	prompt: string,
	category: string,
) {
	try {
		const entity = await loreService.generateLore(projectId, prompt, category);
		return { success: true, entity };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function searchProjectAction(projectId: string, query: string) {
	try {
		const answer = await loreService.searchProject(projectId, query);
		return { success: true, answer };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

// =============================================================================
// Full Book Generation Pipeline
// =============================================================================

/**
 * Initialize and start a full book generation pipeline.
 */
export async function startFullBookGeneration(
	projectId: string,
	settings: GenerationSettings,
) {
	try {
		const { bookPipelineService } = await import(
			"@/lib/ai/services/book-pipeline-service"
		);

		const generationId = await bookPipelineService.initializePipeline({
			projectId,
			settings,
		});

		return { success: true, generationId };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

/**
 * Pause an active generation pipeline.
 */
export async function pauseBookGeneration(generationId: string) {
	try {
		const { bookPipelineService } = await import(
			"@/lib/ai/services/book-pipeline-service"
		);

		await bookPipelineService.pausePipeline(generationId);
		return { success: true };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

/**
 * Cancel a generation pipeline.
 */
export async function cancelBookGeneration(generationId: string) {
	try {
		const { bookPipelineService } = await import(
			"@/lib/ai/services/book-pipeline-service"
		);

		await bookPipelineService.cancelPipeline(generationId);
		return { success: true };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

/**
 * Get current status of a generation pipeline.
 */
export async function getGenerationStatus(generationId: string) {
	try {
		const { bookPipelineService } = await import(
			"@/lib/ai/services/book-pipeline-service"
		);

		const status = await bookPipelineService.getPipelineStatus(generationId);
		return { success: true, status };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

// =============================================================================
// Writing Coach Actions
// =============================================================================

/**
 * Analyze text for writing quality.
 */
export async function analyzeWritingQuality(content: string) {
	try {
		const { writingCoachService } = await import(
			"@/lib/ai/services/writing-coach-service"
		);

		const analysis = await writingCoachService.analyzeText(content);
		return { success: true, analysis };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

/**
 * Detect show vs tell instances.
 */
export async function detectShowVsTell(content: string) {
	try {
		const { writingCoachService } = await import(
			"@/lib/ai/services/writing-coach-service"
		);

		const instances = await writingCoachService.detectShowVsTell(content);
		return { success: true, instances };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

/**
 * Get improvement suggestion for selected text.
 */
export async function suggestWritingImprovement(
	selection: string,
	issueType: string,
	context: string,
) {
	try {
		const { writingCoachService } = await import(
			"@/lib/ai/services/writing-coach-service"
		);

		const suggestion = await writingCoachService.suggestImprovement(
			selection,
			issueType,
			context,
		);
		return { success: true, suggestion };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

/**
 * Analyze dialogue quality.
 */
export async function analyzeDialogueQuality(content: string) {
	try {
		const { writingCoachService } = await import(
			"@/lib/ai/services/writing-coach-service"
		);

		const analysis = await writingCoachService.analyzeDialogue(content);
		return { success: true, analysis };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

// =============================================================================
// Voice Profile Actions
// =============================================================================

/**
 * Generate a voice profile for a character.
 */
export async function generateVoiceProfile(
	entityId: string,
	characterName: string,
	dialogueSamples: string[],
	description?: string,
) {
	try {
		const { voiceProfileService } = await import(
			"@/lib/ai/services/voice-profile-service"
		);

		const profile = await voiceProfileService.generateVoiceProfile(
			entityId,
			characterName,
			dialogueSamples,
			description,
		);
		return { success: true, profile };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

/**
 * Check if dialogue matches a character's voice.
 */
export async function checkVoiceConsistency(
	profile: Parameters<
		typeof import("@/lib/ai/services/voice-profile-service").VoiceProfileService.prototype.checkVoiceConsistency
	>[0],
	dialogue: string[],
) {
	try {
		const { voiceProfileService } = await import(
			"@/lib/ai/services/voice-profile-service"
		);

		const result = await voiceProfileService.checkVoiceConsistency(
			profile,
			dialogue,
		);
		return { success: true, result };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

/**
 * Transform dialogue to match a character's voice.
 */
export async function transformDialogue(
	dialogue: string,
	targetProfile: Parameters<
		typeof import("@/lib/ai/services/voice-profile-service").VoiceProfileService.prototype.transformDialogue
	>[1],
) {
	try {
		const { voiceProfileService } = await import(
			"@/lib/ai/services/voice-profile-service"
		);

		const transformed = await voiceProfileService.transformDialogue(
			dialogue,
			targetProfile,
		);
		return { success: true, transformed };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

// =============================================================================
// Plot Hole Detection Actions
// =============================================================================

/**
 * Analyze project for plot holes and inconsistencies.
 */
export async function analyzeProjectPlot(projectId: string) {
	try {
		const { plotHoleDetectorService } = await import(
			"@/lib/ai/services/plot-hole-detector-service"
		);

		const analysis = await plotHoleDetectorService.analyzeProject(projectId);
		return { success: true, analysis };

	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function analyzeChapterPlotAction(chapterId: string) {
    try {
        const { plotHoleDetectorService } = await import(
            "@/lib/ai/services/plot-hole-detector-service"
        );
        const analysis = await plotHoleDetectorService.analyzeChapter(chapterId);
        return { success: true, analysis };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// =============================================================================
// Voice Profile Management Checks
// =============================================================================

export async function getProjectCharactersAction(projectId: string) {
	try {
        const { db } = await import("@/lib/db/drizzle");
        const { entity } = await import("@/lib/db/schema");
        const { and, eq } = await import("drizzle-orm");

		const characters = await db
            .select({ id: entity.id, name: entity.name })
            .from(entity)
            .where(
                and(
                    eq(entity.projectId, projectId),
                    eq(entity.kind, "character")
                )
            );
		return { success: true, characters };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function getVoiceProfileAction(entityId: string) {
	try {
		const { entityRepository } = await import("@/lib/db/repositories/entity-repository");
		const profile = await entityRepository.getVoiceProfile(entityId);
		return { success: true, profile };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function saveVoiceProfileAction(
	profileData: Omit<
		import("@/lib/db/schema").VoiceProfile,
		"id" | "createdAt" | "updatedAt"
	>,
) {
	try {
		const { entityRepository } = await import("@/lib/db/repositories/entity-repository");
		const profile = await entityRepository.saveVoiceProfile(profileData);
		return { success: true, profile };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function generateAndSaveVoiceProfileAction(
    entityId: string,
    characterName: string,
    samples: string[]
) {
    try {
        const { voiceProfileService } = await import("@/lib/ai/services/voice-profile-service");
		const { entityRepository } = await import("@/lib/db/repositories/entity-repository");

        const profile = await voiceProfileService.generateVoiceProfile(entityId, characterName, samples);
        
        // Save to DB (exclude name as it's on the Entity, convert dialect to null if undefined)
        const { name, sampleDialogue, ...rest } = profile;
        const dbProfile = {
            ...rest,
            entityId, // Ensure entityId is present
            sampleDialogue: sampleDialogue || [],
            dialect: rest.dialect ?? null,
            averageSentenceLength: rest.averageSentenceLength || 0,
            confidence: 1.0 // Default confidence if missing
        };

        const saved = await entityRepository.saveVoiceProfile(dbProfile);
        
        return { success: true, profile: saved };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function checkSceneVoiceConsistencyAction(
	sceneId: string,
	entityId: string,
) {
	try {
        // Fetch scene content
		const { db } = await import("@/lib/db/drizzle");
        const { scene } = await import("@/lib/db/schema");
        const { eq } = await import("drizzle-orm");
        
        const [sceneData] = await db.select().from(scene).where(eq(scene.id, sceneId));
        if (!sceneData || !sceneData.content) {
            return { success: false, error: "Scene not found or empty" };
        }

        // Fetch voice profile & entity name
		const { entityRepository } = await import("@/lib/db/repositories/entity-repository");
        const { entity: entityTable } = await import("@/lib/db/schema");
        
        const [profile, [entity]] = await Promise.all([
            entityRepository.getVoiceProfile(entityId),
            db.select({ name: entityTable.name }).from(entityTable).where(eq(entityTable.id, entityId))
        ]);
        
        if (!profile) {
            return { success: false, error: "Voice profile not found" };
        }
        if (!entity) {
            return { success: false, error: "Entity not found" };
        }

        // Run check
		const { voiceProfileService } = await import(
			"@/lib/ai/services/voice-profile-service"
		);
        
        // Extract dialogue from scene (simple regex or use service)
        const dialogueMatches = sceneData.content.match(/"[^"]+"/g) || [];
        
        // Construct full profile for service (needs name)
        const serviceProfile = {
            ...profile,
            name: entity.name,
            dialect: profile.dialect ?? undefined // Convert null to undefined for service
        };

		const result = await voiceProfileService.checkVoiceConsistency(
			serviceProfile as import("@/lib/ai/services/voice-profile-service").VoiceProfile,
			dialogueMatches
		);
        
		return { success: true, result };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function reviseTextAction(
    text: string, 
    instructions: string, 
    focus?: string[]
) {
    try {
        const { revisionPipelineService } = await import("@/lib/ai/services/revision-pipeline-service");
        const result = await revisionPipelineService.revise(text, instructions, {
            focus: focus as any
        });
        return { success: true, result };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function runFullRevisionAction(text: string, style?: string) {
    try {
        const { revisionPipelineService } = await import("@/lib/ai/services/revision-pipeline-service");
        const result = await revisionPipelineService.runFullRevision(text, style);
        return { success: true, result };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Approve a paused generation (resume pipeline).
 */
export async function approveChapterAction(generationId: string) {
	try {
		const { bookPipelineService } = await import(
			"@/lib/ai/services/book-pipeline-service"
		);

        // Resume pipeline (Fire and forget)
        (async () => {
             for await (const _ of bookPipelineService.resumePipeline(generationId)) {}
        })();
        
		return { success: true };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

/**
 * Reject a chapter and force revision.
 */
export async function rejectChapterAction(
    generationId: string, 
    stepId: string, 
    instructions: string
) {
	try {
		const { bookPipelineService } = await import(
			"@/lib/ai/services/book-pipeline-service"
		);

        await bookPipelineService.forceRevision(generationId, stepId, instructions);

        // Resume pipeline
        (async () => {
             for await (const _ of bookPipelineService.resumePipeline(generationId)) {}
        })();

		return { success: true };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

