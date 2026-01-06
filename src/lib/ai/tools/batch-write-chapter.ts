import { tool } from "ai";
import { z } from "zod";
import { writingService } from "@/lib/services/ai/writing-service";

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
			return await writingService.batchWriteChapter(
				args.chapterId,
				args.instructions,
			);
		},
	});
