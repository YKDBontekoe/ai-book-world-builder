import { tool } from "ai";
import { z } from "zod";
import { analysisService } from "@/lib/services/ai/analysis-service";

export const analyzeConsistency = () =>
	tool({
		description:
			"Analyzes a chapter for consistency errors (plot, character, setting).",
		inputSchema: z.object({
			chapterId: z.string().describe("The Chapter ID."),
		}),
		execute: async (args: any) => {
			return await analysisService.analyzeConsistency(args.chapterId);
		},
	});
