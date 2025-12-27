import "server-only";

import { analysisService } from "@/lib/services/ai/analysis-service";
import { loreService } from "@/lib/services/ai/lore-service";
import { writingService } from "@/lib/services/ai/writing-service";

/**
 * AI Service Facade
 *
 * Preserved for backward compatibility. Delegates to specific services.
 * @deprecated Use specific services (writingService, analysisService, loreService) instead.
 */
export class AIService {
	async batchWriteChapter(chapterId: string, instructions?: string) {
		return writingService.batchWriteChapter(chapterId, instructions);
	}

	async rewriteScene(sceneId: string, instructions: string) {
		return writingService.rewriteScene(sceneId, instructions);
	}

	async expandScene(sceneId: string, notes: string) {
		return writingService.expandScene(sceneId, notes);
	}

	async critiqueChapter(chapterId: string) {
		return analysisService.critiqueChapter(chapterId);
	}

	async analyzeConsistency(chapterId: string) {
		return analysisService.analyzeConsistency(chapterId);
	}

	async generateLore(
		projectId: string,
		prompt: string,
		category: string = "lore",
	) {
		return loreService.generateLore(projectId, prompt, category);
	}

	async searchProject(projectId: string, query: string) {
		return loreService.searchProject(projectId, query);
	}
}

export const aiService = new AIService();
