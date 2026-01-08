import { type CoreTool, tool } from "ai";
import { z } from "zod";
import { writingService } from "@/lib/services/ai/writing-service";

const inputSchema = z.object({
	sceneId: z.string().describe("The Scene ID."),
	notes: z.string().describe("The rough notes or skeleton to expand."),
});

export const expandScene = (): CoreTool<
	z.infer<typeof inputSchema>,
	unknown
> =>
	tool({
		description: "Expands a skeletal scene or notes into full prose.",
		inputSchema,
		execute: async (args: z.infer<typeof inputSchema>) => {
			return await writingService.expandScene(args.sceneId, args.notes);
		},
	});
