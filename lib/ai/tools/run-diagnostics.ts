import { generateObject, tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getFullProjectDataForGeneration } from "@/lib/book-generation";
import {
  addTaskLogEntry,
  getBookGenerationForProject,
  getScenesForChapter,
} from "@/lib/db/queries";
import { getGatewayIdForRole } from "../model-routing";

export const runDiagnostics = ({ session }: { session: Session | null }) =>
  tool({
    description:
      "The Checker. Runs logic checks and continuity diagnostics on a chapter.",
    inputSchema: z.object({
      projectId: z.string().describe("The ID of the project"),
      chapterId: z.string().describe("The ID of the chapter to diagnose"),
    }),
    execute: async (args) => {
      const { projectId, chapterId } = args;
      if (!session?.user) return { error: "Authentication required." };

      const projectData = await getFullProjectDataForGeneration({
        projectId,
        userId: session.user.id,
      });
      if (!projectData || !projectData.generation)
        return { error: "Generation not found." };

      const generation = projectData.generation;

      const scenes = await getScenesForChapter({ chapterId });
      // Concatenate scene content for analysis
      const chapterText = scenes
        .map(
          (s) =>
            `[Scene ${s.sequence}: ${s.title}]\n${s.content || "(No content)"}`
        )
        .join("\n\n");

      // Checker Model (DeepSeek Reasoner)
      const checkerModel = getGatewayIdForRole("checker");

      const { object: diagnostics } = await generateObject({
        model: checkerModel as any,
        schema: z.object({
          score: z.number().describe("Quality score 1-10"),
          issues: z.array(
            z.object({
              type: z.enum([
                "continuity",
                "logic",
                "pacing",
                "tone",
                "grammar",
              ]),
              severity: z.enum(["critical", "major", "minor"]),
              description: z.string(),
              location: z.string().describe("Scene or paragraph reference"),
              suggestion: z.string(),
            })
          ),
          analysis: z.string().describe("Overall analysis logic"),
        }),
        prompt: `
        You are The Logic Checker. Analyze Chapter ${chapterId} for plot holes, continuity errors, and logical inconsistencies.
        
        Project Context:
        Title: ${projectData.project.name}
        
        Chapter Text:
        ${chapterText}
        
        Perform a deep reasoning step to find subtle issues.
        `,
      });

      await addTaskLogEntry({
        generationId: generation.id,
        entry: {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: "tool_result",
          modelId: checkerModel,
          content: `Diagnostics run. Score: ${diagnostics.score}. Found ${diagnostics.issues.length} issues.`,
          metadata: { diagnostics },
        },
      });

      return {
        success: true,
        report: diagnostics,
      };
    },
  });
