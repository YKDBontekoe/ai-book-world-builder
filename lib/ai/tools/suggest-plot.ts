import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
  getEntitiesForProject,
  getRelationshipsForProject,
} from "@/lib/db/queries";

export const suggestPlot = ({ session }: { session: Session | null }) =>
  tool({
    description:
      "Analyze the current project state and suggest plot points, story hooks, and narrative opportunities based on existing entities and relationships. Use this to help users discover story potential in their world.",
    inputSchema: z.object({
      projectId: z.string().describe("The ID of the project/world."),
      focus: z
        .enum(["conflict", "mystery", "romance", "adventure", "general"])
        .optional()
        .describe(
          "Optional focus area for plot suggestions. Defaults to 'general'."
        ),
    }),
    execute: async (args: any) => {
      const { projectId, focus = "general" } = args;

      if (!session?.user) {
        return { error: "Authentication required to suggest plot points." };
      }

      if (!projectId) {
        return { error: "Project ID is required to suggest plot points." };
      }

      try {
        const [entities, relationships] = await Promise.all([
          getEntitiesForProject({ projectId }),
          getRelationshipsForProject({ projectId }),
        ]);

        if (entities.length === 0) {
          return {
            message:
              "No entities found in this project. Create some characters, locations, or events first to generate plot suggestions.",
            suggestions: [],
          };
        }

        const suggestions: Array<{
          type: string;
          title: string;
          description: string;
          involvedEntities: string[];
        }> = [];

        // Analyze entity types
        const characters = entities.filter((e) => e.kind === "character");
        const locations = entities.filter((e) => e.kind === "location");
        const events = entities.filter((e) => e.kind === "event");
        const items = entities.filter((e) => e.kind === "item");

        // Find conflict relationships
        const conflicts = relationships.filter((r) =>
          ["enemy", "rival", "antagonist", "opposed"].includes(
            r.type.toLowerCase()
          )
        );

        // Find alliance relationships
        const alliances = relationships.filter((r) =>
          ["friend", "ally", "partner", "family"].includes(r.type.toLowerCase())
        );

        // Conflict-based suggestions
        if (focus === "conflict" || focus === "general") {
          for (const conflict of conflicts.slice(0, 3)) {
            const source = entities.find(
              (e) => e.id === conflict.sourceEntityId
            );
            const target = entities.find(
              (e) => e.id === conflict.targetEntityId
            );

            if (source && target) {
              suggestions.push({
                type: "conflict",
                title: `${source.name} vs ${target.name}`,
                description: `Explore the ${conflict.type} relationship between ${source.name} and ${target.name}. ${conflict.description || "What drives this conflict? How might it escalate?"}`,
                involvedEntities: [source.name, target.name],
              });
            }
          }

          // Suggest creating conflict if none exists
          if (conflicts.length === 0 && characters.length >= 2) {
            suggestions.push({
              type: "conflict",
              title: "Create Character Conflict",
              description: `You have ${characters.length} characters but no conflict relationships. Consider creating tension between ${characters[0].name} and ${characters[1]?.name || "another character"} to drive the story forward.`,
              involvedEntities: characters.slice(0, 2).map((c) => c.name),
            });
          }
        }

        // Mystery-based suggestions
        if (focus === "mystery" || focus === "general") {
          if (items.length > 0) {
            const mysteryItem = items[0];
            suggestions.push({
              type: "mystery",
              title: `The Secret of ${mysteryItem.name}`,
              description: `What hidden significance does ${mysteryItem.name} hold? Who seeks it and why? What happens when it's discovered?`,
              involvedEntities: [mysteryItem.name],
            });
          }

          if (events.length > 0) {
            const mysteryEvent = events[0];
            suggestions.push({
              type: "mystery",
              title: `Unraveling ${mysteryEvent.name}`,
              description: `What really happened during ${mysteryEvent.name}? Who knows the truth? What secrets remain hidden?`,
              involvedEntities: [mysteryEvent.name],
            });
          }
        }

        // Romance-based suggestions
        if (
          (focus === "romance" || focus === "general") &&
          characters.length >= 2
        ) {
          // Find characters without romantic relationships
          const romanticTypes = ["lover", "spouse", "romantic"];
          const hasRomance = relationships.some((r) =>
            romanticTypes.some((rt) => r.type.toLowerCase().includes(rt))
          );

          if (!hasRomance) {
            suggestions.push({
              type: "romance",
              title: "Unexpected Connection",
              description: `Could there be romantic tension between ${characters[0].name} and ${characters[1]?.name || "another character"}? What obstacles stand in their way?`,
              involvedEntities: characters.slice(0, 2).map((c) => c.name),
            });
          }
        }

        // Adventure-based suggestions
        if (
          (focus === "adventure" || focus === "general") &&
          locations.length > 0 &&
          characters.length > 0
        ) {
          const destination = locations[0];
          const hero = characters[0];

          suggestions.push({
            type: "adventure",
            title: `Journey to ${destination.name}`,
            description: `${hero.name} must travel to ${destination.name}. What dangers await? What will they discover? Who will they meet along the way?`,
            involvedEntities: [hero.name, destination.name],
          });
        }

        // Alliance-based suggestions
        if (alliances.length > 0 && focus === "general") {
          const alliance = alliances[0];
          const source = entities.find((e) => e.id === alliance.sourceEntityId);
          const target = entities.find((e) => e.id === alliance.targetEntityId);

          if (source && target) {
            suggestions.push({
              type: "alliance",
              title: "Testing Loyalty",
              description: `The ${alliance.type} bond between ${source.name} and ${target.name} will be tested. What could drive them apart? How will they overcome it?`,
              involvedEntities: [source.name, target.name],
            });
          }
        }

        // General suggestions based on gaps
        if (suggestions.length === 0) {
          suggestions.push({
            type: "general",
            title: "Build Your World",
            description: `You have ${entities.length} entities. Consider adding more relationships between them to create story dynamics, or add more diverse entity types (characters, locations, events, items) to enrich your world.`,
            involvedEntities: [],
          });
        }

        return {
          message: `Generated ${suggestions.length} plot suggestions based on your world's ${entities.length} entities and ${relationships.length} relationships.`,
          suggestions,
          worldState: {
            totalEntities: entities.length,
            characters: characters.length,
            locations: locations.length,
            events: events.length,
            items: items.length,
            relationships: relationships.length,
            conflicts: conflicts.length,
            alliances: alliances.length,
          },
        };
      } catch (error) {
        return {
          error: `Failed to generate plot suggestions: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });
