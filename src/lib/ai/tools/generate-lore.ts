import { tool } from "ai";
import { z } from "zod";
import { loreService } from "@/lib/services/ai/lore-service";

export const generateLore = () =>
	tool({
		description: "Generates a new world-building entity (lore) from a prompt.",
		inputSchema: z.object({
			projectId: z.string().describe("The Project ID."),
			prompt: z.string().describe("Description of the entity to create."),
			category: z
				.string()
				.optional()
				.default("lore")
				.describe("Category (character, location, etc.)."),
		}),
		execute: async (args: any) => {
			return await loreService.generateLore(
				args.projectId,
				args.prompt,
				args.category,
			);
		},
	});
