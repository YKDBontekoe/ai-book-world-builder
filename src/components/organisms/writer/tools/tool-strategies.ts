import {
	analyzeConsistencyAction,
	batchWriteChapterAction,
	critiqueChapterAction,
	expandSceneAction,
	generateLoreAction,
	rewriteSceneAction,
	searchProjectAction,
} from "@/app/actions/ai-operations";
import type { ChapterWithScenes } from "@/lib/types";
import type { Project } from "@/lib/db/schema/projects";
import { toast } from "sonner";

export type ToolType =
	| "write"
	| "rewrite"
	| "expand"
	| "critique"
	| "consistency"
	| "lore"
	| "search";

export interface ToolContext {
	project: Project;
	structure: ChapterWithScenes[];
	activeChapterId: string | null;
	activeSceneId: string | null;
}

export interface ToolStrategy {
	execute(
		context: ToolContext,
		input: string,
	): Promise<{ success: boolean; result?: string }>;
}

export class WriteStrategy implements ToolStrategy {
	async execute(context: ToolContext, input: string) {
		if (!context.activeChapterId) {
			toast.error("No active chapter selected.");
			return { success: false };
		}
		const res = await batchWriteChapterAction(context.activeChapterId, input);
		if (res.success && 'writtenCount' in res) {
			toast.success(`Generated content for ${res.writtenCount} scenes.`);
			return { success: true };
		}
		if ('error' in res) toast.error(res.error);
		return { success: false };
	}
}

export class RewriteStrategy implements ToolStrategy {
	async execute(context: ToolContext, input: string) {
		if (!context.activeSceneId) {
			toast.error("No active scene selected.");
			return { success: false };
		}
		const res = await rewriteSceneAction(context.activeSceneId, input);
		if ('text' in res) {
			return { success: true, result: res.text };
		}
		if ('error' in res) toast.error(res.error);
		return { success: false };
	}
}

export class ExpandStrategy implements ToolStrategy {
	async execute(context: ToolContext, input: string) {
		if (!context.activeSceneId) {
			toast.error("No active scene selected.");
			return { success: false };
		}
		const res = await expandSceneAction(context.activeSceneId, input);
		if ('text' in res) {
			return { success: true, result: res.text };
		}
		if ('error' in res) toast.error(res.error);
		return { success: false };
	}
}

export class CritiqueStrategy implements ToolStrategy {
	async execute(context: ToolContext, _input: string) {
		if (!context.activeChapterId) {
			toast.error("No active chapter selected.");
			return { success: false };
		}
		const res = await critiqueChapterAction(context.activeChapterId);
		if (res.success && 'data' in res) {
			return { success: true, result: JSON.stringify(res.data, null, 2) };
		}
		if ('error' in res) toast.error(res.error);
		return { success: false };
	}
}

export class ConsistencyStrategy implements ToolStrategy {
	async execute(context: ToolContext, _input: string) {
		if (!context.activeChapterId) {
			toast.error("No active chapter selected.");
			return { success: false };
		}
		const res = await analyzeConsistencyAction(context.activeChapterId);
		if (res.success && 'data' in res) {
			return { success: true, result: JSON.stringify(res.data, null, 2) };
		}
		if ('error' in res) toast.error(res.error);
		return { success: false };
	}
}

export class LoreStrategy implements ToolStrategy {
	async execute(context: ToolContext, input: string) {
		const res = await generateLoreAction(context.project.id, input, "lore");
		if (res.success && 'entity' in res && res.entity) {
			toast.success(`Created entity: ${res.entity.name}`);
			return { success: true };
		}
		if ('error' in res) toast.error(res.error);
		return { success: false };
	}
}

export class SearchStrategy implements ToolStrategy {
	async execute(context: ToolContext, input: string) {
		const res = await searchProjectAction(context.project.id, input);
		if (res.success && 'answer' in res) {
			return { success: true, result: res.answer || undefined };
		}
		if ('error' in res) toast.error(res.error);
		return { success: false };
	}
}

export const toolStrategies: Record<ToolType, ToolStrategy> = {
	write: new WriteStrategy(),
	rewrite: new RewriteStrategy(),
	expand: new ExpandStrategy(),
	critique: new CritiqueStrategy(),
	consistency: new ConsistencyStrategy(),
	lore: new LoreStrategy(),
	search: new SearchStrategy(),
};
