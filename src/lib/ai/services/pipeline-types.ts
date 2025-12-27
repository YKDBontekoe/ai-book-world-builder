/**
 * Pipeline Types
 *
 * Shared types for the book generation pipeline.
 */

import type {
	GenerationSettings,
	GenerationStepStatus,
	GenerationStepType,
} from "@/lib/db/schema/generation";

// =============================================================================
// Pipeline Configuration
// =============================================================================

/**
 * Configuration for initializing a book generation pipeline.
 */
export interface PipelineConfig {
	projectId: string;
	settings: GenerationSettings;
}

// =============================================================================
// Pipeline Events
// =============================================================================

/**
 * Base event info included in all pipeline events.
 */
interface BaseEvent {
	timestamp: string;
	generationId: string;
}

/**
 * Status update event - general progress information.
 */
export interface StatusEvent extends BaseEvent {
	type: "status";
	status: string;
	progress: number; // 0-100
}

/**
 * Step start event - when a pipeline step begins.
 */
export interface StepStartEvent extends BaseEvent {
	type: "step_start";
	stepType: GenerationStepType;
	stepId: string;
	name: string;
	sequence: number;
}

/**
 * Step progress event - intermediate progress within a step.
 */
export interface StepProgressEvent extends BaseEvent {
	type: "step_progress";
	stepType: GenerationStepType;
	stepId: string;
	message: string;
	tokensGenerated?: number;
}

/**
 * Step complete event - when a pipeline step finishes successfully.
 */
export interface StepCompleteEvent extends BaseEvent {
	type: "step_complete";
	stepType: GenerationStepType;
	stepId: string;
	result: StepResult;
}

/**
 * Step error event - when a pipeline step fails.
 */
export interface StepErrorEvent extends BaseEvent {
	type: "step_error";
	stepType: GenerationStepType;
	stepId: string;
	error: string;
	recoverable: boolean;
}

/**
 * Quality gate event - result of a quality check.
 */
export interface QualityGateEvent extends BaseEvent {
	type: "quality_gate";
	stepId: string;
	passed: boolean;
	score: number;
	issues?: QualityIssue[];
	recommendation: "approve" | "minor_revision" | "major_revision" | "rewrite";
}

/**
 * Paused event - pipeline has been paused.
 */
export interface PausedEvent extends BaseEvent {
	type: "paused";
	reason: string;
	canResume: boolean;
}

/**
 * Completed event - pipeline has finished.
 */
export interface CompletedEvent extends BaseEvent {
	type: "completed";
	summary: GenerationSummary;
}

export interface ApprovalRequestedEvent extends BaseEvent {
	type: "approval_requested";
	stepId: string;
	reason: string;
}

/**
 * Union of all pipeline events.
 */
export type PipelineEvent =
	| StatusEvent
	| StepStartEvent
	| StepProgressEvent
	| StepCompleteEvent
	| StepErrorEvent
	| QualityGateEvent
	| PausedEvent
	| CompletedEvent
	| ApprovalRequestedEvent;

// =============================================================================
// Step Results
// =============================================================================

/**
 * Result from executing a pipeline step.
 */
export interface StepResult {
	/** Generated content (prose, blurb, etc.) */
	content?: string;

	/** Word count of generated content */
	wordCount?: number;

	/** Tokens consumed during generation */
	tokensUsed?: number;

	/** Model ID used for this step */
	modelId?: string;

	/** Time taken in milliseconds */
	duration?: number;

	/** Any metadata specific to the step type */
	metadata?: Record<string, unknown>;
}

/**
 * Result from a review step.
 */
export interface ReviewResult {
	overallScore: number; // 1-10
	issues: ReviewIssue[];
	strengths: string[];
	recommendation: "approve" | "minor_revision" | "major_revision" | "rewrite";
}

/**
 * Individual issue found during review.
 */
export interface ReviewIssue {
	type: "pacing" | "character" | "dialogue" | "description" | "consistency";
	severity: "minor" | "moderate" | "major";
	location: string;
	description: string;
	suggestion: string;
}

// =============================================================================
// Quality Issues
// =============================================================================

/**
 * Quality issue detected during pipeline execution.
 */
export interface QualityIssue {
	type: "consistency" | "pacing" | "character" | "plot" | "dialogue" | "world";
	severity: "low" | "medium" | "high" | "critical";
	description: string;
	suggestion: string;
	affectedContent?: string;
}

// =============================================================================
// Pipeline Summary
// =============================================================================

/**
 * Summary of a completed generation pipeline.
 */
export interface GenerationSummary {
	/** Total words generated across all chapters */
	totalWords: number;

	/** Number of chapters generated */
	chaptersGenerated: number;

	/** Number of revision passes completed */
	revisionsCompleted: number;

	/** Total tokens consumed */
	totalTokensUsed: number;

	/** Estimated cost in USD */
	estimatedCostUsd: number;

	/** Total duration in seconds */
	durationSeconds: number;

	/** Steps completed vs total */
	stepsCompleted: number;
	stepsTotal: number;

	/** Any assets generated (cover, blurb, etc.) */
	assetsGenerated: string[];
}

// =============================================================================
// Pipeline Status
// =============================================================================

/**
 * Current status of a generation pipeline.
 */
export interface PipelineStatus {
	generationId: string;
	projectId: string;
	status: "idle" | "running" | "paused" | "completed" | "failed" | "awaiting_approval";

	/** Progress percentage (0-100) */
	progress: number;

	/** Current step being executed */
	currentStep?: {
		id: string;
		type: GenerationStepType;
		name: string;
		status: GenerationStepStatus;
	};

	/** Steps breakdown */
	steps: {
		total: number;
		completed: number;
		failed: number;
		pending: number;
	};

	/** Running totals */
	totals: {
		wordsGenerated: number;
		tokensUsed: number;
		estimatedCostUsd: number;
	};

	/** Timestamps */
	startedAt?: string;
	pausedAt?: string;
	completedAt?: string;

	/** Error if failed */
	error?: string;
}

// =============================================================================
// Chapter Generation Context
// =============================================================================

/**
 * Context needed for generating a chapter.
 */
export interface ChapterGenerationContext {
	generationId: string;
	projectId: string;
	chapterId: string;
	chapterNumber: number;
	chapterTitle: string;
	chapterNotes?: string;

	/** Summary of previous chapter for continuity */
	previousChapterSummary?: string;

	/** Entity context (characters, locations, etc.) */
	entityContext: string;

	/** Style guide from settings */
	styleGuide: StyleGuide;

	/** Current story state (knowledge, injuries, etc.) */
	storyState?: StoryStateContext;
}

/**
 * Writing style guide derived from settings.
 */
export interface StyleGuide {
	presetId: string;
	presetName: string;
	customDescription?: string;
	authorInspirations?: string[];
	targetPagesPerChapter: number;
	targetWordsPerPage: number; // Typically 250-300
}

/**
 * Story state context for maintaining continuity.
 */
export interface StoryStateContext {
	characterKnowledge: Record<string, string[]>;
	characterInjuries: Record<string, string[]>;
	openThreads: string[];
	revealsMade: string[];
	worldStateChanges: string[];
}

// =============================================================================
// Revision Context
// =============================================================================

/**
 * Context for revising a chapter.
 */
export interface RevisionContext {
	originalContent: string;
	reviewFeedback: ReviewResult;
	revisionRound: number;
	maxRevisions: number;
	focusAreas: ReviewIssue[];
}
