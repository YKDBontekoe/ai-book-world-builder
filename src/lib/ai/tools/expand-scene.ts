import { tool } from "ai";
import { z } from "zod";
import { writingService } from "@/lib/services/ai/writing-service";

export const expandScene = () =>
	tool({
		description: "Expands a skeletal scene or notes into full prose.",
		inputSchema: z.object({
			sceneId: z.string().describe("The Scene ID."),
			notes: z.string().describe("The rough notes or skeleton to expand."),
		}),
		execute: async (args: any) => {
			return await writingService.expandScene(args.sceneId, args.notes);
		},
	});
