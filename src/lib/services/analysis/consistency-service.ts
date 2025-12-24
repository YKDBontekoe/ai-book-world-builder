import "server-only";

import { generateObject } from "ai";
import { z } from "zod";
import { getSelectedModelId } from "@/lib/ai/models";
import { myProvider } from "@/lib/ai/providers";
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

export class ConsistencyService {
	async analyzeProject(projectId: string) {
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
		// Limit context to fit model window.
		// We summarize entities and scene content.

		const entityContext = entities
			.map((e) => `- ${e.name} (${e.kind}): ${e.summary}`)
			.join("\n");

		// We take the last 5 scenes fully, and summaries of others?
		// For now, let's just analyze the LAST 5 drafted scenes to keep it fast/cheap.
		// Or specific target scenes?
		// The user wants "Continuous Analysis".

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
		const modelId = await getSelectedModelId("large"); // Use smart model

		const { object } = await generateObject({
			model: myProvider.languageModel(modelId),
			schema: issueSchema,
			system:
				"You are a continuity editor for a novel. Your job is to find inconsistencies between the 'World Bible' (Entities) and the written 'Scenes'. Look for character description errors, plot holes, or tone shifts.",
			prompt: `
World Bible (Entities):
${entityContext}

Scenes to Analyze:
${sceneContext}

Task: Identify inconsistencies.
- If a character does something impossible based on their description.
- If the plot contradicts itself between scenes.
- If the tone shifts wildly.

Return a list of issues.
`,
		});

		// 4. Save Results
		// First, clear old issues?
		// Maybe we should only clear issues linked to these scenes?
		// For simplicity in this MVP, we verify globally or per-run.
		// Let's NOT clear all, but maybe we should tagging them?
		// "Continuous" implies we might accumulate.
		// But if we re-run, we want to remove stale ones.
		// Let's clear ALL issues for the project for now to avoid duplicates,
		// effectively treating "Run Analysis" as a full re-scan (of the window).

		await clearIssuesForProject(projectId);

		const newIssues: Partial<ConsistencyIssue>[] = object.issues.map(
			(issue) => ({
				projectId,
				type: issue.type as ConsistencyIssueType,
				description: issue.description,
				suggestion: issue.suggestion,
				severity: issue.severity as ConsistencyIssueSeverity,
				sceneId: issue.sceneIds[0] || null, // Link to first scene if available
			}),
		);

		if (newIssues.length > 0) {
			await createIssues(newIssues);
		}

		return newIssues;
	}
}

export const consistencyService = new ConsistencyService();
