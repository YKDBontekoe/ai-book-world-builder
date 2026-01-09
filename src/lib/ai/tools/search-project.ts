import { tool } from "ai";
import { z } from "zod";
import { loreService } from "@/lib/services/ai/lore-service";

export const searchProject = () =>
	tool({
		description:
			"Searches the project content to answer a question or find a fact.",
		inputSchema: z.object({
			projectId: z.string().describe("The Project ID."),
			query: z.string().describe("The question or term to search for."),
		}),
		execute: async (args: any) => {
			return await loreService.searchProject(args.projectId, args.query);
		},
	});
