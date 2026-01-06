import { tool } from "ai";
import { z } from "zod";
import { writingService } from "@/lib/services/ai/writing-service";

export const rewriteScene = () =>
	tool({
		description: "Rewrites a specific scene based on instructions.",
		inputSchema: z.object({
			sceneId: z.string().describe("The ID of the scene."),
			instructions: z
				.string()
				.describe("How to rewrite the scene (e.g. 'Change POV')."),
		}),
		execute: async (args: any) => {
			return await writingService.rewriteScene(args.sceneId, args.instructions);
		},
	});
