import { type Tool, tool } from "ai";
import { z } from "zod";
import { storyService } from "@/lib/services/story-service";

const inputSchema = z.object({
	sceneId: z.string().describe("The Scene ID."),
	notes: z.string().describe("The rough notes or skeleton to expand."),
});

export const expandScene = (): Tool<
	z.infer<typeof inputSchema>,
	{ text: string }
> =>
	tool({
		description: "Expands a skeletal scene or notes into full prose.",
		inputSchema,
		execute: async (args: z.infer<typeof inputSchema>) => {
			return await storyService.expandScene(args.sceneId, args.notes);
		},
	});
