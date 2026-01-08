import { tool } from "ai";
import { z } from "zod";
import { analysisService } from "@/lib/services/ai/analysis-service";

export const critiqueChapter = () =>
	tool({
		description:
			"Critiques a chapter's content, providing feedback on pacing, tone, and strengths/weaknesses.",
		inputSchema: z.object({
			chapterId: z.string().describe("The Chapter ID."),
		}),
		execute: async (args: any) => {
			return await analysisService.critiqueChapter(args.chapterId);
		},
	});
