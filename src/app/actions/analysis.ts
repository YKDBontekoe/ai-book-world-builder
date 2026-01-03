"use server";

import { eq } from "drizzle-orm";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { db } from "@/lib/db/drizzle";
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

export async function analyzeProjectPacingAction(
	projectId: string,
): Promise<{ success: boolean; data?: ScenePacingData[]; error?: string }> {
	try {
		await ensureProjectAccess(projectId, false);

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

		const pacingData: ScenePacingData[] = scenesData.map((s) => {
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
				];

				const atmosphereLower = s.atmosphere.toLowerCase();
				if (highTensionWords.some((w) => atmosphereLower.includes(w)))
					tension += 3;
				if (lowTensionWords.some((w) => atmosphereLower.includes(w)))
					tension -= 1;
			}

			// Boost from emotional beats count (more beats = more emotional shift = potential tension)
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

			// Heuristic: If content has many short paragraphs (dialogue), it's faster
			if (s.content) {
				const paragraphs = s.content.split("\n").filter((p) => p.trim());
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
		});

		return { success: true, data: pacingData };
	} catch (error) {
		console.error("Failed to analyze pacing:", error);
		return { success: false, error: "Failed to analyze pacing" };
	}
}

export async function analyzeProjectAction(projectId: string) {
	try {
		await ensureProjectAccess(projectId, true); // read-write check
		const issues = await consistencyService.analyzeProject(projectId);
		return { success: true, count: issues.length };
	} catch (error) {
		console.error("Analysis failed:", error);
		return { success: false, error: "Failed to analyze project" };
	}
}

export async function getProjectIssuesAction(projectId: string) {
	try {
		await ensureProjectAccess(projectId, false); // read-only check
		const issues = await getIssuesForProject(projectId);
		return { success: true, issues };
	} catch (error) {
		console.error("Failed to fetch issues:", error);
		return { success: false, error: "Failed to fetch issues" };
	}
}

export async function resolveIssueAction(projectId: string, issueId: string) {
	try {
		await ensureProjectAccess(projectId, true);
		await resolveIssue(projectId, issueId);
		return { success: true };
	} catch (error) {
		console.error("Failed to resolve issue:", error);
		return { success: false, error: "Failed to resolve issue" };
	}
}
