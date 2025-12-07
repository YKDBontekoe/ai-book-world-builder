import { generateObject, tool } from "ai";
import { z } from "zod";
import { getFullProjectDataForGeneration } from "@/lib/book-generation";
import { addTaskLogEntry, updateCanvasState } from "@/lib/db/queries";
import type { CanvasState } from "@/lib/db/schema";
import { getGatewayIdForRole } from "../model-routing";
import { retrieveContext } from "../rag";

export const orchestrateBook = tool({
  description:
    "The Brain. Analyzes project state and decides the next step in the book generation pipeline.",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project"),
    userRequest: z
      .string()
      .optional()
      .describe("Specific user instruction (e.g., 'Make chapter 3 scarier')"),
    currentCanvasState: z
      .any()
      .optional()
      .describe("Current state of the UI canvas"),
  }),
  execute: async (args: any) => {
    const { projectId, userRequest, currentCanvasState } = args;
    // 1. Fetch Project Data (Core Context)
    const projectData = await getFullProjectDataForGeneration({ projectId });

    if (!projectData) return { error: "Project data not found" };

    // 2. RAG Retrieval (Context Bank)
    // We retrieve context relevant to the user request or current active pane
    const query =
      userRequest ||
      `Current state of ${currentCanvasState?.activePane || "story"}`;
    const ragContext = await retrieveContext({
      query,
      candidates: [
        // Convert entities/outlines to text chunks for RAG
        ...projectData.entities.map((e) => ({
          content: `${e.name} (${e.kind}): ${e.summary || ""}`,
          metadata: { id: e.id, type: "entity" },
        })),
        ...projectData.outlines.map((o) => ({
          content: o.title + "\n" + (o.summary || ""),
          metadata: { id: o.id, type: "outline" },
        })),
        // Add more chunks as needed
      ],
      topK: 10,
    });

    // 3. Orchestrator Reasoning (Claude Opus 4.5)
    // It decides which granular tool to call next.
    const orchestratorModel = getGatewayIdForRole("orchestrator");

    // We generate a "decision" object
    const { object: decision } = await generateObject({
      model: orchestratorModel as any, // Cast for string compatibility
      schema: z.object({
        thoughtProcess: z.string().describe("Reasoning behind the decision"),
        nextAction: z.enum([
          "update_outline",
          "update_scenes",
          "draft_scene",
          "review_diagnostics",
          "update_bible",
          "none",
        ]),
        targetId: z
          .string()
          .optional()
          .describe("ID of the chapter/scene/entity to act on"),
        instructions: z
          .string()
          .describe("Specific instructions for the sub-tool"),
        suggestedCanvasPane: z
          .enum([
            "outline",
            "scenes",
            "draft",
            "diagnostics",
            "bible",
            "changes",
          ])
          .describe("Which pane should be active"),
      }),
      prompt: `
        You are the Orchestrator of a book generation pipeline.
        User Request: ${userRequest || "Continue generation based on current state"}
        
        Project Context:
        Title: ${projectData.project.name}
        Summary: ${projectData.project.description || "No summary"}
        Current Pane: ${currentCanvasState?.activePane}
        
        RAG Context:
        ${ragContext.map((c) => `- ${c.content}`).join("\n")}
        
        Analyze the request and state. Decide the next best action.
        - If the user wants to change plot -> update_outline or update_scenes
        - If the user wants to write -> draft_scene
        - If the user wants to check/fix -> review_diagnostics
        - If the user changed lore -> update_bible
      `,
    });

    // 4. Log the Orchestrator's thought
    await addTaskLogEntry({
      generationId: projectData.generation?.id || "temp", // Handle missing ID effectively in real impl
      entry: {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "orchestrator",
        modelId: orchestratorModel,
        content: decision.thoughtProcess,
        metadata: { action: decision.nextAction },
      },
    });

    // 5. Update Canvas State
    if (projectData.generation?.id) {
      await updateCanvasState({
        generationId: projectData.generation.id,
        canvasState: {
          activePane: decision.suggestedCanvasPane,
          paneState: currentCanvasState?.paneState || {},
          lastUpdated: new Date().toISOString(),
        },
      });
    }

    return {
      decision,
      ragContextUsed: ragContext.length,
    };
  },
});
