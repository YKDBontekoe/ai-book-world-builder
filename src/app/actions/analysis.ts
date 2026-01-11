"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { db } from "@/lib/db";
import { getIssuesForProject, resolveIssue } from "@/lib/db/queries/issues";
import { scene, sceneCard } from "@/lib/db/schema";
import { consistencyService } from "@/lib/services/analysis/consistency-service";

export type ScenePacingData = {
	sceneId: string;
	title: string;
	sequence: number;
	tension: number; // 1-10
	pacing: number; // 1-10
	wordCount: number;
	chapterId: string;
};

const projectIdSchema = z.object({
	projectId: z.string().uuid(),
});

const resolveIssueSchema = z.object({
	projectId: z.string().uuid(),
	issueId: z.string().uuid(),
});

export const analyzeProjectPacingAction = createUserAction({
	input: projectIdSchema,
	handler: async ({ input: { projectId } }) => {
		// Fetch scenes and their cards
		// Using a left join to get all scenes even if they don't have a card
		const scenesData = await db
			.select({
				id: scene.id,
				title: scene.title,
				sequence: scene.sequence,
				content: scene.content,
				chapterId: scene.chapterId,
				atmosphere: sceneCard.atmosphere,
				emotionalBeats: sceneCard.emotionalBeats,
				purpose: sceneCard.purpose,
			})
			.from(scene)
			.leftJoin(sceneCard, eq(scene.id, sceneCard.sceneId))
			.where(eq(scene.projectId, projectId))
			.orderBy(scene.sequence);

		const pacingData: ScenePacingData[] = scenesData.map(
			(s: {
				id: string;
				title: string;
				sequence: number;
				content: string | null;
				chapterId: string;
				atmosphere: string | null;
				emotionalBeats: unknown | null;
				purpose: string | null;
			}) => {
				const wordCount = s.content
					? s.content.trim().split(/\s+/).length
					: s.purpose
						? s.purpose.split(/\s+/).length * 10
						: 0; // Estimate if content missing

				// 1. Calculate Tension (1-10)
				let tension = 3; // Base tension

				// Boost from atmosphere keywords
				if (s.atmosphere) {
					const highTensionWords = [
						"tense",
						"urgent",
						"dark",
						"threat",
						"danger",
						"suspense",
						"fear",
						"battle",
						"conflict",
						"crisis",
					];
					const lowTensionWords = [
						"calm",
						"peaceful",
						"relaxed",
						"quiet",
						"safe",
						"joy",
						"happy",
						"peace",
					];

					const atmosphereLower = s.atmosphere.toLowerCase();
					if (highTensionWords.some((w) => atmosphereLower.includes(w)))
						tension += 3;
					if (lowTensionWords.some((w) => atmosphereLower.includes(w)))
						tension -= 1;
				}

				// Boost from emotional beats count
				if (s.emotionalBeats && Array.isArray(s.emotionalBeats)) {
					tension += Math.min(3, s.emotionalBeats.length * 0.5);
				}

				// 2. Calculate Pacing (1-10)
				let pacing = 5; // Base pacing

				// Short scenes are often faster
				if (wordCount > 0) {
					if (wordCount < 500) pacing += 2;
					else if (wordCount > 2000) pacing -= 2;
				}

				// Dialogue/Description heuristic
				if (s.content) {
					const paragraphs = s.content
						.split("\n")
						.filter((p: string) => p.trim());
					const avgParaLength = wordCount / (paragraphs.length || 1);
					if (avgParaLength < 20) pacing += 2; // Dialogue heavy
					if (avgParaLength > 80) pacing -= 2; // Description heavy
				}

				return {
					sceneId: s.id,
					title: s.title,
					sequence: s.sequence,
					tension: Math.max(1, Math.min(10, tension)),
					pacing: Math.max(1, Math.min(10, pacing)),
					wordCount,
					chapterId: s.chapterId,
				};
			},
		);

		return pacingData;
	},
});

export const analyzeProjectAction = createUserAction({
	input: projectIdSchema,
	handler: async ({ input: { projectId } }) => {
		const issues = await consistencyService.analyzeProject(projectId);
		return { count: issues.length };
	},
});

export const getProjectIssuesAction = createUserAction({
	input: projectIdSchema,
	handler: async ({ input: { projectId } }) => {
		const issues = await getIssuesForProject(projectId);
		return issues;
	},
});

export const resolveIssueAction = createUserAction({
	input: resolveIssueSchema,
	handler: async ({ input: { projectId, issueId } }) => {
		await resolveIssue(projectId, issueId);
		return { success: true };
	},
});
