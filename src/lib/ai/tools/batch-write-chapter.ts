import { type Tool, tool } from "ai";
import { z } from "zod";
import { writingService } from "@/lib/services/ai/writing-service";

const inputSchema = z.object({
	chapterId: z.string().describe("The Chapter ID."),
	instructions: z
		.string()
		.optional()
		.describe("Optional high-level instructions."),
});

/**
 * Tool for batch writing multiple scenes in a chapter.
 *
 * @returns A tool that executes the batch writing process.
 */
export const batchWriteChapter = (): Tool<
	z.infer<typeof inputSchema>,
	{ success: boolean; writtenCount: number }
> =>
	tool({
		description:
			"Automatically writes or continues multiple scenes in a chapter.",
		inputSchema,
		execute: async (args: z.infer<typeof inputSchema>) => {
			return await writingService.batchWriteChapter(
				args.chapterId,
				args.instructions,
			);
		},
	});
