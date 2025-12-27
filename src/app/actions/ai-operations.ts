"use server";

import { analysisService } from "@/lib/services/ai/analysis-service";
import { loreService } from "@/lib/services/ai/lore-service";
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
