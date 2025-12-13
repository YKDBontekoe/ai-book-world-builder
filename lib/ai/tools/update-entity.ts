import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
  updateEntity as updateEntityMutation,
  getEntityWithDetails,
} from "@/lib/db/queries";

export const updateEntity = ({
  session,
  projectId,
}: {
  session: Session | null;
  projectId?: string;
}) =>
  tool({
    description: "Update an existing entity's details.",
    inputSchema: z.object({
      id: z.string().describe("The ID of the entity to update."),
      name: z.string().optional().describe("The new name of the entity."),
      kind: z
        .enum([
          "character",
          "location",
          "item",
          "organization",
          "event",
          "other",
        ])
        .optional()
        .describe("The new kind of the entity."),
      summary: z.string().optional().describe("The new summary."),
      startDate: z.string().optional().describe("Start date (YYYY-MM-DD)."),
      endDate: z.string().optional().describe("End date (YYYY-MM-DD)."),
    }),
    execute: async (args) => {
      const { id, name, kind, summary, startDate, endDate } = args;

      try {
        await updateEntityMutation({
          id,
          name,
          kind,
          summary,
          startDate,
          endDate,
        });

        const updatedEntity = await getEntityWithDetails({ id });

        if (!updatedEntity) {
            return { error: "Entity not found after update." };
        }

        return {
          message: `Entity '${updatedEntity.name}' updated successfully.`,
          entity: {
            ...updatedEntity,
            createdAt: updatedEntity.createdAt.toISOString(),
            updatedAt: updatedEntity.updatedAt.toISOString(),
            startDate: updatedEntity.startDate?.toISOString() ?? null,
            endDate: updatedEntity.endDate?.toISOString() ?? null,
            attributes: updatedEntity.attributes.map(attr => ({
                ...attr,
                createdAt: attr.createdAt.toISOString(),
                startDate: attr.startDate?.toISOString() ?? null,
                endDate: attr.endDate?.toISOString() ?? null,
            })),
            relationships: updatedEntity.relationships.map(rel => ({
                ...rel,
                createdAt: rel.createdAt.toISOString(),
                startDate: rel.startDate?.toISOString() ?? null,
                endDate: rel.endDate?.toISOString() ?? null,
            })),
          },
        };
      } catch (error) {
        return {
          error: `Failed to update entity: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });
