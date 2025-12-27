import {
	batchWriteChapterAction,
	critiqueChapterAction,
	expandSceneAction,
	generateLoreAction,
	rewriteSceneAction,
	searchProjectAction,
	analyzeWritingQuality,
    analyzeChapterPlotAction,
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
	| "search"
	| "coach"
	| "voice";

export interface ToolContext {
	project: Project;
	structure: ChapterWithScenes[];
	activeChapterId: string | null;
	activeSceneId: string | null;
	content?: string | null;
}

export interface ToolStrategy {
	execute(
		context: ToolContext,
		input: string,
	): Promise<{ success: boolean; result?: string }>;
}
// ... (skip unchanged classes)
export class CoachStrategy implements ToolStrategy {
	async execute(context: ToolContext, _input: string) {
		if (!context.content) {
			toast.error("No content to analyze.");
			return { success: false };
		}

		const toastId = toast.loading("Analyzing writing quality...", {
			description: "Checking style, pacing, and show vs tell",
		});

		try {
			const res = await analyzeWritingQuality(context.content);

			if (
				res.success &&
				res.analysis &&
				typeof res.analysis.overallScore === "number" &&
				Array.isArray(res.analysis.issues) &&
				Array.isArray(res.analysis.suggestions)
			) {
				toast.success("Analysis complete", { id: toastId });
				const { overallScore, issues, suggestions } = res.analysis;

				const report = [
					`## Writing Coach Report (Score: ${overallScore}/100)`,
					"### Issues Detected",
					...issues
						.slice(0, 5)
						.map(
							(i) =>
								`- **${i.type}**: "${i.text.substring(
									0,
									50,
								)}..." — ${i.suggestion}`,
						),
					"### Suggestions",
					...suggestions
						.slice(0, 3)
						.map((s) => `- **${s.title}**: ${s.description}`),
				].join("\n");

				return { success: true, result: report };
			}
			toast.error(res.error || "Invalid analysis data received", {
				id: toastId,
			});
			return { success: false };
		} catch (error) {
			toast.error("An error occurred during analysis", { id: toastId });
			return { success: false };
		}
	}
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
			if (res.success && 'writtenCount' in res) {
				toast.success(`Generated content for ${res.writtenCount} scenes.`, {
					id: toastId,
					duration: 5000,
				});
				// Refresh the structure to show new content
				window.location.reload();
				return { success: true };
			}
			if ('error' in res) {
				toast.error(res.error || "Generation failed", { id: toastId });
			}
			return { success: false };
		} catch (error) {
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
			if ('text' in res) {
				toast.success("Scene rewritten successfully", { id: toastId });
				return { success: true, result: res.text };
			}
			if ('error' in res) {
				toast.error(res.error || "Rewrite failed", { id: toastId });
			}
			return { success: false };
		} catch (error) {
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
			if ('text' in res) {
				toast.success("Scene expanded successfully", { id: toastId });
				return { success: true, result: res.text };
			}
			if ('error' in res) {
				toast.error(res.error || "Expansion failed", { id: toastId });
			}
			return { success: false };
		} catch (error) {
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
			if (res.success && 'data' in res) {
				toast.success("Analysis complete", { id: toastId });
				return { success: true, result: JSON.stringify(res.data, null, 2) };
			}
			if ('error' in res) {
				toast.error(res.error || "Analysis failed", { id: toastId });
			}
			return { success: false };
		} catch (error) {
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
			description: "Analyzing plot holes, timeline, and motivations",
		});
		
		try {
			const res = await analyzeChapterPlotAction(context.activeChapterId);
			if (res.success && res.analysis) {
				toast.success("Analysis complete", { id: toastId });
                
                const { overallScore, plotHoles, recommendations, timelineConflicts } = res.analysis;
                
                const reportParts = [
                    `## Consistency Analysis (Score: ${overallScore}/100)`,
                    
                    `### 💡 Key Recommendations`,
                    ...recommendations.map(r => `- ${r}`),
                ];

                if (plotHoles.length > 0) {
                    reportParts.push(`### 🕳️ Detected Plot Holes`);
                    plotHoles.slice(0, 5).forEach(h => {
                        reportParts.push(`#### ${h.title} (${h.type})`);
                        reportParts.push(`${h.description}`);
                        reportParts.push(`> **Fix**: ${h.suggestion}`);
                    });
                }

                if (timelineConflicts.length > 0) {
                    reportParts.push(`### ⏳ Timeline Conflicts`);
                    timelineConflicts.slice(0, 3).forEach(t => {
                        reportParts.push(`- **${t.conflictReason}**: ${t.description}`);
                    });
                }

                if (plotHoles.length === 0 && timelineConflicts.length === 0) {
                    reportParts.push(`No significant issues detected.`);
                }

				return { success: true, result: reportParts.join('\n\n') };
			}
			if ('error' in res) {
				toast.error(res.error || "Consistency check failed", { id: toastId });
			}
			return { success: false };
		} catch (error) {
			toast.error("An error occurred during consistency check", { id: toastId });
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
			if (res.success && 'entity' in res && res.entity) {
				toast.success(`Created entity: ${res.entity.name}`, { id: toastId });
				return { success: true };
			}
			if ('error' in res) {
				toast.error(res.error || "Failed to generate lore", { id: toastId });
			}
			return { success: false };
		} catch (error) {
			toast.error("An error occurred during lore generation", { id: toastId });
			return { success: false };
		}
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

export class VoiceStrategy implements ToolStrategy {
	async execute(_context: ToolContext, _input: string) {
		toast.info("Voice tool coming soon!");
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
	coach: new CoachStrategy(),
	voice: new VoiceStrategy(),
};
