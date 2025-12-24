import { tool } from "ai";
import { z } from "zod";
import { aiService } from "@/lib/services/ai-service";

export const batchWriteChapter = () =>
	tool({
		description: "Sequentially drafts or completes all scenes in a chapter.",
		inputSchema: z.object({
			chapterId: z.string().describe("The ID of the chapter to write."),
			instructions: z
				.string()
				.optional()
				.describe("Overall instructions for the chapter."),
		}),
		execute: async (args: any) => {
			return await aiService.batchWriteChapter(
				args.chapterId,
				args.instructions,
			);
		},
	});
