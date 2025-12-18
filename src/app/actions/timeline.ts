"use server";

import { auth } from "@/app/(auth)/auth";
import { getProjectByIdWithAccess } from "@/lib/db/queries";
import { getGraphData, createTimelineBranch } from "@/lib/timeline-service";
import { generateObject } from "ai";
import { z } from "zod";
import { myProvider } from "@/lib/ai/providers";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { db } from "@/lib/db/drizzle"; // Fix import path
import { timelineNode } from "@/lib/db/schema/timeline";
import { eq } from "drizzle-orm";

export async function fetchGraphData(projectId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  // Verify access
  const project = await getProjectByIdWithAccess({ id: projectId, userId });
  if (!project) throw new Error("Unauthorized");

  return await getGraphData(projectId);
}

export async function branchTimeline({
  projectId,
  parentNodeId,
  decisionText,
}: {
  projectId: string;
  parentNodeId: string;
  decisionText: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  const project = await getProjectByIdWithAccess({ id: projectId, userId });
  if (!project) throw new Error("Unauthorized");

  // Fetch Context
  // Get parent node to understand context
  const parentNode = await db.query.timelineNode.findFirst({
    where: eq(timelineNode.id, parentNodeId),
  });

  if (!parentNode) throw new Error("Parent node not found");

  const contextText = parentNode.content || parentNode.summary || "Unknown context";

  // AI Generation
  const prompt = `
    You are the 'Butterfly Effect Engine'.
    The story context is: "${contextText}".

    The user creates a divergence: "${decisionText}".

    Analyze the immediate consequences of this change.
    Return a concise summary (max 3 sentences) of the new timeline's immediate direction.
    Also provide a 'title' for this new node.
  `;

  const { object } = await generateObject({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    schema: z.object({
      summary: z.string().describe("Concise summary of the immediate consequence"),
      title: z.string().describe("Short title for the new timeline node"),
    }),
    prompt: prompt,
  });

  // Persist
  const result = await createTimelineBranch({
    projectId,
    parentNodeId,
    decisionText: decisionText, // The branch name is the decision
    summary: object.summary,
  });

  return result;
}

export async function detectPivotPoints(text: string) {
    // Simple implementation for now: find sentences with "if", "decide", "choose" or just return meaningful chunks.
    // Or use AI.

    const { object } = await generateObject({
        model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
        schema: z.object({
            pivots: z.array(z.object({
                quote: z.string(),
                suggestion: z.string().describe("A suggested 'What If' question"),
            })),
        }),
        prompt: `Identify 1-3 'High Variance Moments' in this text where a different decision could change the plot.
        Text: "${text.substring(0, 2000)}"`, // Truncate for safety
    });

    return object.pivots;
}
