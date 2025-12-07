import { generateObject, tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getFullProjectDataForGeneration } from "@/lib/book-generation";
import { getGatewayIdForRole } from "../model-routing";

export const assessReadiness = ({
  session,
  projectId,
}: {
  session: Session | null;
  projectId?: string;
}) =>
  tool({
    description:
      "Analyze the current project state and assess readiness for book generation. Returns scores, warnings, and recommendations. Users can still proceed even if readiness is low.",
    inputSchema: z.object({
      projectId: z
        .string()
        .optional()
        .describe("Project ID (uses current project if not specified)"),
    }),
    execute: async (args) => {
      const targetProjectId = args.projectId || projectId;

      if (!session?.user) {
        return { error: "Authentication required." };
      }

      if (!targetProjectId) {
        return {
          overallScore: 0,
          dimensions: {
            characters: { score: 0, feedback: "No project selected yet" },
            worldBuilding: { score: 0, feedback: "Select a project to begin" },
            plotStructure: {
              score: 0,
              feedback: "Start by creating a project",
            },
          },
          warnings: ["No project selected. Create or select a project first."],
          recommendations: [
            "Create a new project or select an existing one",
            "Tell me about your book idea and I'll help you get started",
          ],
          canProceed: false,
        };
      }

      const projectData = await getFullProjectDataForGeneration({
        projectId: targetProjectId,
        userId: session.user.id,
      });

      if (!projectData) {
        return { error: "Project not found." };
      }

      // Count entities by type
      const characters = projectData.entities.filter(
        (e) => e.kind === "character"
      );
      const locations = projectData.entities.filter(
        (e) => e.kind === "location"
      );
      const items = projectData.entities.filter((e) => e.kind === "item");
      const events = projectData.entities.filter((e) => e.kind === "event");
      const organizations = projectData.entities.filter(
        (e) => e.kind === "organization"
      );

      const outlines = projectData.outlines || [];
      const chapters = projectData.volumes.flatMap((v) => v.chapters) || [];

      // AI-powered readiness assessment
      const checkerModel = getGatewayIdForRole("checker");

      const { object: assessment } = await generateObject({
        model: checkerModel as any,
        schema: z.object({
          characterScore: z
            .number()
            .min(0)
            .max(100)
            .describe("Character development readiness"),
          characterFeedback: z
            .string()
            .describe("Brief feedback on characters"),
          worldScore: z
            .number()
            .min(0)
            .max(100)
            .describe("World-building readiness"),
          worldFeedback: z
            .string()
            .describe("Brief feedback on world-building"),
          plotScore: z
            .number()
            .min(0)
            .max(100)
            .describe("Plot structure readiness"),
          plotFeedback: z.string().describe("Brief feedback on plot structure"),
          warnings: z
            .array(z.string())
            .describe("Issues that might affect book quality"),
          recommendations: z
            .array(z.string())
            .describe("Suggested next actions"),
          overallAssessment: z
            .string()
            .describe("Brief overall assessment message"),
        }),
        prompt: `You are a book development advisor. Assess readiness for writing a book based on this project state:

Project: "${projectData.project.name}"
Description: ${projectData.project.description || "No description"}

Characters (${characters.length}): ${characters.map((c) => c.name).join(", ") || "None"}
Locations (${locations.length}): ${locations.map((l) => l.name).join(", ") || "None"}
Items (${items.length}): ${items.map((i) => i.name).join(", ") || "None"}
Events (${events.length}): ${events.map((e) => e.name).join(", ") || "None"}
Organizations (${organizations.length}): ${organizations.map((o) => o.name).join(", ") || "None"}

Outlines: ${outlines.length}
Chapters: ${chapters.length}

Score each dimension 0-100 based on:
- Characters: Needs at least a protagonist, ideally 3-5 main characters with defined traits
- World: Needs at least 2-3 locations, some items/organizations for richness
- Plot: Needs an outline with story beats/chapters planned

Be encouraging but honest. A score of 30+ means "can try writing". 60+ is "well-prepared". 80+ is "excellent foundation".

Provide 1-3 actionable recommendations based on what's weakest.`,
      });

      const overallScore = Math.round(
        (assessment.characterScore +
          assessment.worldScore +
          assessment.plotScore) /
          3
      );

      return {
        overallScore,
        dimensions: {
          characters: {
            score: assessment.characterScore,
            feedback: assessment.characterFeedback,
          },
          worldBuilding: {
            score: assessment.worldScore,
            feedback: assessment.worldFeedback,
          },
          plotStructure: {
            score: assessment.plotScore,
            feedback: assessment.plotFeedback,
          },
        },
        warnings: assessment.warnings,
        recommendations: assessment.recommendations,
        overallAssessment: assessment.overallAssessment,
        canProceed: overallScore >= 20, // Low bar - always let users proceed with warning
        projectStats: {
          characters: characters.length,
          locations: locations.length,
          items: items.length,
          events: events.length,
          organizations: organizations.length,
          outlines: outlines.length,
          chapters: chapters.length,
        },
      };
    },
  });
