import { tool } from "ai";
import { z } from "zod";
import { aiService } from "@/lib/services/ai-service";

export const expandScene = () =>
	tool({
		description: "Expands skeletal notes or a rough draft into a full scene.",
		inputSchema: z.object({
			sceneId: z.string().describe("The ID of the scene."),
			notes: z.string().describe("The notes or skeleton to expand."),
		}),
		execute: async (args: any) => {
			return await aiService.expandScene(args.sceneId, args.notes);
		},
	});
