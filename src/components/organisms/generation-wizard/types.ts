/**
 * Generation Wizard Types
 *
 * Types for the full book generation wizard.
 */

import type { GenerationSettings, WritingStylePreset } from "@/lib/db/schema/generation";

/**
 * Wizard step identifiers.
 */
export type WizardStep =
	| "context"
	| "style"
	| "structure"
	| "advanced"
	| "review";

/**
 * Context selection state.
 */
export interface ContextSelection {
	includeAllEntities: boolean;
	selectedEntityIds: string[];
	includeAllOutlines: boolean;
	selectedOutlineIds: string[];
}

/**
 * Style configuration state.
 */
export interface StyleConfig {
	presetId: WritingStylePreset;
	customDescription: string;
	authorInspirations: string[];
	targetAudience: string;
}

/**
 * Structure configuration state.
 */
export interface StructureConfig {
	totalChapters: number;
	pagesPerChapter: number;
	includePrologue: boolean;
	includeEpilogue: boolean;
}

/**
 * Advanced options state.
 */
export interface AdvancedConfig {
	revisionRounds: number;
	runConsistencyCheck: boolean;
	generateBackCoverBlurb: boolean;
	generateFrontCover: boolean;
	generateCharacterSheets: boolean;
	generateChapterSummaries: boolean;
	generateTableOfContents: boolean;
}

/**
 * Complete wizard state.
 */
export interface GenerationWizardState {
	step: WizardStep;
	context: ContextSelection;
	style: StyleConfig;
	structure: StructureConfig;
	advanced: AdvancedConfig;
	// Metadata
	bookTitle: string;
	bookSubtitle: string;
	authorName: string;
	genre: string;
}

/**
 * Default values for the wizard.
 */
export const DEFAULT_WIZARD_STATE: GenerationWizardState = {
	step: "context",
	context: {
		includeAllEntities: true,
		selectedEntityIds: [],
		includeAllOutlines: true,
		selectedOutlineIds: [],
	},
	style: {
		presetId: "custom",
		customDescription: "",
		authorInspirations: [],
		targetAudience: "",
	},
	structure: {
		totalChapters: 12,
		pagesPerChapter: 15,
		includePrologue: true,
		includeEpilogue: true,
	},
	advanced: {
		revisionRounds: 1,
		runConsistencyCheck: true,
		generateBackCoverBlurb: true,
		generateFrontCover: false,
		generateCharacterSheets: false,
		generateChapterSummaries: true,
		generateTableOfContents: true,
	},
	bookTitle: "",
	bookSubtitle: "",
	authorName: "",
	genre: "Fantasy",
};

/**
 * Convert wizard state to generation settings.
 */
export function toGenerationSettings(
	state: GenerationWizardState,
): GenerationSettings {
	return {
		contextSelection: {
			entities: [],
			outlines: [],
			scenes: [],
			drafts: [],
			sourceMaterials: [],
		},
		totalChapters: state.structure.totalChapters,
		pagesPerChapter: state.structure.pagesPerChapter,
		writingStylePreset: state.style.presetId,
		customStyleDescription: state.style.customDescription,
		authorInspirations: state.style.authorInspirations,
		writerModelId: "default",
		reviewerModelId: "default",
		revisionRounds: state.advanced.revisionRounds,
		includePrologue: state.structure.includePrologue,
		includeEpilogue: state.structure.includeEpilogue,
		generateBackCoverBlurb: state.advanced.generateBackCoverBlurb,
		generateFrontCover: state.advanced.generateFrontCover,
		generateCharacterSheets: state.advanced.generateCharacterSheets,
		generateChapterSummaries: state.advanced.generateChapterSummaries,
		generateTableOfContents: state.advanced.generateTableOfContents,
		runConsistencyCheck: state.advanced.runConsistencyCheck,
		bookTitle: state.bookTitle,
		bookSubtitle: state.bookSubtitle,
		authorName: state.authorName,
		genre: state.genre,
		targetAudience: state.style.targetAudience,
	};
}
