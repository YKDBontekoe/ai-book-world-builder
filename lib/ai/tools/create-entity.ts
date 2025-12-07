import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { createEntity as createEntityMutation } from "@/lib/db/queries";

export const createEntity = ({
  session,
  projectId,
}: {
  session: Session | null;
  projectId?: string;
}) =>
  tool({
    description:
      "Create a new entity (character, location, item, etc.) in the project.",
    inputSchema: z.object({
      name: z.string().describe("The name of the entity."),
      kind: z
        .enum([
          "character",
          "location",
          "item",
          "organization",
          "event",
          "other",
        ])
        .describe("The type/kind of the entity."),
      summary: z
        .string()
        .optional()
        .describe("A brief summary or description of the entity."),
      projectId: z
        .string()
        .optional()
        .describe(
          "The ID of the project to create the entity in. If not provided, it will infer from context or fail."
        ),
    }),
    execute: async (args: any) => {
      const { name, kind, summary, projectId: projectIdInput } = args;
      const finalProjectId = projectIdInput || projectId;
      // We need to get the projectId effectively.
      // In the chat loop, we might not always have it passed explicitly by the LLM unless we put it in the system prompt instructions to ALWAYS pass it.
      // However, the tool definition doesn't inherently know about the "current" chat's project unless we pass it.
      // A better approach in route.ts is to pass the projectId to the tool factory if it exists in the URL/context.

      // But wait, the route.ts has `projectId` from the request body. We can pass it into the tool factory.

      // For now, let's assume the caller of the tool factory will provide a projectId fallback if the model doesn't provides one, OR we rely on the model to provide it.
      // Actually, looking at `createDocument`, it takes `session` and `dataStream`.

      // Let's modify the signature to accept `projectId` from the closure if possible, or expect the model to pass it.
      // Given `projectId` is critical, let's depend on the model passing it for now, BUT we should probably inject it if we can.

      // Just mocking the DB call for now based on the import.

      if (!finalProjectId) {
        return { error: "Project ID is required to create an entity." };
      }

      try {
        const entity = await createEntityMutation({
          projectId: finalProjectId,
          name,
          kind,
          summary,
          // Start/End dates are optional in mutation, keeping simple for now
        });

        return {
          message: `Entity '${name}' created successfully.`,
          entity: {
            ...entity,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString(),
            startDate: entity.startDate?.toISOString() ?? null,
            endDate: entity.endDate?.toISOString() ?? null,
          },
        };
      } catch (error) {
        return {
          error: `Failed to create entity: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });
