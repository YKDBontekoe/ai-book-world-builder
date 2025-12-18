import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { createProject as createProjectMutation } from "@/lib/db/queries";

const inputSchema = z.object({
  name: z.string().min(2).describe("The name of the project."),
  description: z
    .string()
    .optional()
    .describe("A brief description of the project."),
  visibility: z
    .enum(["private", "public"])
    .default("private")
    .describe("Visibility of the project."),
});

export const createProject = ({ session }: { session: Session | null }) =>
  tool({
    description: "Create a new project (story/book world) for the user.",
    inputSchema,
    execute: async (args: z.infer<typeof inputSchema>) => {
      const { name, description, visibility } = args;

      if (!session?.user?.id) {
        return { error: "User must be logged in to create a project." };
      }

      try {
        const project = await createProjectMutation({
          name,
          description,
          visibility,
          userId: session.user.id,
        });

        return {
          message: `Project '${name}' created successfully.`,
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
            visibility: project.visibility,
          },
        };
      } catch (error) {
        return {
          error: `Failed to create project: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });
