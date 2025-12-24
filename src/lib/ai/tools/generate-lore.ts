import { tool } from "ai";
import { z } from "zod";
import { aiService } from "@/lib/services/ai-service";

export const generateLore = () =>
	tool({
		description: "Generates a new lore entity (character, location, etc.).",
		inputSchema: z.object({
			projectId: z.string().describe("The Project ID."),
			prompt: z.string().describe("Description of what to generate."),
			category: z
				.string()
				.optional()
				.default("lore")
				.describe("Category (character, location, etc.)."),
		}),
		execute: async (args: any) => {
			return await aiService.generateLore(
				args.projectId,
				args.prompt,
				args.category,
			);
		},
	});
