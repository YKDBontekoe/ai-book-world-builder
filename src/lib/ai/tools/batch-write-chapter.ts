import { tool } from "ai";
import { z } from "zod";
import { writingService } from "@/lib/services/ai/writing-service";

export const batchWriteChapter = () =>
	tool({
		description:
			"Automatically writes or continues multiple scenes in a chapter.",
		inputSchema: z.object({
			chapterId: z.string().describe("The Chapter ID."),
			instructions: z
				.string()
				.optional()
				.describe("Optional high-level instructions."),
		}),
		execute: async (args: any) => {
			return await writingService.batchWriteChapter(
				args.chapterId,
				args.instructions,
			);
		},
	});
