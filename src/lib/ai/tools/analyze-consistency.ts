import { tool } from "ai";
import { z } from "zod";
import { analysisService } from "@/lib/ai/services/analysis-service";

export const analyzeConsistency = () =>
	tool({
		description:
			"Analyzes a chapter for consistency errors (plot, character, setting); timeline analysis intentionally excluded.",
		inputSchema: z.object({
			chapterId: z.string().describe("The Chapter ID."),
		}),
		execute: async (args: { chapterId: string }) => {
			return await analysisService.analyzeConsistency(args.chapterId);
		},
	});
