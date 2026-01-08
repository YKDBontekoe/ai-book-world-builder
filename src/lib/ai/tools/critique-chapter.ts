import { type Tool, tool } from "ai";
import { z } from "zod";
import { analysisService } from "@/lib/services/ai/analysis-service";

const inputSchema = z.object({
	chapterId: z.string().describe("The Chapter ID."),
});

export const critiqueChapter = (): Tool<
	z.infer<typeof inputSchema>,
	{
		strengths: string[];
		weaknesses: string[];
		pacing: string;
		tone: string;
		suggestions: string[];
	}
> =>
	tool({
		description:
			"Critiques a chapter's content, providing feedback on pacing, tone, and strengths/weaknesses.",
		inputSchema,
		execute: async (args: z.infer<typeof inputSchema>) => {
			return await analysisService.critiqueChapter(args.chapterId);
		},
	});
