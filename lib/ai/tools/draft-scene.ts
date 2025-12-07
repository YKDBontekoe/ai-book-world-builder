import { generateText, tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
  addTaskLogEntry,
  getBookGenerationForProject,
  getSceneCardForScene,
  getScenesForChapter,
  updateSceneContent,
} from "@/lib/db/queries";
import { getGatewayIdForRole } from "../model-routing";

export const draftScene = ({ session }: { session: Session | null }) =>
  tool({
    description:
      "The Writer. Drafts or rewrites the prose for a specific scene.",
    inputSchema: z.object({
      projectId: z.string().describe("The ID of the project"),
      chapterId: z.string().describe("The ID of the chapter"),
      sceneId: z.string().describe("The ID of the scene to draft"),
      instructions: z
        .string()
        .optional()
        .describe("Specific drafting instructions (e.g. 'Make it more tense')"),
    }),
    execute: async (args: any) => {
      const { projectId, chapterId, sceneId, instructions } = args;
      try {
        if (!projectId || !chapterId || !sceneId) {
          return { error: "Missing required parameters" };
        }
        if (!session?.user) return { error: "Authentication required." };

        const generation = await getBookGenerationForProject({ projectId });

        if (!generation) return { error: "Book generation not initialized." };

        const scenes = await getScenesForChapter({ chapterId });
        const currentScene = scenes.find((s) => s.id === sceneId);

        if (!currentScene) return { error: "Scene not found in chapter." };

        // Get Scene Card Data
        const sceneCard = await getSceneCardForScene({ sceneId });
        if (!sceneCard) return { error: "Scene card not found." };

        // Writer Model (Claude Sonnet 4.5)
        const writerModel = getGatewayIdForRole("writer");

        const { text: prose } = await generateText({
          model: writerModel as any,
          system: `You are The Writer. Your goal is to write compelling, high-quality prose.
        
        Write the scene based on the scene card and instructions.
        Output ONLY the story prose.
        `,
          prompt: `
        Scene Title: ${currentScene.title}
        Purpose: ${sceneCard.purpose}
        Setting: ${sceneCard.setting}
        Emotional Beats: ${sceneCard.emotionalBeats}
        
        Instructions: ${instructions || "Draft the scene."}
        `,
        });

        // Update Database
        await updateSceneContent({
          sceneId,
          content: prose,
          status: "drafted",
        });

        // Log Task
        await addTaskLogEntry({
          generationId: generation.id,
          entry: {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            type: "tool_result",
            modelId: writerModel,
            content: `Drafted scene: ${currentScene.title}`,
            metadata: { sceneId, wordCount: prose.split(" ").length },
          },
        });

        return {
          success: true,
          sceneId,
          wordCount: prose.split(" ").length,
          preview: prose.substring(0, 200) + "...",
        };
      } catch (error) {
        console.error("Draft scene failed:", error);
        return { error: "Drafting failed: " + (error as Error).message };
      }
    },
  });
