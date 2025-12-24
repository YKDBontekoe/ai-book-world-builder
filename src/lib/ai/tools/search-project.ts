import { tool } from "ai";
import { z } from "zod";
import { aiService } from "@/lib/services/ai-service";

export const searchProject = () =>
	tool({
		description:
			"Searches the project content to answer a question or find a fact.",
		inputSchema: z.object({
			projectId: z.string().describe("The Project ID."),
			query: z.string().describe("The question or term to search for."),
		}),
		execute: async (args: any) => {
			return await aiService.searchProject(args.projectId, args.query);
		},
	});
