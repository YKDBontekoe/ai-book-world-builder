import { tool } from "ai";
import { z } from "zod";
import { writingService } from "@/lib/services/ai/writing-service";

export const rewriteScene = () =>
	tool({
		description: "Rewrites a specific scene based on instructions.",
		inputSchema: z.object({
			sceneId: z.string().describe("The Scene ID."),
			instructions: z.string().describe("Instructions for rewriting."),
		}),
		execute: async (args: any) => {
			return await writingService.rewriteScene(args.sceneId, args.instructions);
		},
	});
