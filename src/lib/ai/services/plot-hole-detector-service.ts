/**
 * Plot Hole Detector Service
 *
 * Proactively identifies logical inconsistencies, unresolved plot threads,
 * timeline conflicts, and character motivation issues.
 */

import "server-only";

import { z } from "zod";
import { BaseAIService } from "@/lib/ai/services/base-ai-service";
import {
	getEntitiesForProject,
	getScenesForProject,
    getScenesForChapter,
} from "@/lib/db/queries";

// =============================================================================
// Types
// =============================================================================

/**
 * A detected plot hole or inconsistency.
 */
export interface PlotHole {
	/** Type of plot hole */
	type:
		| "continuity"
		| "timeline"
		| "motivation"
		| "physics"
		| "chekhov"
		| "character"
		| "world_rule";

	/** Severity of the issue */
	severity: "minor" | "major" | "critical";

	/** Human-readable title */
	title: string;

	/** Detailed description of the issue */
	description: string;

	/** Scene IDs involved in this plot hole */
	sceneIds: string[];

	/** Evidence quotes from the text */
	evidence: PlotHoleEvidence[];

	/** Suggested fix */
	suggestion: string;

	/** Confidence score (0-1) */
	confidence: number;
}

/**
 * Evidence supporting a plot hole detection.
 */
export interface PlotHoleEvidence {
	sceneId: string;
	sceneTitle: string;
	quote: string;
	relevance: string;
}

/**
 * A Chekhov's Gun element (setup that needs payoff).
 */
export interface ChekovElement {
	/** Unique identifier */
	id: string;

	/** Name/description of the element */
	name: string;

	/** Scene where it was introduced */
	setupSceneId: string;

	/** Description of how it was set up */
	setupDescription: string;

	/** Current status */
	status: "pending" | "resolved" | "abandoned";

	/** Scene where it was resolved (if applicable) */
	resolutionSceneId?: string;

	/** How it was resolved */
	resolutionDescription?: string;

	/** How important is this to resolve */
	importance: "minor" | "moderate" | "major";
}

/**
 * Timeline conflict between events.
 */
export interface TimelineConflict {
	/** Description of the conflict */
	description: string;

	/** First event in the conflict */
	event1: {
		sceneId: string;
		sceneTitle: string;
		description: string;
		impliedTime?: string;
	};

	/** Second event that conflicts */
	event2: {
		sceneId: string;
		sceneTitle: string;
		description: string;
		impliedTime?: string;
	};

	/** Why these events conflict */
	conflictReason: string;

	/** Suggested resolution */
	suggestion: string;
}

/**
 * Character motivation inconsistency.
 */
export interface MotivationIssue {
	/** Character entity ID */
	entityId: string;

	/** Character name */
	characterName: string;

	/** The problematic action */
	action: string;

	/** Scene where action occurs */
	sceneId: string;

	/** Why this conflicts with established motivation */
	conflict: string;

	/** Character's established motivation */
	establishedMotivation: string;

	/** Severity of the inconsistency */
	severity: "minor" | "moderate" | "major";

	/** Suggested fix */
	suggestion: string;
}

/**
 * Full plot analysis result.
 */
export interface PlotAnalysis {
	/** Overall consistency score (0-100) */
	overallScore: number;

	/** Number of issues by severity */
	issueCounts: {
		critical: number;
		major: number;
		minor: number;
	};

	/** All detected plot holes */
	plotHoles: PlotHole[];

	/** Chekhov's guns tracking */
	chekovElements: ChekovElement[];

	/** Timeline conflicts */
	timelineConflicts: TimelineConflict[];

	/** Motivation issues */
	motivationIssues: MotivationIssue[];

	/** General recommendations */
	recommendations: string[];
}

// =============================================================================
// Schemas
// =============================================================================

const plotHoleSchema = z.object({
	plotHoles: z.array(
		z.object({
			type: z.enum([
				"continuity",
				"timeline",
				"motivation",
				"physics",
				"chekhov",
				"character",
				"world_rule",
			]),
			severity: z.enum(["minor", "major", "critical"]),
			title: z.string(),
			description: z.string(),
			sceneIds: z.array(z.string()),
			evidence: z.array(
				z.object({
					sceneId: z.string(),
					sceneTitle: z.string(),
					quote: z.string(),
					relevance: z.string(),
				}),
			),
			suggestion: z.string(),
			confidence: z.number().min(0).max(1),
		}),
	),
	recommendations: z.array(z.string()),
});

const chekovSchema = z.object({
	elements: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			setupSceneId: z.string(),
			setupDescription: z.string(),
			status: z.enum(["pending", "resolved", "abandoned"]),
			resolutionSceneId: z.string().optional(),
			resolutionDescription: z.string().optional(),
			importance: z.enum(["minor", "moderate", "major"]),
		}),
	),
});

const timelineSchema = z.object({
	conflicts: z.array(
		z.object({
			description: z.string(),
			event1: z.object({
				sceneId: z.string(),
				sceneTitle: z.string(),
				description: z.string(),
				impliedTime: z.string().optional(),
			}),
			event2: z.object({
				sceneId: z.string(),
				sceneTitle: z.string(),
				description: z.string(),
				impliedTime: z.string().optional(),
			}),
			conflictReason: z.string(),
			suggestion: z.string(),
		}),
	),
});

const motivationSchema = z.object({
	issues: z.array(
		z.object({
			entityId: z.string(),
			characterName: z.string(),
			action: z.string(),
			sceneId: z.string(),
			conflict: z.string(),
			establishedMotivation: z.string(),
			severity: z.enum(["minor", "moderate", "major"]),
			suggestion: z.string(),
		}),
	),
});

// =============================================================================
// Service
// =============================================================================

export class PlotHoleDetectorService extends BaseAIService {
	/**
	 * Perform a comprehensive plot analysis for a project.
	 */
	async analyzeProject(projectId: string): Promise<PlotAnalysis> {
		// Fetch project data
		const [entities, scenes] = await Promise.all([
			getEntitiesForProject({ projectId }),
			getScenesForProject({ projectId }),
		]);

		// Filter to drafted scenes only
		const draftedScenes = scenes.filter(
			(s) => s.status === "drafted" || s.status === "final",
		);

		if (draftedScenes.length === 0) {
			return this.createEmptyAnalysis();
		}

		// Build context for analysis
		const entityContext = entities
			.map((e) => `${e.name} (${e.kind}): ${e.summary || "No description"}`)
			.join("\n");

		const sceneContext = draftedScenes
			.slice(-10) // Analyze last 10 scenes for performance
			.map(
				(s) =>
					`Scene ID: ${s.id}\nTitle: ${s.title}\nContent: ${s.content?.substring(0, 1000) || "(empty)"}`,
			)
			.join("\n\n---\n\n");

		// Run parallel analyses
		const [plotHoles, chekovElements, timelineConflicts, motivationIssues] =
			await Promise.all([
				this.detectPlotHoles(entityContext, sceneContext),
				this.trackChekhovsGuns(sceneContext),
				this.validateTimeline(sceneContext),
				this.checkMotivations(entityContext, sceneContext),
			]);

		// Calculate overall score
		const criticalCount = plotHoles.filter(
			(h) => h.severity === "critical",
		).length;
		const majorCount = plotHoles.filter((h) => h.severity === "major").length;
		const minorCount = plotHoles.filter((h) => h.severity === "minor").length;

		const overallScore = Math.max(
			0,
			100 - criticalCount * 20 - majorCount * 10 - minorCount * 3,
		);

		return {
			overallScore,
			issueCounts: {
				critical: criticalCount,
				major: majorCount,
				minor: minorCount,
			},
			plotHoles,
			chekovElements,
			timelineConflicts,
			motivationIssues,
			recommendations: this.generateRecommendations(
				plotHoles,
				chekovElements,
				timelineConflicts,
				motivationIssues,
			),
		};
	}

	/**
	 * Analyze a single chapter for plot holes.
	 */
	async analyzeChapter(chapterId: string): Promise<PlotAnalysis> {
		const scenes = await getScenesForChapter({ chapterId });

		if (scenes.length === 0) {
			return this.createEmptyAnalysis();
		}

        const projectId = scenes[0].projectId;
        const entities = await getEntitiesForProject({ projectId });

		// Build context for analysis
		const entityContext = entities
			.map((e) => `${e.name} (${e.kind}): ${e.summary || "No description"}`)
			.join("\n");

		const sceneContext = scenes
			.sort((a, b) => a.sequence - b.sequence)
			.map(
				(s) =>
					`Scene ID: ${s.id}\nTitle: ${s.title}\nContent: ${s.content?.substring(0, 5000) || "(empty)"}`,
			)
			.join("\n\n---\n\n");

		// Run parallel analyses
		const [plotHoles, chekovElements, timelineConflicts, motivationIssues] =
			await Promise.all([
				this.detectPlotHoles(entityContext, sceneContext),
				this.trackChekhovsGuns(sceneContext),
				this.validateTimeline(sceneContext),
				this.checkMotivations(entityContext, sceneContext),
			]);

		// Calculate overall score
		const criticalCount = plotHoles.filter(
			(h) => h.severity === "critical",
		).length;
		const majorCount = plotHoles.filter((h) => h.severity === "major").length;
		const minorCount = plotHoles.filter((h) => h.severity === "minor").length;

		const overallScore = Math.max(
			0,
			100 - criticalCount * 20 - majorCount * 10 - minorCount * 3,
		);

		return {
			overallScore,
			issueCounts: {
				critical: criticalCount,
				major: majorCount,
				minor: minorCount,
			},
			plotHoles,
			chekovElements,
			timelineConflicts,
			motivationIssues,
			recommendations: this.generateRecommendations(
				plotHoles,
				chekovElements,
				timelineConflicts,
				motivationIssues,
			),
		};
	}

	/**
	 * Detect general plot holes and inconsistencies.
	 */
	async detectPlotHoles(
		entityContext: string,
		sceneContext: string,
	): Promise<PlotHole[]> {
		const systemPrompt = `You are an expert story editor specializing in finding plot holes and inconsistencies.

Look for:
1. CONTINUITY errors - characters/objects appearing/disappearing, changed details
2. TIMELINE issues - impossible sequences of events
3. MOTIVATION problems - characters acting against established goals
4. PHYSICS violations - impossible actions without magical explanation
5. WORLD RULE violations - breaking established rules of the story world
6. CHARACTER inconsistencies - personality shifts without explanation

Be thorough but avoid false positives. Only flag genuine issues.`;

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			`Entity Bible:\n${entityContext}\n\nScenes to Analyze:\n${sceneContext}`,
			plotHoleSchema,
			{ modelRole: "checker", maxTokens: 4000 },
		);

		if (!result.success) {
			return [];
		}

		return result.data.object.plotHoles;
	}

	/**
	 * Track setup elements that need payoff (Chekhov's Guns).
	 */
	async trackChekhovsGuns(sceneContext: string): Promise<ChekovElement[]> {
		const systemPrompt = `You are an expert at identifying narrative "Chekhov's Guns" - elements that are set up and need payoff.

Look for:
1. Objects given special attention that should be used later
2. Character abilities or knowledge mentioned but not yet applied
3. Foreshadowing that needs resolution
4. Promises made that should be kept or broken
5. Mysteries or questions raised that need answers

Track whether each element has been resolved or is still pending.`;

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			`Scenes to Analyze:\n${sceneContext}`,
			chekovSchema,
			{ modelRole: "checker" },
		);

		if (!result.success) {
			return [];
		}

		return result.data.object.elements;
	}

	/**
	 * Validate timeline consistency.
	 */
	async validateTimeline(sceneContext: string): Promise<TimelineConflict[]> {
		const systemPrompt = `You are an expert at analyzing narrative timelines for consistency.

Look for:
1. Events that couldn't happen in the implied order
2. Characters being in two places at once
3. Time gaps that don't make sense
4. Travel times that are impossible
5. Seasonal/time-of-day inconsistencies`;

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			`Scenes to Analyze (in order):\n${sceneContext}`,
			timelineSchema,
			{ modelRole: "checker" },
		);

		if (!result.success) {
			return [];
		}

		return result.data.object.conflicts;
	}

	/**
	 * Check character motivation consistency.
	 */
	async checkMotivations(
		entityContext: string,
		sceneContext: string,
	): Promise<MotivationIssue[]> {
		const systemPrompt = `You are an expert at analyzing character motivations in fiction.

Look for actions that conflict with established character motivations:
1. Characters doing things they would never do
2. Sudden personality shifts without explanation
3. Goals abandoned without reason
4. Decisions that make no sense for the character

Consider that characters can change, but changes should be motivated.`;

		const result = await this.generateObjectWithSystem(
			systemPrompt,
			`Characters:\n${entityContext}\n\nScenes:\n${sceneContext}`,
			motivationSchema,
			{ modelRole: "checker" },
		);

		if (!result.success) {
			return [];
		}

		return result.data.object.issues;
	}

	/**
	 * Generate recommendations based on analysis results.
	 */
	private generateRecommendations(
		plotHoles: PlotHole[],
		chekovElements: ChekovElement[],
		timelineConflicts: TimelineConflict[],
		motivationIssues: MotivationIssue[],
	): string[] {
		const recommendations: string[] = [];

		// Critical plot holes
		const criticalHoles = plotHoles.filter((h) => h.severity === "critical");
		if (criticalHoles.length > 0) {
			recommendations.push(
				`Address ${criticalHoles.length} critical plot hole(s) before publishing.`,
			);
		}

		// Unresolved Chekhov's guns
		const pendingChekovs = chekovElements.filter(
			(c) => c.status === "pending" && c.importance !== "minor",
		);
		if (pendingChekovs.length > 0) {
			recommendations.push(
				`${pendingChekovs.length} significant setup element(s) still need resolution.`,
			);
		}

		// Timeline issues
		if (timelineConflicts.length > 0) {
			recommendations.push(
				`Review timeline for ${timelineConflicts.length} potential conflict(s).`,
			);
		}

		// Character consistency
		const majorMotivationIssues = motivationIssues.filter(
			(m) => m.severity === "major",
		);
		if (majorMotivationIssues.length > 0) {
			recommendations.push(
				`${majorMotivationIssues.length} character action(s) may feel out of character.`,
			);
		}

		if (recommendations.length === 0) {
			recommendations.push("No significant issues detected. Great job!");
		}

		return recommendations;
	}

	/**
	 * Create empty analysis result.
	 */
	private createEmptyAnalysis(): PlotAnalysis {
		return {
			overallScore: 100,
			issueCounts: { critical: 0, major: 0, minor: 0 },
			plotHoles: [],
			chekovElements: [],
			timelineConflicts: [],
			motivationIssues: [],
			recommendations: ["No drafted content to analyze yet."],
		};
	}
}

// Export singleton instance
export const plotHoleDetectorService = new PlotHoleDetectorService();
