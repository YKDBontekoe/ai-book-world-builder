export interface WidgetInput {
	userRequest?: string;
	instructions?: string;
	[key: string]: unknown;
}

export interface OrchestratorDecision {
	actionIcon?: string;
	actionTitle?: string;
	nextAction?: string;
	targetName?: string;
	[key: string]: unknown;
}

export interface ProjectStats {
	characters?: number;
	locations?: number;
	chapters?: number;
	scenes?: number;
	draftedScenes?: number;
	[key: string]: unknown;
}

export interface WidgetOutput {
	error?: string;
	decision?: OrchestratorDecision;
	projectStats?: ProjectStats;
	readinessScore?: number;
	projectName?: string;
	nextStepPreview?: string;
	preview?: string;
	wordCount?: number;
	sceneId?: string;
	message?: string;
	[key: string]: unknown;
}

export interface GenerationWidgetProps {
	toolName: string;
	state: string;
	input: WidgetInput;
	output?: WidgetOutput;
}
