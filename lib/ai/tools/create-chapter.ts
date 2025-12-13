import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { db, getVolumePlanById } from "@/lib/db/queries";
import { chapter } from "@/lib/db/schema";

export const createChapter = ({
  session,
  projectId,
  dataStream,
}: {
  session: Session | null;
  projectId?: string;
  dataStream?: any;
}) =>
  tool({
    description:
      "Create a new chapter within a volume. Use this when the user wants to add a chapter to their book structure.",
    inputSchema: z.object({
      title: z.string().describe("The title of the chapter."),
      notes: z
        .string()
        .optional()
        .describe("Optional notes or summary about the chapter."),
      sequence: z
        .number()
        .int()
        .positive()
        .describe("The sequence/order number of the chapter in the volume."),
      volumeId: z
        .string()
        .describe("The ID of the volume this chapter belongs to."),
      status: z
        .enum(["planned", "drafted", "revised", "final"])
        .optional()
        .describe("The status of the chapter. Defaults to 'planned'."),
    }),
    execute: async (args) => {
      const { title, notes, sequence, volumeId, status } = args;

      if (!session?.user) {
        return { error: "Authentication required to create a chapter." };
      }

      if (dataStream) {
        dataStream.write({
          type: "tool-log",
          message: "Verifying volume...",
          tool: "createChapter",
        });
      }

      try {
        // Verify the volume exists and get its project/outline info
        const volumePlan = await getVolumePlanById({ id: volumeId });

        if (!volumePlan) {
          return {
            error: `Volume with ID '${volumeId}' not found. Please create a volume first.`,
          };
        }

        // Check if a chapter with this sequence already exists
        const existingChapter = volumePlan.chapters.find(
          (ch) => ch.sequence === sequence
        );

        if (existingChapter) {
          return {
            error: `A chapter with sequence ${sequence} already exists in this volume. Please use a different sequence number.`,
          };
        }

        if (dataStream) {
          dataStream.write({
            type: "tool-log",
            message: `Creating chapter '${title}'...`,
            tool: "createChapter",
          });
        }

        // Create the chapter
        const [createdChapter] = await db
          .insert(chapter)
          .values({
            title,
            notes: notes ?? null,
            sequence,
            volumeId,
            outlineId: volumePlan.outlineId,
            projectId: volumePlan.projectId,
            status: status ?? "planned",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return {
          message: `Chapter '${title}' created successfully at position ${sequence}.`,
          chapter: {
            ...createdChapter,
            createdAt: createdChapter.createdAt.toISOString(),
            updatedAt: createdChapter.updatedAt.toISOString(),
          },
        };
      } catch (error) {
        return {
          error: `Failed to create chapter: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });
