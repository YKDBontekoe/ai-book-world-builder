/**
 * Consistency Service
 *
 * Analyzes project content for continuity and consistency issues.
 */

import "server-only";

import { z } from "zod";
import { aiClient } from "@/lib/ai/services/ai-client";
import { BaseService } from "@/lib/services/base-service";
import {
	clearIssuesForProject,
	createIssues,
	getEntitiesForProject,
	getScenesForProject,
} from "@/lib/db/queries";
import type {
	ConsistencyIssue,
	ConsistencyIssueSeverity,
	ConsistencyIssueType,
} from "@/lib/db/schema/issues";

// =============================================================================
// Schemas
// =============================================================================

const issueSchema = z.object({
	issues: z.array(
		z.object({
			type: z.enum(["continuity", "character", "plot", "tone", "world"]),
			description: z
				.string()
				.describe("A clear description of the inconsistency"),
			suggestion: z.string().describe("How to fix it"),
			severity: z.enum(["low", "medium", "high", "critical"]),
			sceneIds: z
				.array(z.string())
				.describe("IDs of scenes involved in this issue (if applicable)"),
		}),
	),
});

// =============================================================================
// Service
// =============================================================================

export class ConsistencyService extends BaseService {
	/**
	 * Analyze a project for consistency issues.
	 */
	async analyzeProject(
		projectId: string,
	): Promise<Partial<ConsistencyIssue>[]> {
		// 1. Fetch Data
		const entities = await getEntitiesForProject({ projectId });
		const scenes = await getScenesForProject({ projectId });

		const draftedScenes = scenes.filter(
			(s) =>
				s.status === "drafted" || s.status === "final" || s.status === "review",
		);

		if (draftedScenes.length === 0) {
			return [];
		}

		// 2. Prepare Context
		const entityContext = entities
			.map((e) => `- ${e.name} (${e.kind}): ${e.summary}`)
			.join("\n");

		// Analyze the last 5 drafted scenes
		const scenesToAnalyze = draftedScenes.slice(-5);

		const sceneContext = scenesToAnalyze
			.map(
				(s) => `
Scene ID: ${s.id}
Title: ${s.title}
Content:
${s.content || "(No content)"}
`,
			)
			.join("\n---\n");

		// 3. Call AI
		const systemPrompt =
			"You are a continuity editor for a novel. Your job is to find inconsistencies between the 'World Bible' (Entities) and the written 'Scenes'. Look for character description errors, plot holes, or tone shifts.";

		const prompt = `
World Bible (Entities):
${entityContext}

Scenes to Analyze:
${sceneContext}

Task: Identify inconsistencies.
- If a character does something impossible based on their description.
- If the plot contradicts itself between scenes.
- If the tone shifts wildly.

Return a list of issues.
`;

		const result = await aiClient.generateObject({
			prompt,
			schema: issueSchema,
			options: { system: systemPrompt, modelRole: "checker" },
		});

		if (!result.success) {
			throw new Error(result.error);
		}

		// 4. Save Results
		await clearIssuesForProject(projectId);

		const newIssues: Partial<ConsistencyIssue>[] =
			result.data.object.issues.map((issue) => ({
				projectId,
				type: issue.type as ConsistencyIssueType,
				description: issue.description,
				suggestion: issue.suggestion,
				severity: issue.severity as ConsistencyIssueSeverity,
				sceneId: issue.sceneIds[0] || null,
			}));

		if (newIssues.length > 0) {
			await createIssues(newIssues);
		}

		return newIssues;
	}
}

export const consistencyService = new ConsistencyService();
