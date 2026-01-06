import { tool } from "ai";
import { z } from "zod";
import { analysisService } from "@/lib/services/ai/analysis-service";

export const analyzeConsistency = () =>
	tool({
		description:
			"Checks a chapter for plot holes, character inconsistencies, and timeline errors.",
		inputSchema: z.object({
			chapterId: z.string().describe("The ID of the chapter."),
		}),
		execute: async (args: any) => {
			return await analysisService.analyzeConsistency(args.chapterId);
		},
	});
