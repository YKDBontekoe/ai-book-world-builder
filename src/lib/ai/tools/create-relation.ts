import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { createRelationship, getEntitiesForProject } from "@/lib/db/queries";

// Helper to fuzzy match or find entity by name
function findEntityIdByName(
  name: string,
  entities: { id: string; name: string }[]
): string | undefined {
  const lowerName = name.toLowerCase().trim();
  const exactMatch = entities.find((e) => e.name.toLowerCase() === lowerName);
  if (exactMatch) return exactMatch.id;

  // Minimal fuzzy fallback: check if one contains the other
  // This is risky but better than nothing for "Aragorn" matching "Aragorn II Elessar"
  const partialMatch = entities.find(
    (e) =>
      e.name.toLowerCase().includes(lowerName) ||
      lowerName.includes(e.name.toLowerCase())
  );

  return partialMatch?.id;
}

export const createRelation = ({
  session,
  projectId,
}: {
  session: Session | null;
  projectId?: string;
}) =>
  tool({
    description: "Create a relationship between two entities.",
    inputSchema: z.object({
      sourceName: z
        .string()
        .describe("The name of the source entity (e.g. 'Aragorn')."),
      targetName: z
        .string()
        .describe("The name of the target entity (e.g. 'Gandalf')."),
      type: z
        .string()
        .describe(
          "The type of relationship (e.g. 'friend', 'enemy', 'sibling', 'parent', 'ally')."
        ),
      description: z
        .string()
        .optional()
        .describe("Details about the relationship."),
      projectId: z.string().describe("The Project ID."),
    }),
    execute: async ({
      sourceName,
      targetName,
      type,
      description,
      projectId: projectIdInput,
    }: any) => {
      const finalProjectId = projectIdInput || projectId;
      if (!finalProjectId) {
        return { error: "Project ID is required." };
      }

      try {
        const entities = await getEntitiesForProject({
          projectId: finalProjectId,
        });

        const sourceId = findEntityIdByName(sourceName, entities);
        const targetId = findEntityIdByName(targetName, entities);

        if (!sourceId) {
          return {
            error: `Could not find entity with name '${sourceName}'. Please create it first.`,
          };
        }
        if (!targetId) {
          return {
            error: `Could not find entity with name '${targetName}'. Please create it first.`,
          };
        }

        if (sourceId === targetId) {
          return { error: "Cannot create a relationship to self." };
        }

        const relation = await createRelationship({
          projectId: finalProjectId,
          sourceEntityId: sourceId,
          targetEntityId: targetId,
          type,
          description,
        });

        return {
          message: `Relationship created: ${sourceName} is ${type} of ${targetName}.`,
          relation: {
            ...relation,
            createdAt: relation.createdAt.toISOString(),
            startDate: relation.startDate?.toISOString() ?? null,
            endDate: relation.endDate?.toISOString() ?? null,
          },
        };
      } catch (error) {
        return {
          error: `Failed to create relationship: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });
