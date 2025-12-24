"use server";

import { aiService } from "@/lib/services/ai-service";

export async function batchWriteChapterAction(
	chapterId: string,
	instructions?: string,
) {
	try {
		return await aiService.batchWriteChapter(chapterId, instructions);
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function rewriteSceneAction(
	sceneId: string,
	instructions: string,
) {
	try {
		return await aiService.rewriteScene(sceneId, instructions);
	} catch (error) {
		return { error: (error as Error).message };
	}
}

export async function expandSceneAction(sceneId: string, notes: string) {
	try {
		return await aiService.expandScene(sceneId, notes);
	} catch (error) {
		return { error: (error as Error).message };
	}
}

export async function critiqueChapterAction(chapterId: string) {
	try {
		const result = await aiService.critiqueChapter(chapterId);
		return { success: true, data: result };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function analyzeConsistencyAction(chapterId: string) {
	try {
		const result = await aiService.analyzeConsistency(chapterId);
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
		const entity = await aiService.generateLore(projectId, prompt, category);
		return { success: true, entity };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function searchProjectAction(projectId: string, query: string) {
	try {
		const answer = await aiService.searchProject(projectId, query);
		return { success: true, answer };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}
