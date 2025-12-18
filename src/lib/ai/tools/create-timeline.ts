import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { createEntity as createEntityMutation } from "@/lib/db/queries";

export const createTimeline = ({
  session,
  projectId,
}: {
  session: Session | null;
  projectId?: string;
}) =>
  tool({
    description:
      "Create a timeline event in the story world. Timeline events are special entities that represent significant moments in the story's history with start and optional end dates.",
    inputSchema: z.object({
      name: z
        .string()
        .describe("The name of the timeline event (e.g., 'The Great War')."),
      description: z
        .string()
        .optional()
        .describe("A description of what happened during this event."),
      startDate: z
        .string()
        .optional()
        .describe(
          "The start date of the event in ISO format (e.g., '2024-01-15') or a narrative date (e.g., 'Year 1000 of the Third Age')."
        ),
      endDate: z
        .string()
        .optional()
        .describe(
          "The end date of the event in ISO format or narrative date. Leave empty for ongoing or instantaneous events."
        ),
      projectId: z.string().describe("The ID of the project/world."),
    }),
    execute: async (args: any) => {
      const {
        name,
        description,
        startDate,
        endDate,
        projectId: projectIdInput,
      } = args;
      const finalProjectId = projectIdInput || projectId;

      if (!session?.user) {
        return { error: "Authentication required to create a timeline event." };
      }

      if (!finalProjectId) {
        return { error: "Project ID is required to create a timeline event." };
      }

      try {
        // Parse dates - try ISO format first, fallback to storing as-is for narrative dates
        let parsedStartDate: Date | undefined;
        let parsedEndDate: Date | undefined;

        if (startDate) {
          const attemptParse = new Date(startDate);
          if (!Number.isNaN(attemptParse.getTime())) {
            parsedStartDate = attemptParse;
          }
          // If parsing fails, we'll store the narrative date in the summary
        }

        if (endDate) {
          const attemptParse = new Date(endDate);
          if (!Number.isNaN(attemptParse.getTime())) {
            parsedEndDate = attemptParse;
          }
        }

        // Build summary that includes narrative dates if they couldn't be parsed
        let fullSummary = description || "";
        if (startDate && !parsedStartDate) {
          fullSummary = `Start: ${startDate}. ${fullSummary}`;
        }
        if (endDate && !parsedEndDate) {
          fullSummary = `${fullSummary} End: ${endDate}`;
        }

        const event = await createEntityMutation({
          projectId: finalProjectId,
          name,
          kind: "event",
          summary: fullSummary.trim() || undefined,
          startDate: parsedStartDate?.toISOString(),
          endDate: parsedEndDate?.toISOString(),
        });

        const dateInfo = parsedStartDate
          ? ` occurring ${parsedStartDate.toLocaleDateString()}`
          : startDate
            ? ` (${startDate})`
            : "";

        return {
          message: `Timeline event '${name}' created successfully${dateInfo}.`,
          event: {
            ...event,
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
            startDate: event.startDate?.toISOString() ?? null,
            endDate: event.endDate?.toISOString() ?? null,
          },
        };
      } catch (error) {
        return {
          error: `Failed to create timeline event: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });
