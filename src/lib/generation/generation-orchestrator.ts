/**
 * Generation Orchestrator - Coordinates the multi-agent book generation workflow
 */
import type { GenerationSettings } from "@/lib/db/schema";
import { GenerationPipeline } from "@/lib/generation/pipeline";
import type { GenerationCallbacks } from "@/lib/generation/step-logger";

// Re-export types for backward compatibility
export type { GenerationCallbacks } from "@/lib/generation/step-logger";

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
export async function runGeneration(
	options: RunGenerationOptions,
): Promise<void> {
	const pipeline = new GenerationPipeline(options);
	await pipeline.execute();
}
