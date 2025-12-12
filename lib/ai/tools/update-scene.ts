import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { updateScene as updateSceneMutation } from "@/lib/db/queries";

export const updateScene = ({
  session,
  projectId,
}: {
  session: Session | null;
  projectId?: string;
}) =>
  tool({
    description: "Update an existing scene.",
    inputSchema: z.object({
      id: z.string().describe("The ID of the scene to update."),
      title: z.string().optional().describe("New title."),
      sequence: z.number().optional().describe("New sequence number."),
      content: z.string().optional().describe("New content."),
      status: z.enum(["planned", "drafted", "completed", "revised"]).optional().describe("New status."),
    }),
    execute: async (args: any) => {
      const { id, title, sequence, content, status } = args;

      try {
        const scene = await updateSceneMutation({
          id,
          title,
          sequence,
          content,
          status,
        });

        return {
          message: `Scene '${scene.title}' updated successfully.`,
          scene: {
            ...scene,
            createdAt: scene.createdAt.toISOString(),
            updatedAt: scene.updatedAt.toISOString(),
          },
        };
      } catch (error) {
        return {
          error: `Failed to update scene: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });
