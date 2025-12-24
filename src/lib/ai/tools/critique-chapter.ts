import { tool } from "ai";
import { z } from "zod";
import { aiService } from "@/lib/services/ai-service";

export const critiqueChapter = () =>
	tool({
		description: "Provides a critique of a chapter's pacing, tone, and quality.",
		inputSchema: z.object({
			chapterId: z.string().describe("The ID of the chapter."),
		}),
		execute: async (args: any) => {
			return await aiService.critiqueChapter(args.chapterId);
		},
	});
