import type { BookGenerationStep, GenerationSettings } from "@/lib/db/schema";

export interface ProcessStepContext {
	projectData: any;
	settings: GenerationSettings;
	globalNotes: string[];
	previousChapterSummary: string;
	chapterContents: Map<string, string>;
	log: (msg: string, type?: "writer" | "reviewer" | "orchestrator") => void;
}

export interface StepHandler {
	process(step: BookGenerationStep, ctx: ProcessStepContext): Promise<void>;
}
