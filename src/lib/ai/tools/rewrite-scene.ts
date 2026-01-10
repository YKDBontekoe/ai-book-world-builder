import { type Tool, tool } from "ai";
import { z } from "zod";
import { storyService } from "@/lib/services/story-service";

const inputSchema = z.object({
	sceneId: z.string().describe("The Scene ID."),
	instructions: z.string().describe("Instructions for rewriting."),
});

export const rewriteScene = (): Tool<
	z.infer<typeof inputSchema>,
	{ text: string }
> =>
	tool({
		description: "Rewrites a specific scene based on instructions.",
		inputSchema,
		execute: async (args: z.infer<typeof inputSchema>) => {
			return await storyService.rewriteScene(args.sceneId, args.instructions);
		},
	});
