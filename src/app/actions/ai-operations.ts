"use server";

import { analysisService } from "@/lib/services/ai/analysis-service";
import { loreService } from "@/lib/services/ai/lore-service";
import { manuscriptService } from "@/lib/services/ai/manuscript-service";
import { writingService } from "@/lib/services/ai/writing-service";

export async function batchWriteChapterAction(
	chapterId: string,
	instructions?: string,
) {
	try {
		return await writingService.batchWriteChapter(chapterId, instructions);
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function rewriteSceneAction(
	sceneId: string,
	instructions: string,
) {
	try {
		return await writingService.rewriteScene(sceneId, instructions);
	} catch (error) {
		return { error: (error as Error).message };
	}
}

export async function expandSceneAction(sceneId: string, notes: string) {
	try {
		return await writingService.expandScene(sceneId, notes);
	} catch (error) {
		return { error: (error as Error).message };
	}
}

export async function critiqueChapterAction(chapterId: string) {
	try {
		const result = await analysisService.critiqueChapter(chapterId);
		return { success: true, data: result };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function analyzeConsistencyAction(chapterId: string) {
	try {
		const result = await analysisService.analyzeConsistency(chapterId);
		return { success: true, data: result };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function dialogueCoachAction(
	sceneId: string,
	focus?: string,
): Promise<{ success: boolean; report?: string; error?: string }> {
	try {
		const result = await analysisService.dialogueCoach(sceneId, focus);
		return { success: true, report: formatDialogueReport(result) };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function generateLoreAction(
	projectId: string,
	prompt: string,
	category: string,
) {
	try {
		const entity = await loreService.generateLore(projectId, prompt, category);
		return { success: true, entity };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function searchProjectAction(projectId: string, query: string) {
	try {
		const answer = await loreService.searchProject(projectId, query);
		return { success: true, answer };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function askManuscriptAction(
	projectId: string,
	question: string,
): Promise<{ success: boolean; response?: string; error?: string }> {
	try {
		const result = await manuscriptService.askManuscript(projectId, question);
		return { success: true, response: formatManuscriptAnswer(result) };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

function formatDialogueReport(
	report: Awaited<ReturnType<typeof analysisService.dialogueCoach>>,
): string {
	const voiceSections = report.voiceNotes
		.map(
			(voice) =>
				`- ${voice.character}\n  - ${voice.notes.join("\n  - ")}${
					voice.sampleRewrite
						? `\n  - Sample rewrite: ${voice.sampleRewrite}`
						: ""
				}`,
		)
		.join("\n");

	const quickFixes =
		report.quickFixes.length > 0
			? `Quick Fixes:\n- ${report.quickFixes.join("\n- ")}`
			: "Quick Fixes:\n- No quick fixes suggested.";

	return [
		`Overview: ${report.overview}`,
		"Voice Notes:",
		voiceSections || "- No distinct voices detected.",
		quickFixes,
	].join("\n\n");
}

function formatManuscriptAnswer(
	answer: Awaited<ReturnType<typeof manuscriptService.askManuscript>>,
): string {
	const sourceLines = answer.sources.map((source) => {
		const prefix = source.type === "scene" ? "Scene" : "Entity";
		return `- ${prefix}: ${source.title}\n  ${source.excerpt}`;
	});

	return [
		answer.answer,
		"",
		"Sources:",
		sourceLines.length > 0 ? sourceLines.join("\n") : "- No sources matched.",
	].join("\n");
}
