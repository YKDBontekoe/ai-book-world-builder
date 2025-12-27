/**
 * AI Services - Barrel Export
 *
 * Central export point for all AI services.
 */

// Core types and utilities
export * from "./types";
export * from "./pipeline-types";
export { aiClient } from "./ai-client";
export { BaseAIService } from "./base-ai-service";

// Services
export { GenerationService, generationService } from "./generation-service";
export type { GenerationOptions, SceneCardData } from "./generation-service";

export { PlanningService, planningService } from "./planning-service";

export { ConsistencyService, consistencyService } from "./consistency-service";

export {
	AnalysisService,
	analysisService,
	type DetectedEntity,
	type EntityDetails,
	type EntityKind,
	type InferredRelationship,
} from "./analysis-service";

// Pipeline Services
export {
	BookPipelineService,
	bookPipelineService,
} from "./book-pipeline-service";

// Assistant Services
export {
	WritingCoachService,
	writingCoachService,
	type WritingAnalysis,
	type WritingIssue,
	type WritingSuggestion,
	type ShowTellInstance,
	type PacingAnalysis,
	type DialogueAnalysis,
} from "./writing-coach-service";

export {
	VoiceProfileService,
	voiceProfileService,
	type VoiceProfile,
	type VoiceConsistencyResult,
	type VoiceIssue,
} from "./voice-profile-service";

export {
	PlotHoleDetectorService,
	plotHoleDetectorService,
	type PlotHole,
	type PlotAnalysis,
	type ChekovElement,
	type TimelineConflict,
	type MotivationIssue,
} from "./plot-hole-detector-service";

export {
    RevisionPipelineService,
    revisionPipelineService,
    type RevisionResult,
    type RevisionOptions,
    type RevisionFocus,
} from "./revision-pipeline-service";
