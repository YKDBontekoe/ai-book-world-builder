import { tool } from "ai";
import { z } from "zod";
import { analysisService } from "@/lib/services/ai/analysis-service";

export const critiqueChapter = () =>
	tool({
		description:
			"Provides a critique of a chapter's pacing, tone, and quality.",
		inputSchema: z.object({
			chapterId: z.string().describe("The ID of the chapter."),
		}),
		execute: async (args: any) => {
			return await analysisService.critiqueChapter(args.chapterId);
		},
	});
