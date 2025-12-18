import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { createScene as createSceneMutation } from "@/lib/db/queries";

const inputSchema = z.object({
  chapterId: z.string().describe("The ID of the chapter this scene belongs to."),
  title: z.string().describe("The title of the scene."),
  sequence: z
    .number()
    .describe("The order/sequence of the scene in the chapter."),
  content: z.string().optional().describe("Initial content/draft of the scene."),
  status: z
    .enum(["planned", "drafted", "completed", "revised"])
    .optional()
    .describe("Status of the scene."),
  projectId: z
    .string()
    .optional()
    .describe("Project ID (optional if context is clear)."),
});

export const createScene = ({
  session,
  projectId,
}: {
  session: Session | null;
  projectId?: string;
}) =>
  tool({
    description: "Create a new scene in a chapter.",
    inputSchema,
    execute: async (args: z.infer<typeof inputSchema>) => {
      const {
        chapterId,
        title,
        sequence,
        content,
        status,
        projectId: projectIdInput,
      } = args;
      const finalProjectId = projectIdInput || projectId;

      if (!finalProjectId) {
        return { error: "Project ID is required to create a scene." };
      }

      try {
        const scene = await createSceneMutation({
          projectId: finalProjectId,
          chapterId,
          title,
          sequence,
          content,
          status,
        });

        return {
          message: `Scene '${title}' created successfully.`,
          scene: {
            ...scene,
            createdAt: scene.createdAt.toISOString(),
            updatedAt: scene.updatedAt.toISOString(),
          },
        };
      } catch (error) {
        return {
          error: `Failed to create scene: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });
