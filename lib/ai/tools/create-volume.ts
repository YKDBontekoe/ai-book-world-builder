import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { createVolumePlan } from "@/lib/db/queries";

export const createVolume = ({
  session,
  projectId,
}: {
  session: Session | null;
  projectId?: string;
}) =>
  tool({
    description:
      "Create a volume (book) with chapters based on an outline. Volumes organize chapters into a structured book format.",
    inputSchema: z.object({
      title: z.string().describe("The title of the volume/book."),
      summary: z
        .string()
        .optional()
        .describe("A brief summary of what this volume covers."),
      outlineId: z
        .string()
        .describe("The ID of the outline this volume is based on."),
      projectId: z.string().describe("The ID of the project/world."),
      chapters: z
        .array(
          z.object({
            title: z.string().describe("The chapter title."),
            notes: z
              .string()
              .optional()
              .describe("Optional notes about the chapter."),
            sequence: z
              .number()
              .int()
              .positive()
              .describe("The order of this chapter in the volume."),
            status: z
              .enum(["planned", "drafted", "revised", "final"])
              .optional()
              .describe("The status of the chapter. Defaults to 'planned'."),
          })
        )
        .describe("An array of chapters to create in this volume."),
    }),
    execute: async (args) => {
      const {
        title,
        summary,
        outlineId,
        projectId: projectIdInput,
        chapters,
      } = args;
      const finalProjectId = projectIdInput || projectId;

      if (!session?.user) {
        return { error: "Authentication required to create a volume." };
      }

      if (!finalProjectId) {
        return { error: "Project ID is required to create a volume." };
      }

      if (!outlineId) {
        return {
          error:
            "Outline ID is required to create a volume. Create an outline first.",
        };
      }

      if (!chapters || chapters.length === 0) {
        return {
          error:
            "At least one chapter is required to create a volume. Provide a chapters array.",
        };
      }

      try {
        const volumePlan = await createVolumePlan({
          projectId: finalProjectId,
          outlineId,
          title,
          summary,
          chapters,
        });

        return {
          message: `Volume '${title}' created successfully with ${volumePlan.chapters.length} chapters.`,
          volume: {
            id: volumePlan.id,
            title: volumePlan.title,
            summary: volumePlan.summary,
            outlineId: volumePlan.outlineId,
            projectId: volumePlan.projectId,
            createdAt: volumePlan.createdAt.toISOString(),
            updatedAt: volumePlan.updatedAt.toISOString(),
            chapters: volumePlan.chapters.map((ch) => ({
              id: ch.id,
              title: ch.title,
              sequence: ch.sequence,
              status: ch.status,
              notes: ch.notes,
            })),
          },
        };
      } catch (error) {
        return {
          error: `Failed to create volume: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });
