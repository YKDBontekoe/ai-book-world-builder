import {
	type BookGenerationStep,
	type GenerationSettings,
} from "@/lib/db/schema";

export interface ProcessStepContext {
	projectData: any;
	settings: GenerationSettings;
	globalNotes: string[];
	previousChapterSummary: string;
	chapterContents: Map<string, string>;
	log: (msg: string, type?: "writer" | "reviewer" | "orchestrator") => void;
}

export interface StepProcessor {
	process(step: BookGenerationStep, context: ProcessStepContext): Promise<void>;
}
