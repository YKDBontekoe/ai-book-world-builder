import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { createOutline as createOutlineMutation } from "@/lib/db/queries";

export const createOutline = ({
  session,
  projectId,
}: {
  session: Session | null;
  projectId?: string;
}) =>
  tool({
    description:
      "Create a story outline with narrative structure. Use this to help users plan their book's structure, including POV, tone, pacing, and key story beats.",
    inputSchema: z.object({
      title: z.string().describe("The title of the outline/story."),
      summary: z.string().optional().describe("A brief summary of the story."),
      pov: z
        .string()
        .describe(
          "Point of view (e.g., 'first-person', 'third-person limited', 'third-person omniscient')."
        ),
      tone: z
        .string()
        .describe(
          "The tone of the story (e.g., 'dark', 'humorous', 'dramatic', 'lighthearted')."
        ),
      pacing: z
        .string()
        .describe(
          "The pacing of the story (e.g., 'fast', 'slow', 'moderate', 'varied')."
        ),
      beats: z
        .array(z.string())
        .describe(
          "An array of key story beats or plot points (e.g., ['Opening hook', 'Inciting incident', 'Midpoint twist', 'Climax', 'Resolution'])."
        ),
      projectId: z.string().describe("The ID of the project/world."),
    }),
    execute: async (args) => {
      const {
        title,
        summary,
        pov,
        tone,
        pacing,
        beats,
        projectId: projectIdInput,
      } = args;
      const finalProjectId = projectIdInput || projectId;

      if (!session?.user) {
        return { error: "Authentication required to create an outline." };
      }

      if (!finalProjectId) {
        return { error: "Project ID is required to create an outline." };
      }

      try {
        const outline = await createOutlineMutation({
          projectId: finalProjectId,
          title,
          summary,
          pov,
          tone,
          pacing,
          beats,
        });

        return {
          message: `Outline '${title}' created successfully with ${beats.length} story beats.`,
          outline: {
            ...outline,
            createdAt: outline.createdAt.toISOString(),
            updatedAt: outline.updatedAt.toISOString(),
          },
        };
      } catch (error) {
        return {
          error: `Failed to create outline: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });
