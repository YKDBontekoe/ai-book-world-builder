import { toast } from "sonner";
import {
	analyzeConsistencyAction,
	batchWriteChapterAction,
	critiqueChapterAction,
	expandSceneAction,
	generateLoreAction,
	rewriteSceneAction,
	searchProjectAction,
} from "@/app/actions/ai-operations";
import type { Project } from "@/lib/db/schema/projects";
import type { ChapterWithScenes } from "@/lib/types";

export type ToolType =
	| "write"
	| "rewrite"
	| "expand"
	| "critique"
	| "consistency"
	| "lore"
	| "search"
	| "export";

export interface ToolContext {
	project: Project;
	structure: ChapterWithScenes[];
	activeChapterId: string | null;
	activeSceneId: string | null;
	sceneContent?: string | null;
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

		const toastId = toast.loading("Generating scenes...", {
			description: "This may take a few moments",
		});

		try {
			const res = await batchWriteChapterAction(context.activeChapterId, input);
			if (res.success && "writtenCount" in res) {
				toast.success(`Generated content for ${res.writtenCount} scenes.`, {
					id: toastId,
					duration: 5000,
				});
				// Refresh the structure to show new content
				window.location.reload();
				return { success: true };
			}
			if ("error" in res) {
				toast.error(res.error || "Generation failed", { id: toastId });
			}
			return { success: false };
		} catch (_error) {
			toast.error("An error occurred during generation", { id: toastId });
			return { success: false };
		}
	}
}

export class RewriteStrategy implements ToolStrategy {
	async execute(context: ToolContext, input: string) {
		if (!context.activeSceneId) {
			toast.error("No active scene selected.");
			return { success: false };
		}

		const toastId = toast.loading("Rewriting scene...", {
			description: "Generating improved version",
		});

		try {
			const res = await rewriteSceneAction(context.activeSceneId, input);
			if ("text" in res) {
				toast.success("Scene rewritten successfully", { id: toastId });
				return { success: true, result: res.text };
			}
			if ("error" in res) {
				toast.error(res.error || "Rewrite failed", { id: toastId });
			}
			return { success: false };
		} catch (_error) {
			toast.error("An error occurred during rewrite", { id: toastId });
			return { success: false };
		}
	}
}

export class ExpandStrategy implements ToolStrategy {
	async execute(context: ToolContext, input: string) {
		if (!context.activeSceneId) {
			toast.error("No active scene selected.");
			return { success: false };
		}

		const toastId = toast.loading("Expanding scene...", {
			description: "Adding details and depth",
		});

		try {
			const res = await expandSceneAction(context.activeSceneId, input);
			if ("text" in res) {
				toast.success("Scene expanded successfully", { id: toastId });
				return { success: true, result: res.text };
			}
			if ("error" in res) {
				toast.error(res.error || "Expansion failed", { id: toastId });
			}
			return { success: false };
		} catch (_error) {
			toast.error("An error occurred during expansion", { id: toastId });
			return { success: false };
		}
	}
}

export class CritiqueStrategy implements ToolStrategy {
	async execute(context: ToolContext, _input: string) {
		if (!context.activeChapterId) {
			toast.error("No active chapter selected.");
			return { success: false };
		}

		const toastId = toast.loading("Analyzing chapter...", {
			description: "Reviewing structure and content",
		});

		try {
			const res = await critiqueChapterAction(context.activeChapterId);
			if (res.success && "data" in res) {
				toast.success("Analysis complete", { id: toastId });
				return { success: true, result: JSON.stringify(res.data, null, 2) };
			}
			if ("error" in res) {
				toast.error(res.error || "Analysis failed", { id: toastId });
			}
			return { success: false };
		} catch (_error) {
			toast.error("An error occurred during analysis", { id: toastId });
			return { success: false };
		}
	}
}

export class ConsistencyStrategy implements ToolStrategy {
	async execute(context: ToolContext, _input: string) {
		if (!context.activeChapterId) {
			toast.error("No active chapter selected.");
			return { success: false };
		}

		const toastId = toast.loading("Checking consistency...", {
			description: "Analyzing characters and world continuity",
		});

		try {
			const res = await analyzeConsistencyAction(context.activeChapterId);
			if (res.success && "data" in res) {
				toast.success("Consistency check complete", { id: toastId });
				return { success: true, result: JSON.stringify(res.data, null, 2) };
			}
			if ("error" in res) {
				toast.error(res.error || "Consistency check failed", { id: toastId });
			}
			return { success: false };
		} catch (_error) {
			toast.error("An error occurred during consistency check", {
				id: toastId,
			});
			return { success: false };
		}
	}
}

export class LoreStrategy implements ToolStrategy {
	async execute(context: ToolContext, input: string) {
		const toastId = toast.loading("Generating lore...", {
			description: "Creating new entity",
		});

		try {
			const res = await generateLoreAction(context.project.id, input, "lore");
			if (res.success && "entity" in res && res.entity) {
				toast.success(`Created entity: ${res.entity.name}`, { id: toastId });
				return { success: true };
			}
			if ("error" in res) {
				toast.error(res.error || "Failed to generate lore", { id: toastId });
			}
			return { success: false };
		} catch (_error) {
			toast.error("An error occurred during lore generation", { id: toastId });
			return { success: false };
		}
	}
}

export class SearchStrategy implements ToolStrategy {
	async execute(context: ToolContext, input: string) {
		const res = await searchProjectAction(context.project.id, input);
		if (res.success && "answer" in res) {
			return { success: true, result: res.answer || undefined };
		}
		if ("error" in res) toast.error(res.error);
		return { success: false };
	}
}

export class ExportStrategy implements ToolStrategy {
	async execute(context: ToolContext, _input: string) {
		if (!context.sceneContent) {
			toast.error("No content to export.");
			return { success: false };
		}

		try {
			const blob = new Blob([context.sceneContent], {
				type: "text/markdown;charset=utf-8",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			// Use activeSceneId or timestamp for filename
			const timestamp = new Date().toISOString().slice(0, 10);
			a.download = `scene-${context.activeSceneId || "export"}-${timestamp}.md`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast.success("Scene exported successfully");
			return { success: true };
		} catch (error) {
			console.error("Export failed:", error);
			toast.error("Failed to export content");
			return { success: false };
		}
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
	export: new ExportStrategy(),
};
